require('dotenv').config();

const express = require('express');
const app = express();
const port = process.env.PORT;
const { User } = require('./models/User');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const {
    signAccessToken,
    createRefreshToken,
    hashRefreshToken,
    getRefreshTokenExpiryMs,
    getRefreshCookieOptions,
} = require('./lib/tokens');

//application/json 형식으로 들어오는 데이터를 파싱
app.use(express.json());
//application/x-www-form-urlencoded 형식으로 들어오는 데이터를 파싱
app.use(express.urlencoded({ extended: true }));
//cookie-parser를 사용하여 쿠키를 파싱
app.use(cookieParser());

// 프론트에서 받은 access token 검증해서 유효하면 다음 로직으로 넘기는 미들웨어
function requireAccessToken(req, res, next) {
    const header = req.headers.authorization || '';
    // 'Bearer ' 제외하고 토큰만 꺼냄냄
    const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;

    if (!token) {
        return res.status(401).json({ success: false, message: 'Missing access token' });
    }

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return res.status(500).json({ success: false, message: 'JWT_SECRET is not configured' });
        }        
        req.user = jwt.verify(token, secret);  // 토큰 위조여부, 만료여부 확인
        return next();  // 다음 로직으로 넘겨!
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid or expired access token' });
    }
}

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

app.get('/', (req, res) => res.send('Hello World My NodeJS Demo'));
app.post('/register', (req, res) => {
    //회원가입 시 필요한 정보들을 데이터베이스에 저장
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
    });
    //mongoose에서 제공하는 save 메서드를 사용하여 데이터를 저장
    user.save()
    .then(() => {
        return res.status(200).json({ success: true });
    })
    .catch(err => {
        return res.json({ success: false, err });
    });
});

async function loginHandler(req, res) {
    const body = req.body || {};
    const email = body.email;
    const password = body.password;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'email and password are required' });
    }

    try {
        //mongoose에서 제공하는 findOne 메서드를 사용하여 email과 일치하는 데이터를 찾음
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: '해당 유저가 존재하지 않습니다.' });
        }
        //입력받은 비밀번호를를 암호화하여 저장된 비밀번호와 비교
        const ok = await user.comparePassword(password);
        if (!ok) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const accessToken = signAccessToken(user);  // access token 생성
        const refreshToken = createRefreshToken();  // refresh token 생성
        const refreshTokenHash = hashRefreshToken(refreshToken);  // refresh token 해싱

        user.refreshTokenHash = refreshTokenHash;
        user.refreshTokenExp = Date.now() + getRefreshTokenExpiryMs();
        await user.save();  // refresh token 해싱 + 유효기간 DB에 저장

        res.cookie('refresh_token', refreshToken, getRefreshCookieOptions());  // 쿠키에 refresh token 저장
        return res.status(200).json({ success: true, accessToken });  // 로그인 처리하고 access token 전달
    } catch (err) {
        return res.status(500).json({ success: false, err: err?.message || err });
    }
}

app.post('/auth/login', loginHandler);
app.post('/auth/refresh', async (req, res) => {
    try {
        const refreshToken = req.cookies?.refresh_token;  // 쿠키에서 refresh token 가져옴
        if (!refreshToken) {
            return res.status(401).json({ success: false, message: 'Missing refresh token' });
        }

        const refreshTokenHash = hashRefreshToken(refreshToken);  // 쿠키에서 가져온 refresh token 해싱
        const user = await User.findOne({
            refreshTokenHash,
            refreshTokenExp: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
        }

        // Rotate refresh token (1회 사용후 폐기)
        const newRefreshToken = createRefreshToken();
        user.refreshTokenHash = hashRefreshToken(newRefreshToken);
        user.refreshTokenExp = Date.now() + getRefreshTokenExpiryMs();
        await user.save();

        const accessToken = signAccessToken(user);  // access token 재생성
        res.cookie('refresh_token', newRefreshToken, getRefreshCookieOptions());  // 쿠키에 새로 생성한 refresh token 저장
        return res.status(200).json({ success: true, accessToken });  // 로그인 처리하고 access token 전달
    } catch (err) {
        return res.status(500).json({ success: false, err: err?.message || err });
    }
});

app.post('/auth/logout', async (req, res) => {
    try {
        const refreshToken = req.cookies?.refresh_token;  // 쿠키에서 refresh token 가져옴
        if (refreshToken) {
            const refreshTokenHash = hashRefreshToken(refreshToken);
            await User.updateOne(
                { refreshTokenHash },
                { $unset: { refreshTokenHash: 1, refreshTokenExp: 1 } },
            );
        }

        res.clearCookie('refresh_token', getRefreshCookieOptions());  // 쿠키에서 refresh token 제거
        return res.status(200).json({ success: true });
    } catch (err) {
        return res.status(500).json({ success: false, err: err?.message || err });
    }
});

// access token 확인용
app.get('/me', requireAccessToken, (req, res) => {
    return res.status(200).json({ success: true, user: req.user });
});

// 서버의 등록된 api 목록 확인용
if (process.env.NODE_ENV !== 'production') {
    app.get('/__debug/routes', (req, res) => {
        const stack = app?._router?.stack || app?.router?.stack || [];
        const routes = [];
        for (const layer of stack) {
            if (layer?.route?.path) {
                const methods = Object.keys(layer.route.methods || {}).filter((m) => layer.route.methods[m]);
                routes.push({ path: layer.route.path, methods });
            }
        }
        return res.status(200).json({ success: true, routes });
    });
}
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
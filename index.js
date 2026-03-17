require('dotenv').config();

const express = require('express');
const app = express();
const port = process.env.PORT;
const { User } = require('./models/User');

//application/json 형식으로 들어오는 데이터를 파싱
app.use(express.json());
//application/x-www-form-urlencoded 형식으로 들어오는 데이터를 파싱
app.use(express.urlencoded({ extended: true }));

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
    //mongoDB에서 제공하는 save 메서드를 사용하여 데이터를 저장
    user.save()
    .then(() => {
        return res.status(200).json({ success: true });
    })
    .catch(err => {
        return res.json({ success: false, err });
    });
});

app.post('/login', (req, res) => {
    const body = req.body || {};
    const email = body.email;
    const password = body.password;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'email and password are required' });
    }

    return User.findOne({ email })
        .then((user) => {
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }

            return user.comparePassword(password).then((ok) => {
                if (!ok) {
                    return res.status(401).json({ success: false, message: 'Invalid credentials' });
                }

                return res.status(200).json({ success: true });
            });
        })
        .catch((err) => {
            return res.status(500).json({ success: false, err });
        });
});
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
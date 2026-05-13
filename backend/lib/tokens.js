const crypto = require('crypto');
const jwt = require('jsonwebtoken');

//jwt secret 가져오기
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    const err = new Error('JWT_SECRET is not configured');
    err.code = 'JWT_SECRET_MISSING';
    throw err;
  }
  return secret;
}

//access token 생성 후 return
function signAccessToken(user, opts = {}) {
  const secret = getJwtSecret();
  const expiresIn = opts.expiresIn || process.env.ACCESS_TOKEN_TTL || '15m';

  //jwt 생성
  return jwt.sign(
    { sub: user._id.toString(), email: user.email, role: user.role },
    secret,
    { expiresIn },
  );
}

//refresh token 생성
function createRefreshToken() {
  // 32 bytes => 43 chars base64url; high entropy random token
  return crypto.randomBytes(32).toString('base64url');
}

//refresh token을 sha256으로 해싱해서 base64url 문자열로 return
//DB유출 시 무제한 토큰 재발급 가능성 있으므로 해싱해서 저장
//sha256 사용 이유: 빠르고, 단방향이므로 복호화 불가
function hashRefreshToken(refreshToken) {
  return crypto.createHash('sha256').update(refreshToken).digest('base64url');
}

//refresh token 유효기간 ms로 return
function getRefreshTokenExpiryMs() {
  const daysRaw = process.env.REFRESH_TOKEN_TTL_DAYS;
  const days = daysRaw ? Number(daysRaw) : 30;
  if (!Number.isFinite(days) || days <= 0) return 30 * 24 * 60 * 60 * 1000;
  return Math.floor(days * 24 * 60 * 60 * 1000);
}

//개발 or 운영에 따라 cookieOption 설정
function getRefreshCookieOptions() {
  // later deploy behind a proxy (nginx), add: app.set('trust proxy', 1)
  const isProd = process.env.NODE_ENV === 'production';
  const secure = process.env.COOKIE_SECURE
    ? process.env.COOKIE_SECURE === 'true'
    : isProd;

  return {
    httpOnly: true,  // document.cookie에서 접근불가 true
    secure,  // https에서만 쿠키 전송할지 결정
    sameSite: 'lax',  // 같은 site에서만 쿠키 전송 (cross site 불가하게) => 추후 변경 예정
    path: '/auth',  // 해당 api에서만 쿠키 사용 범위 한정 (단, 다른 api에서도 쿠키 설정은 가능함. 쿠키 사용은 불가)
  };
}

module.exports = {
  signAccessToken,
  createRefreshToken,
  hashRefreshToken,
  getRefreshTokenExpiryMs,
  getRefreshCookieOptions,
};

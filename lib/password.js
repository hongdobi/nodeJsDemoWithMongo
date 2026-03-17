const crypto = require('crypto');
const { promisify } = require('util');

//crypto.scrypt는 콜백 함수를 사용하는 비동기 함수이므로, promisify를 사용하여 동기 함수로 변환
const scryptAsync = promisify(crypto.scrypt);

//scrypt 함수의 기본 파라미터
const DEFAULT_PARAMS = {
  N: 16384, // CPU/memory cost
  r: 8, // block size
  p: 1, // parallelization
  keylen: 64, // output length
  saltBytes: 16, // salt length
};

//Buffer는 0,1 로 이루어진 바이트 배열을 표현하는 객체
//timingSafeEqual 함수는 두 개의 버퍼를 비교하여 같은지 확인
function timingSafeEqual(a, b) {
  const aBuf = Buffer.isBuffer(a) ? a : Buffer.from(a);
  const bBuf = Buffer.isBuffer(b) ? b : Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

async function hashPassword(password, params = DEFAULT_PARAMS) {
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error('Password must be a non-empty string');
  }

  //crypto.randomBytes는 랜덤한 바이트 배열을 생성
  const salt = crypto.randomBytes(params.saltBytes);
  //실제 해시 함수 호출하여 해시 값을 생성
  const derivedKey = await scryptAsync(password, salt, params.keylen, {
    N: params.N,
    r: params.r,
    p: params.p,
  });

  // 저장 형식: scrypt$N$r$p$saltBase64$hashBase64
  return [
    'scrypt',
    String(params.N),
    String(params.r),
    String(params.p),
    salt.toString('base64'),
    Buffer.from(derivedKey).toString('base64'),
  ].join('$');
}

async function verifyPassword(password, stored) {
  if (typeof password !== 'string' || password.length === 0) return false;
  if (typeof stored !== 'string') return false;

  //저장된 해시 값을 분해
  const parts = stored.split('$');
  if (parts.length !== 6) return false; 
  const [alg, Nstr, rstr, pstr, saltB64, hashB64] = parts;
  //해시 알고리즘이 scrypt인지 확인
  if (alg !== 'scrypt') return false;

  //N, r, p 값을 숫자로 변환
  const N = Number(Nstr);
  const r = Number(rstr);
  const p = Number(pstr);
  //N, r, p 값이 숫자인지 확인
  if (!Number.isFinite(N) || !Number.isFinite(r) || !Number.isFinite(p)) return false;

  //salt를 버퍼로 변환
  const salt = Buffer.from(saltB64, 'base64');
  //expected를 버퍼로 변환
  const expected = Buffer.from(hashB64, 'base64');
  if (expected.length === 0) return false;

  //입력받은 비밀번호로 해시값을 생성
  const derivedKey = await scryptAsync(password, salt, expected.length, { N, r, p });
  //timingSafeEqual 함수를 사용하여 생성된 해시값과 저장된 해시값을 비교
  return timingSafeEqual(Buffer.from(derivedKey), expected);
}

module.exports = {
  hashPassword,
  verifyPassword,
};


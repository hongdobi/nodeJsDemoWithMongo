##[Project Overview]
Node.js와 Express 기반의 인증 시스템을 구현한 백엔드 프로젝트입니다.

##[Tech Stack]
```
- Node.js
- Express.js
- MongoDB
- Mongoose
- crypto.scrypt
- JSON Web Token (JWT)
- cookie-parser
```

##[Key Feature]
```
### 1. 환경 변수 관리
- `.env`를 사용하여 민감 정보 보호 (*DB 접속정보, JWT secret 등)
- Git에 노출되지 않도록 `.gitignore` 설정

### 2. 안전한 비밀번호 저장
- `crypto.scrypt`를 사용하여 비밀번호 해싱
- 해시 문자열에 scrypt 파라미터(N,r,p)와 salt를 함께 저장하여 확장성을 고려하였습니다. (ex. scrypt$16384$8$1$salt$hash)
- 비밀번호 비교 시 `crypto.timingSafeEqual`을 사용하여 문자열 비교 시간 차이를 이용한 타이밍 공격을 방어했습니다.

### 3. JWT 인증 시스템
- Access Token: JWT (짧은 만료 시간, 15분)
- Refresh Token: 랜덤 토큰 (DB 저장 + 회전)
- Refresh Token은 JWT가 아닌 crypto.randomBytes(32) 기반으로 생성하였습니다. (ex. crypto.randomBytes(32).toString('base64url'))

### 4. Refresh Token Rotation
- Refresh Token을 해싱하여 DB 저장(crypto.createHash('sha256') 해시로 저장 -> sha256 사용 이유: 빠르고, 단방향이므로 복호화 불가)
- 재발급 시 기존 토큰 폐기 및 새 토큰 발급

### 5. 인증 미들웨어
- Authorization 헤더에서 토큰 추출
- `jwt.verify`로 위조 및 만료 검증

### 6. 쿠키 보안
- httpOnly: XSS로부터 보호(document.cookie에서 접근 불가하도록 설정)
- secure: HTTPS에서만 전송
- sameSite: CSRF 공격 완화
- path 제한: 특정 API 경로로 범위 제한(다른 api에서도 쿠키 설정은 가능하나, 쿠키 사용은 불가)
```

##[Authentication Flow]
```
###<Security Highlight>
- 비밀번호를 평문이 아닌 scrypt 해시로 저장
- timingSafeEqual을 사용하여 타이밍 공격 방어
- Refresh Token을 DB에 해싱 저장 (탈취 대비)
- Refresh Token Rotation 적용
- Access Token 짧은 만료 시간 설정 (15분)

1. 로그인 성공 시
   - Access Token 발급 (15분)
   - Refresh Token 발급 (쿠키 저장 + DB 해싱 저장)

2. Access Token 만료 시
   - Refresh Token으로 재발급 요청

3. 서버 검증
   - 쿠키의 Refresh Token 해싱 후 DB 비교
   - 일치 시 새로운 Access Token 발급
   - Refresh Token Rotation 수행

4. 보호된 API 요청
   - Authorization 헤더의 Access Token 검증
```

##[Comment]
```
1. Why crypto.scrypt?
-> bcrypt 대신 node.js 내장 모듈인 crypto를 사용하여 saltByte, keyLength 등을 직접 커스터마이징 하고자 하였습니다.
이를 통해 salt 관리, 해시 비교(timingSafeEqual), 토큰 보관 방식까지 보안 설계를 직접 제어했습니다.

2. JWT 설계
-> 짧은 Access Token(15분)으로 노출 위험을 줄이고, Refresh Token 역할 분리로 안정성을 고려하여 설계했습니다.
```


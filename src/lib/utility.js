const jwt = require('jsonwebtoken');
const util = require('util');

const signToken = util.promisify(jwt.sign);

/**
 *  @function
 *  3 시간의 수명을 가지는 `accessToken` 을 발행하는 함수
 *  사용자 인증이 필요한 자원에 접근할 때 사용된다.
 *  @param userInfo 토큰 payload 에 실을 최소한의 정보만 담는 객체
 *  @param secret 토큰 서명 시 사용되는 비밀 키
 */
exports.signAccessToken = (userInfo, secret) => {
  const tokenOption = {
    expiresIn: '3h',
    issuer: 'where-is-my-cup',
    subject: 'accessToken',
  };
  return signToken(userInfo, secret, tokenOption);
};

/**
 *  @function
 *  14 일의 수명을 가지는 `refreshToken` 을 발행하는 함수
 *  `accessToken` 을 재발행 할 때 사용된다.
 *  @param userInfo 토큰 payload 에 실을 최소한의 정보만 담는 객체
 *  @param secret 토큰 서명 시 사용되는 비밀 키
 */
exports.signRefreshToken = (userInfo, secret) => {
  const tokenOption = {
    expiresIn: '14d',
    issuer: 'where-is-my-cup',
    subject: 'refreshToken',
  };
  return signToken(userInfo, secret, tokenOption);
};

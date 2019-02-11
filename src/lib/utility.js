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

const log4js = require('log4js');
log4js.configure(require('../../config').log4js);

exports.getLogger = logger => log4js.getLogger(logger);

exports.getDistance = (lat1, lng1, lat2, lng2) => {
  const deg2rad = deg => deg * (Math.PI / 180);
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
    + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2))
    * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

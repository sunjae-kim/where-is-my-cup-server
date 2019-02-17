const jwt = require('jsonwebtoken');
const util = require('util');
const log4js = require('log4js');
log4js.configure(require('../../config').log4js);

const jwtSign = util.promisify(jwt.sign);

/**
 *  @function
 *  `JsonWebToken` 을 발행하는 함수 사용자 인증이 필요한 자원에 접근할 때 사용된다.
 *  @param {string} token `x-access-token` 또는 `x-refresh-token` 이 입력된다.
 */
exports.signToken = token => (userInfo, secret) => {
  const expiresIn = token === 'x-access-token' ? '3h' : '14d';
  const tokenOption = {
    expiresIn,
    issuer: 'where-is-my-cup',
    subject: token,
  };
  return jwtSign(userInfo, secret, tokenOption);
};

/**
 * @function
 * 환경설정이 된 `log4js` 에서 로거를 생성하는 함수
 * @param {string} logger 로거의 카테고리를 정의한다.
 */
exports.getLogger = logger => log4js.getLogger(logger);

/**
 * @function
 * 두 곳의 위도경고 값을 받아서 위치를 `km` 단위로 반환해주는 함수
 * @param {number} lat1 첫번째 위치의 latitude
 * @param {number} lng1 첫번째 위치의 longitude
 * @param {number} lat2 두번째 위치의 latitude
 * @param {number} lng2 두번째 위치의 longitude
 */
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

exports.getRandom = (arr) => {
  let len = arr.length;
  let n = len > 5 ? 5 : len;
  const result = [];
  const taken = [];
  while (n) {
    n -= 1; len -= 1;
    const x = Math.floor(Math.random() * len);
    result[n] = arr[x in taken ? taken[x] : x];
    taken[x] = len in taken ? taken[len] : len;
  }
  return result;
};

exports.logError = (error, logger, req) => {
  const {
    method, originalUrl, body, headers,
  } = req;
  logger.error('==================================================');
  logger.error(`@ ${method} ${originalUrl}`);
  logger.error(error);
  logger.error(headers);
  logger.error(body);
};

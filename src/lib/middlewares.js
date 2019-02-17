const bcrypt = require('bcrypt');
const util = require('util');
const jwt = require('jsonwebtoken');
const logger = require('./utility').getLogger('Middleware');

const verifyToken = util.promisify(jwt.verify);

/**
 * @middleware
 *  1. Token 의 유효성을 확인한다. 토큰이 헤더에 없을 시 `400` status 응답
 *  2. Token 유효할 시 검증 성공 `next` 실행
 *  3. Token 만료 시 `401` status 응답
 * @param {string} token `x-access-token` 또는 `x-refresh-token` 이 입력된다.
 */
exports.checkToken = token => async (req, res, next) => {
  logger.trace('############################################################');
  logger.trace('@ Verifying token');
  // Token 이 잘 실려있는지 확인한다.
  logger.trace();
  logger.trace('(1/2) Looking for token from header');
  try {
    const secret = req.app.get('jwt-secret');
    const JsonWebToken = req.headers[token];
    if (!JsonWebToken) throw Error('Token is not found');
    logger.trace(`#### Found '${token}' ####`);
    logger.debug(JsonWebToken);

    // Token 의 만료여부를 확인한다.
    logger.trace();
    logger.trace('(2/2) Verifying the token');
    const tokenPayload = await verifyToken(JsonWebToken, secret);
    logger.trace('#### Token Payload ####');
    Object.entries(tokenPayload).forEach((data) => {
      const key = data[0]; let value = data[1];
      if (key === 'iat' || key === 'exp') value = new Date(value * 1000).toLocaleString();
      logger.debug(`${key}  : ${value}`);
      if (key === 'sub') if (value !== token) { logger.error(`The token '${value}' should be '${token}'`); throw Error('Token is invalid'); }
    });
    req.tokenPayload = tokenPayload;
    return next();
  } catch (error) {
    if (error.expiredAt) {
      logger.error(`Token expried at '${error.expiredAt.toLocaleString()}'`);
    } else {
      logger.error(error.message);
    }
    return res.status(401).send(error.message);
  } finally {
    logger.trace('');
    logger.trace('Finish work!');
  }
};

/**
 * @middleware
 * 현재 위치에서 카페 까지의 거리를 계산하는 route 에서 사용된다.
 * `headers` 에서 넘어오는 `latitude` 와 `longitude` 를 number type 으로 변환한다.
 */
exports.headerParser = (req, res, next) => {
  const { latitude, longitude } = req.headers;
  req.headers.latitude = Number(latitude);
  req.headers.longitude = Number(longitude);
  next();
};

/**
 *  @middleware
 *  `bcrypt` 모듈로 암호화를 진행한다. `saltRound` 는 10회 적용된다.
 *  비밀번호가 입력되지 않을 시 `403` status code 로 오류메세지를 응답한다.
 */
exports.encrptPassword = async (req, res, next) => {
  const { password } = req.body;
  const saltRounds = 10;
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    req.body.password = hash;
    next();
  } catch (error) {
    logger.error(error);
    res.status(403).send('비밀번호를 입력하지 않았습니다.');
  }
};

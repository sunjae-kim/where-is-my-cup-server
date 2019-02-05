const bcrypt = require('bcrypt');
const util = require('util');
const jwt = require('jsonwebtoken');
const logger = require('./utility').getLogger('Middleware');

const verifyToken = util.promisify(jwt.verify);
const { signAccessToken } = require('./utility');

/**
 *  @middleware
 *  Token 의 유효성을 확인한다. 토큰이 헤더에 없을 시 `400` status 응답
 *  1. Access Token 유효할 시 검증 성공 `next` 실행
 *  2. Access Token 만료 시 Refresh Token 을 확인하여 Access Token 재발급 후 `next` 실행
 *  3. Refresh Token 만료 시 사용자 재인증 필요 `401` status 응답
 */
exports.authenticate = async (req, res, next) => {
  logger.trace('@ Authenticate : Checking access token');
  const secret = req.app.get('jwt-secret');
  // Token 이 잘 실려있는지 확인한다.
  const accessToken = req.headers['x-access-token'];
  const refreshToken = req.headers['x-refresh-token'];
  if (!(accessToken && refreshToken)) {
    logger.error('Token is not found');
    return res.status(400).send('@ Authenticate : Token is not found');
  }

  // Access Token 의 만료여부를 확인한다.
  try {
    await verifyToken(accessToken, secret);
    return next();
  } catch (error) {
    logger.warn(`@ Authenticate : Access ${error.message}`);
  }

  // Refresh Token 의 만료여부를 확인한다.
  logger.trace('@ Authenticate : Checking refresh token');
  try {
    const result = await verifyToken(refreshToken, secret);
    const { _id, email } = result;
    const newAccessToken = await signAccessToken({ _id, email }, secret);
    res.set('x-access-token', newAccessToken);
    logger.info('@ Authenticate : New access token has been issued :)');
    return next();
  } catch (error) {
    logger.warn(`@ Authenticate : Refresh ${error.message}`);
    return res.status(401).send('모든 토큰이 만료되었습니다 ;(');
  }
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

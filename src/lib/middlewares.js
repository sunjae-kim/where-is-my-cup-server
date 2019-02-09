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
  logger.trace('@ Authentication : Checking token');
  const secret = req.app.get('jwt-secret');
  // Token 이 잘 실려있는지 확인한다.
  const JsonWebToken = req.headers[token];
  if (!JsonWebToken) {
    logger.error('Token is not found');
    return res.status(400).send('@ Authentication : Token is not found');
  }

  // Token 의 만료여부를 확인한다.
  try {
    const tokenPayload = await verifyToken(JsonWebToken, secret);
    req.tokenPayload = tokenPayload;
    return next();
  } catch (error) {
    logger.error(`@ Authentication : ${error.message}`);
    return res.status(401).send('토큰이 만료되었습니다 ;(');
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

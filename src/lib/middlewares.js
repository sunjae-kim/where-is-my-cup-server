const logger = require('log4js').getLogger();
const bcrypt = require('bcrypt');

logger.level = 'trace';

exports.authenticate = (req, res, next) => {
  logger.trace('@ Authenticate : Entering authentication middleware');
  logger.trace('@ Authenticate : This request is authenticated');
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

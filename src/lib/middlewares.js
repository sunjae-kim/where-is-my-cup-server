const logger = require('log4js').getLogger();

logger.level = 'trace';

exports.authenticate = (req, res, next) => {
  logger.info('@ Authenticate : Entering authentication middleware');
  logger.info('@ Authenticate : This request is authenticated');
  next();
};

const logger = require('log4js').getLogger();

logger.level = 'trace';

exports.authenticate = (req, res, next) => {
  logger.trace('@ Authenticate : Entering authentication middleware');
  logger.trace('@ Authenticate : This request is authenticated');
  next();
};

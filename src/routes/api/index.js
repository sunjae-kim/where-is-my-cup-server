const route = require('express').Router();
const { middlewares: { checkToken } } = require('../../lib');

const checkAccessToken = checkToken('x-access-token');

route.use('/cafe', checkAccessToken, require('./cafe'));
route.use('/users', checkAccessToken, require('./users'));

module.exports = route;

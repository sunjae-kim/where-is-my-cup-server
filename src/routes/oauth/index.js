const route = require('express').Router();
const oauthController = require('./oauth.controller');
const { middlewares: { encryptPassword, checkToken } } = require('../../lib');

const checkRefreshToken = checkToken('x-refresh-token');

route.post('/local/login', oauthController.login);
route.post('/local/register', encryptPassword, oauthController.register);
route.get('/access', checkRefreshToken, oauthController.access);

module.exports = route;

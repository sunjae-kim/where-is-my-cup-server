const route = require('express').Router();
const oauthController = require('./oauth.controller');
const { encrptPassword, checkToken } = require('../../lib');

const checkRefreshToken = checkToken('x-refresh-token');

route.post('/local/login', oauthController.login);
route.post('/local/register', encrptPassword, oauthController.register);
route.get('/access', checkRefreshToken, oauthController.access);

module.exports = route;

const route = require('express').Router();
const controller = require('./user.controller');
const { middlewares: { checkToken } } = require('../../../lib');

const checkAccessToken = checkToken('x-access-token');

route.get('/list', controller.getList);

route.get('/favorites', checkAccessToken, controller.getFavorites);
route.post('/favorites', checkAccessToken, controller.postFavorites);

module.exports = route;

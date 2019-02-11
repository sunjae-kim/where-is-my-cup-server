const route = require('express').Router();
const controller = require('./user.controller');
const { middlewares: { checkToken } } = require('../../../lib');

const checkAccessToken = checkToken('x-access-token');

route.get('/list', controller.getList);

route.get('/favorites/:id', checkAccessToken, controller.getFavorites);
route.post('/favorites/:id', checkAccessToken, controller.postFavorites);

module.exports = route;

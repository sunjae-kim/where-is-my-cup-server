const route = require('express').Router();
const controller = require('./cafe.controller');
const { checkToken } = require('../../../lib');

const checkAccessToken = checkToken('x-access-token');

// detail
route.get('/detail/:id', checkAccessToken, controller.getDetail);
route.post('/detail', checkAccessToken, controller.postDetail);

// list
route.get('/list/:query', checkAccessToken, controller.getList);

module.exports = route;

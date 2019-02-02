const route = require('express').Router();
const controller = require('./cafe.controller');
const { authenticate } = require('../../../lib').middlewares;

// detail
route.get('/detail/:id', authenticate, controller.getDetail);
route.post('/detail', authenticate, controller.postDetail);

// list
route.get('/list/:query', authenticate, controller.getList);

module.exports = route;

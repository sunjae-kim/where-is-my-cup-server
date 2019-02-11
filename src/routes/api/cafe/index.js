const route = require('express').Router();
const controller = require('./cafe.controller');
const { checkToken } = require('../../../lib');

const checkAccessToken = checkToken('x-access-token');

route.get('/detail/:id', checkAccessToken, controller.getDetail);
route.post('/detail', checkAccessToken, controller.postDetail);

route.get('/curLoc/:latitude/:longitude', controller.curLoc);

route.get('/search/:query', controller.search);

route.post('/feedback', controller.feedback);

module.exports = route;

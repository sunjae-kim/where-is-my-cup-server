const route = require('express').Router();
const controller = require('./cafe.controller');
const { middlewares: { checkToken, headerParser } } = require('../../../lib');

const checkAccessToken = checkToken('x-access-token');

route.get('/detail/:id', checkAccessToken, headerParser, controller.getDetail);
route.post('/detail', checkAccessToken, controller.postDetail);

route.get('/tags/:id', checkAccessToken, controller.getTagsForCafe);

route.get('/curLoc', checkAccessToken, headerParser, controller.curLoc);

route.get('/search/:query', checkAccessToken, headerParser, controller.search);

route.post('/feedback/:id', checkAccessToken, controller.feedback);

module.exports = route;

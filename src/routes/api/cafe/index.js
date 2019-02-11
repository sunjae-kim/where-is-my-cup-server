const route = require('express').Router();
const controller = require('./cafe.controller');
const { checkToken } = require('../../../lib');

const checkAccessToken = checkToken('x-access-token');

route.get('/detail/:id', checkAccessToken, controller.getDetail);
route.post('/detail', checkAccessToken, controller.postDetail);

route.get('/tags/:id', checkAccessToken, controller.getTagsForCafe);

route.get('/curLoc', checkAccessToken, controller.curLoc);

route.get('/search/:query', checkAccessToken, controller.search);

route.post('/feedback/:id', checkAccessToken, controller.feedback);

module.exports = route;

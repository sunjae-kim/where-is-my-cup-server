const route = require('express').Router();
const controller = require('./cafe.controller');
const { middlewares: { headerParser } } = require('../../../lib');

route.get('/detail/:id', headerParser, controller.getDetail);

route.get('/tags/:id', controller.getTagsForCafe);

route.get('/curLoc', headerParser, controller.curLoc);

route.get('/search/:query', headerParser, controller.search);

route.post('/feedback/:id', controller.feedback);

module.exports = route;

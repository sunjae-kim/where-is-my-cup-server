const route = require('express').Router();
const { getDetail } = require('./cafe.controller');

route.get('/detail/:id', getDetail);

module.exports = route;

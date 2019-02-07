const route = require('express').Router();
const controller = require('./user.controller');

// list
route.get('/list', controller.getList);

module.exports = route;

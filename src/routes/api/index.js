const route = require('express').Router();

route.use('/cafe', require('./cafe'));

module.exports = route;

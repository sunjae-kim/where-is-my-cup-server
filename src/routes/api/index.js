const route = require('express').Router();

route.use('/cafe', require('./cafe'));
route.use('/users', require('./users'));

module.exports = route;

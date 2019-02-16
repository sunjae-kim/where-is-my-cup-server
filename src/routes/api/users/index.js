const route = require('express').Router();
const controller = require('./user.controller');

route.delete('/', controller.deleteUser);

route.get('/list', controller.getList);

route.get('/favorites', controller.getFavorites);
route.post('/favorites', controller.postFavorites);
route.delete('/favorites/:id', controller.deleteFavorites);

module.exports = route;

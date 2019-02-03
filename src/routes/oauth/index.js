const route = require('express').Router();
const oauthKeeper = require('./oauthKeeper.js');
const googleStrategy = require('./googleStrategy');
const kakaoStrategy = require('./kakaoStrategy');
const localStrategy = require('./localStrategy');
const { encrptPassword } = require('../../lib');

// Local Strategy
route.post('/local/login', localStrategy.login);
route.post('/local/register', encrptPassword, localStrategy.register);

// Google Strategy
route.post('/google', googleStrategy.login);
route.post('/google/callback', googleStrategy.loginCallback);

// Kakao Strategy
route.post('/kakao', kakaoStrategy.login);
route.post('/kakao/callback', kakaoStrategy.loginCallback);

// Validation
route.get('/check', oauthKeeper.check);
route.get('/refresh', oauthKeeper.refresh);

module.exports = route;

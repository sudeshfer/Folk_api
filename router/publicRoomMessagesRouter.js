'use strict';
//created by Hatem Suthura
const express = require('express');
const roomMessageRouter = new express.Router;
const roomMessageController = require('../controller/PublicRoomsMessageController');

roomMessageRouter.post('/fetch_all', roomMessageController.fetchAll);


module.exports = roomMessageRouter;
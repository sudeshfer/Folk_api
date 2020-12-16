"use strict";
//created by Hatem Suthura
const express = require("express");
const instaAuthRouter = new express.Router();
const instaAuthController = require('../controller/instaAuthController');


instaAuthRouter.post("/saveInstaAuth", instaAuthController.saveUserToken);
instaAuthRouter.post("/getInstaToken", instaAuthController.getInstaToken);
// instaAuthRouter.post("/getcount", instaAuthController.getcount);


module.exports = instaAuthRouter;
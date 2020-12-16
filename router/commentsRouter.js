"use strict";
//created by Hatem Suthura
const express = require("express");
const commentRouter = new express.Router();
const commentController = require('../controller/commentController');

commentRouter.post("/create", commentController.createComment);
commentRouter.post("/createsub", commentController.createsubComment);
commentRouter.post("/delete", commentController.deleteComment);
commentRouter.post("/deletesub", commentController.deleteSubComment);
commentRouter.post("/fetch_all", commentController.getComments);

module.exports = commentRouter;
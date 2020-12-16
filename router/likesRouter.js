"use strict";
//created by Hatem Suthura
const express = require("express");
const likesRouter = new express.Router();
const likesController = require('../controller/likesController');

likesRouter.post("/create", likesController.createLike);
likesRouter.post("/delete", likesController.deleteLike);

likesRouter.post("/commentlike", likesController.createCommentLike);
likesRouter.post("/commentunlike", likesController.deleteCommentLike);


likesRouter.post("/subcommentlike", likesController.createSubCommentLike);
likesRouter.post("/subcommentunlike", likesController.deleteSubCommentLike);


likesRouter.post("/eventlike", likesController.createEventLike);
likesRouter.post("/eventunlike", likesController.deleteEventLike);

module.exports = likesRouter;
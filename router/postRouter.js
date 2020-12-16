"use strict";
//created by Hatem Suthura
const express = require("express");
const postRouter = new express.Router();
const postsController = require('../controller/postsController');
const multer = require('multer');


const storage = multer.diskStorage({
    destination: 'uploads/users_posts_img',
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({ storage: storage });

postRouter.post("/create", upload.single('img'), postsController.createPost);
postRouter.post("/update", upload.single('img'), postsController.updatePost);


postRouter.post("/fetch", postsController.getPosts);

postRouter.post("/getPostById", postsController.getPostById);

postRouter.post("/deletePost", postsController.deletePost);

postRouter.post("/fetch_posts_by_user_id", postsController.fetch_posts_by_user_id);

postRouter.post("/createcategory", postsController.createCategory);
postRouter.post("/getcategories", postsController.getCategories);

postRouter.post("/getlikedusers", postsController.getLikedUsers);

module.exports = postRouter;
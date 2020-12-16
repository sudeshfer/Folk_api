"use strict";
//created by Hatem Suthura
const express = require("express");
const roomsRouter = new express.Router();
const roomsController = require('../controller/publicRoomsController');
const multer = require('multer');
//img path
// http://localhost:5000/uploads/users_profile_img/1582645366303-apple-logo.png
const storage = multer.diskStorage({
    destination: 'uploads/public_chat_rooms',
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});


const upload = multer({ storage: storage });
roomsRouter.post("/create", upload.single('img'), roomsController.createRoom); // /api/user/create
// userRouter.post("/login", userController.loginUser); // /api/user/login
// userRouter.post("/update_password", userController.update_password); // /api/user/login
// userRouter.post("/update_bio_and_name", userController.update_bio_and_name); // /api/user/login
// userRouter.post("/get_likes_posts_comments_counts", userController.get_likes_posts_comments_counts); // /api/user/login
// userRouter.post("/get", userController.getUser); // /api/user/get
// userRouter.post("/getUserByEmail", userController.getUserByEmail); // /api/user/get
roomsRouter.post("/getRooms", roomsController.getRooms); // /api/user/get
roomsRouter.post("/getJoinedRooms", roomsController.getJoinedRooms); // /api/user/get
roomsRouter.post("/deleteRoom", roomsController.deleteRoom);


// userRouter.post("/img", upload.single('img'), userController.addUserImg);
// userRouter.post("/update_bio", userController.update_bio);
// userRouter.post('/update_user_token', userController.updateAndAddUserToken);


module.exports = roomsRouter;
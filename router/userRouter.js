"use strict";
//created by Hatem Suthura
const express = require("express");
const userRouter = new express.Router();
const userController = require('../controller/userController');
const multer = require('multer');
//img path
// http://localhost:5000/uploads/users_profile_img/1582645366303-apple-logo.png
const storage = multer.diskStorage({
    destination: 'uploads/users_profile_img',
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({ storage: storage });
userRouter.post("/fblogin", userController.fbLogin); // /api/user/fblogin

userRouter.post("/createinterest", userController.createInterest); // /api/user/createinterest
userRouter.get("/getinterst", userController.getInterest); // /api/user/getinterst


userRouter.post("/otplogin", userController.phoneLogin); // /api/user/otplogin
userRouter.post("/create", upload.single('img'), userController.createUser); // /api/user/create
userRouter.post("/login", userController.loginUser); // /api/user/login
userRouter.post("/update_password", userController.update_password); // /api/user/login
userRouter.post("/update_bio_and_name", userController.update_bio_and_name); // /api/user/login
userRouter.post("/get_likes_posts_comments_counts", userController.get_likes_posts_comments_counts); // /api/user/login
userRouter.post("/get", userController.getUser); // /api/user/get

userRouter.post("/gettrust", userController.getUserTrustScore); // /api/user/gettrust


userRouter.post("/getUserByEmail", userController.getUserByEmail); // /api/user/get
userRouter.post("/getUsers", userController.getUsers); // /api/user/get
userRouter.post("/img", upload.single('img'), userController.addUserImg);

userRouter.post("/img2", upload.single('img'), userController.addUserImg2);
userRouter.post("/img3", upload.single('img'), userController.addUserImg3);
userRouter.post("/img4", upload.single('img'), userController.addUserImg4);
userRouter.post("/img5", upload.single('img'), userController.addUserImg5);
userRouter.post("/img6", upload.single('img'), userController.addUserImg6);

userRouter.post("/remUserImg1", userController.remUserImg1); // /api/user/remUserImg1
userRouter.post("/remUserImg2", userController.remUserImg2);
userRouter.post("/remUserImg3", userController.remUserImg3);
userRouter.post("/remUserImg4", userController.remUserImg4);
userRouter.post("/remUserImg5", userController.remUserImg5);
userRouter.post("/remUserImg6", userController.remUserImg6);


userRouter.post("/sendresetmail", userController.sendresetmail); // /api/user/sendresetmail
userRouter.post("/verifyemail", userController.verifyemail); // /api/user/verifyemail


userRouter.post("/update_bio", userController.update_bio);
userRouter.post("/update_phone", userController.update_phone);

userRouter.post("/update_email", userController.update_email);

userRouter.post("/update_whatudo", userController.update_whatudo);
userRouter.post("/update_user_interest", userController.update_user_interest);

userRouter.post("/update_user_location", userController.update_user_location);

userRouter.post("/update_selected_location", userController.update_selectedlocation);
userRouter.post("/remove_user_location", userController.remove_user_location);

userRouter.post('/update_user_token', userController.updateAndAddUserToken);


userRouter.post('/followrequest', userController.followRequest);
userRouter.post('/cancelfollowrequest', userController.cancelFollowRequest);
userRouter.post('/acceptrequest', userController.acceptFollowRequest);
userRouter.post('/getrequests', userController.getUserReqs);
userRouter.post('/declinerequest', userController.declineFollowRequest);
userRouter.post('/unfollowuser', userController.unfollowUser);

userRouter.post('/getfollowers', userController.getFollowers);
userRouter.post('/getfollowing', userController.getFolliwing);

userRouter.post('/getMaybeLikeUser', userController.getMaybeLikeUser);


module.exports = userRouter;
"use strict";
//created by Hatem Suthura
const { userSchemaModel } = require("../models/userModel");
const { commentSchemaModel } = require("../models/commentsModel");
const { subcommentSchemaModel } = require("../models/subcommentsModel");
const { postSchemaModel } = require("../models/postsModel");
const { notificationsSchemaModel } = require("../models/notificationsModel");

var admin = require("firebase-admin");


module.exports = {
    createComment: async(req, res) => {
        const {
            user_id,
            post_owner_id,
            post_id,
            comment,
            user_name,
            user_img,
            imagesource,
            bday
        } = req.body;
        const commentModel = new commentSchemaModel({
            user_id: user_id,
            post_id: post_id,
            comment: comment,
            user_name: user_name,
            user_img: user_img,
            imagesource: imagesource,
            bday: bday
        });
        await commentModel.save(async err => {
            if (err) {
                res.status(500).json({
                    error: true,
                    data: "err" + err
                });
            } else {
                //send notif if not my  comment and save notif
                if (user_id !== post_owner_id) {
                    let userToNotify = await userSchemaModel
                        .findOne({ _id: post_owner_id })
                        .exec();
                    let peerToken = userToNotify["token"];

                    var payload = {
                        notification: {
                            body: `${user_name} add Comment your post`,
                            title: "Folk App"
                        },
                        data: {
                            id: `${post_id}`,
                            post_owner_id: `${post_owner_id}`,
                            screen: "comment",
                            'click_action': 'FLUTTER_NOTIFICATION_CLICK',
                        }
                    };
                    var options = {
                        priority: "high",
                        timeToLive: 60 * 60 * 24
                    };

                    admin
                        .messaging()
                        .sendToDevice(peerToken, payload, options)
                        .then(function(ress) {

                        })
                        .catch(function(err) {
                            console.log("error is " + err);
                        });
                    //save notif
                    let notificationModel = new notificationsSchemaModel({
                        name: user_name,
                        title: "commented on your post",
                        userImg: user_img,
                        imagesource: imagesource,
                        notificationType: 'comment',
                        notifMessage: comment,
                        postId: post_id,
                        notif_to_user: post_owner_id,
                        my_id: user_id

                    });
                    await notificationModel.save();
                }

                let posts = await postSchemaModel.findById(post_id);
                posts.commentsCount = ++posts.commentsCount;
                await posts.save();


                res.status(200).json({ error: false, data: commentModel });
            }
        });
    },


    createsubComment: async(req, res) => {
        const {
            user_id,
            post_owner_id,
            post_id,
            comment,
            comment_id,
            user_name,
            user_img,
            imagesource,
            bday
        } = req.body;
        const subcommentModel = new subcommentSchemaModel({
            user_id: user_id,
            comment_id: comment_id,
            comment: comment,
            user_name: user_name,
            user_img: user_img,
            imagesource: imagesource,
            bday: bday
        });
        await subcommentModel.save(async err => {
            if (err) {
                console.log(err);
                res.status(500).json({
                    error: true,
                    data: "err" + err
                });
            } else {
                //send notif if not my  comment and save notif
                if (user_id !== post_owner_id) {
                    let userToNotify = await userSchemaModel
                        .findOne({ _id: post_owner_id })
                        .exec();
                    let peerToken = userToNotify["token"];

                    var payload = {
                        notification: {
                            body: `${user_name} replied to your comment`,
                            title: "Folk App"
                        },
                        data: {
                            id: `${post_id}`,
                            post_owner_id: `${post_owner_id}`,
                            screen: "comment",
                            'click_action': 'FLUTTER_NOTIFICATION_CLICK',
                        }
                    };
                    var options = {
                        priority: "high",
                        timeToLive: 60 * 60 * 24
                    };

                    admin
                        .messaging()
                        .sendToDevice(peerToken, payload, options)
                        .then(function(ress) {

                        })
                        .catch(function(err) {
                            console.log("error is " + err);
                        });
                    //save notif
                    let notificationModel = new notificationsSchemaModel({
                        name: user_name,
                        title: "replied to your comment",
                        userImg: user_img,
                        imagesource: imagesource,
                        notificationType: 'subcomment',
                        notifMessage: comment,
                        postId: post_id,
                        notif_to_user: post_owner_id,
                        my_id: user_id
                    });
                    await notificationModel.save();
                }

                let posts = await postSchemaModel.findById(post_id);
                posts.commentsCount = ++posts.commentsCount;
                await posts.save();


                res.status(200).json({ error: false, data: subcommentModel });
            }
        });
    },


    deleteComment: async(req, res) => {
        const { comment_id, post_id } = req.body;

        await commentSchemaModel.findByIdAndRemove(comment_id);
        let posts = await postSchemaModel.findById(post_id);
        posts.commentsCount = --posts.commentsCount;
        await posts.save();
        res.status(200).json({ error: false, data: "done" });
    },

    deleteSubComment: async(req, res) => {
        const { comment_id, post_id } = req.body;

        await subcommentSchemaModel.findByIdAndRemove(comment_id);
        let posts = await postSchemaModel.findById(post_id);
        posts.commentsCount = --posts.commentsCount;
        await posts.save();
        res.status(200).json({ error: false, data: "done" });
    },


    getComments: async(req, res) => {
        const { post_id, user_id } = req.body;

        commentSchemaModel.aggregate([{
                "$match": { post_id: post_id }
            },
            { "$sort": { "createdAt": 1 } },
            {
                "$lookup": {
                    "from": subcommentSchemaModel.collection.name,
                    "localField": "_id",
                    "foreignField": "comment_id",
                    "as": "subcoms"
                }
            },
            {
                "$project": {
                    "_id": 1,
                    "user_id": 1,
                    "user_name": 1,
                    "isUserLiked": 1,
                    "comment": 1,
                    "user_img": 1,
                    "imagesource": 1,
                    "bday": 1,
                    "post_id": 1,
                    'likes': 1,
                    "usersLiked": 1,
                    "subcoms": "$subcoms",
                    "created": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                }
            },
        ]).then(async function(comments) {
            if (comments.length === 0) {
                res.send({ error: true, data: "No Comments" });
            } else {
                comments.forEach((comment) => {
                    comment.isUserLiked = comment.usersLiked.some(id => id.equals(user_id))
                    comment.subcoms.forEach((subcomment) => {
                        subcomment.isUserLiked = subcomment.usersLiked.some(id => id.equals(user_id))
                    });
                });

                // console.log('****************************');
                // console.log(comments);
                // console.log('****************************');

                // comments.subcoms.forEach((subcomment) => {
                //     subcomment.isUserLiked = subcomment.usersLiked.some(id => id.equals(user_id))
                // });
                res.send({ error: false, data: comments });
            }
        });
    }
};
"use strict";
//created by Hatem Suthura
const Joi = require("joi");

const { postSchemaModel } = require("../models/postsModel");
const { commentSchemaModel } = require("../models/commentsModel");
const { subcommentSchemaModel } = require("../models/subcommentsModel");

const { notificationsSchemaModel } = require("../models/notificationsModel");
const { userSchemaModel } = require("../models/userModel");

const { likeSchemaModel } = require("../models/likesModel");
const { commentlikeSchemaModel } = require("../models/CommentlikesModel");
const { subcommentlikeSchemaModel } = require("../models/SubCOmmentLikesModel");
const { EventlikeSchemaModel } = require("../models/eventLikesModel");
const { eventSchemaModel } = require("../models/eventModel");


var admin = require("firebase-admin");

module.exports = {
    createLike: async(req, res) => {
        const { user_id, post_id, peer_id, user_name, user_img, imagesource } = req.body;


        const likeModel = new likeSchemaModel({
            user_id: user_id,
            post_id: post_id
        });
        await likeModel.save(async err => {
            if (err) {
                res.status(500).json({
                    error: true,
                    data: "err" + err
                });
            } else {
                let postData = await postSchemaModel.findById(post_id);

                postData.likes = ++postData.likes;
                postData.usersLiked.push(user_id);

                await postData.save();

                if (user_id !== peer_id) {
                    let userToNotify = await userSchemaModel.findById(peer_id);
                    let peerToken = userToNotify.token;

                    var payload = {
                        notification: {
                            body: `${user_name} has Like your post`,
                            title: "Folk App"
                        },
                        data: {
                            id: `${post_id}`,
                            post_owner_id: `${peer_id}`,
                            screen: "like",
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
                    let notifModel = new notificationsSchemaModel({
                        name: user_name,
                        title: "Liked your post",
                        userImg: user_img,
                        imagesource: imagesource,
                        notificationType: 'postlike',
                        postId: post_id,
                        notif_to_user: peer_id,
                        my_id: user_id
                    });
                    await notifModel.save();
                }

                res.status(200).json({ error: false, data: "done" });
            }
        });
    },
    deleteLike: async(req, res) => {
        const { error } = createLikeValidation(req.body);

        if (!error) {
            const { user_id, post_id } = req.body;

            //   const likeModel = new likeSchemaModel({user_id: user_id, post_id: post_id});
            await likeSchemaModel
                .find({ user_id: user_id, post_id: post_id })
                .remove();
            let postData = await postSchemaModel.findById(post_id);

            postData.likes = --postData.likes;
            postData.usersLiked.remove(user_id);
            await postData.save();

            res.status(200).json({ error: false, data: "done" });
        } else {
            let detail = error.details[0].message;
            res.send({ error: true, data: detail });
        }
    },




    createCommentLike: async(req, res) => {
        const { user_id, comment_id, peer_id, user_name, user_img, imagesource } = req.body;


        const likeModel = new commentlikeSchemaModel({
            user_id: user_id,
            comment_id: comment_id
        });
        await likeModel.save(async err => {
            if (err) {
                res.status(500).json({
                    error: true,
                    data: "err" + err
                });
            } else {
                let commenttData = await commentSchemaModel.findById(comment_id);

                commenttData.likes = ++commenttData.likes;
                commenttData.usersLiked.push(user_id);

                await commenttData.save();

                if (user_id !== peer_id) {
                    let userToNotify = await userSchemaModel.findById(peer_id);
                    let peerToken = userToNotify.token;

                    var payload = {
                        notification: {
                            body: `${user_name} has Like your comment`,
                            title: "Folk App"
                        },
                        data: {
                            id: `${comment_id}`,
                            post_owner_id: `${peer_id}`,
                            screen: "like",
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
                    let notifModel = new notificationsSchemaModel({
                        name: user_name,
                        title: "liked  your comment",
                        userImg: user_img,
                        imagesource: imagesource,
                        notificationType: 'comlike',
                        postId: comment_id,
                        notif_to_user: peer_id,
                        my_id: user_id
                    });
                    await notifModel.save();
                }

                res.status(200).json({ error: false, data: "done" });
            }
        });
    },

    deleteCommentLike: async(req, res) => {
        const { error } = createComLikeValidation(req.body);

        if (!error) {
            const { user_id, comment_id } = req.body;

            //   const likeModel = new likeSchemaModel({user_id: user_id, post_id: post_id});
            await commentlikeSchemaModel
                .find({ user_id: user_id, comment_id: comment_id })
                .remove();
            let commenttData = await commentSchemaModel.findById(comment_id);
            console.log(user_id);
            console.log(commenttData.usersLiked);

            commenttData.likes = --commenttData.likes;
            commenttData.usersLiked.remove(user_id);
            await commenttData.save();

            res.status(200).json({ error: false, data: "done" });
        } else {
            let detail = error.details[0].message;
            res.send({ error: true, data: detail });
        }
    },











    createSubCommentLike: async(req, res) => {
        const { user_id, comment_id, peer_id, user_name, user_img, imagesource } = req.body;


        const likeModel = new subcommentlikeSchemaModel({
            user_id: user_id,
            comment_id: comment_id
        });
        await likeModel.save(async err => {
            if (err) {
                res.status(500).json({
                    error: true,
                    data: "err" + err
                });
            } else {
                let commenttData = await subcommentSchemaModel.findById(comment_id);

                commenttData.likes = ++commenttData.likes;
                commenttData.usersLiked.push(user_id);

                await commenttData.save();

                if (user_id !== peer_id) {
                    let userToNotify = await userSchemaModel.findById(peer_id);
                    let peerToken = userToNotify.token;

                    var payload = {
                        notification: {
                            body: `${user_name} has Like your comment`,
                            title: "Folk App"
                        },
                        data: {
                            id: `${comment_id}`,
                            post_owner_id: `${peer_id}`,
                            screen: "like",
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
                    let notifModel = new notificationsSchemaModel({
                        name: user_name,
                        title: "liked your comment",
                        userImg: user_img,
                        imagesource: imagesource,
                        notificationType: 'subcomlike',
                        postId: comment_id,
                        notif_to_user: peer_id,
                        my_id: user_id
                    });
                    await notifModel.save();
                }

                res.status(200).json({ error: false, data: "done" });
            }
        });
    },

    deleteSubCommentLike: async(req, res) => {
        const { error } = createComLikeValidation(req.body);

        if (!error) {
            const { user_id, comment_id } = req.body;

            //   const likeModel = new likeSchemaModel({user_id: user_id, post_id: post_id});
            await subcommentlikeSchemaModel
                .find({ user_id: user_id, comment_id: comment_id })
                .remove();
            let commenttData = await subcommentSchemaModel.findById(comment_id);

            commenttData.likes = --commenttData.likes;
            commenttData.usersLiked.remove(user_id);
            await commenttData.save();

            res.status(200).json({ error: false, data: "done" });
        } else {
            let detail = error.details[0].message;
            res.send({ error: true, data: detail });
        }
    },


    // ************************************************************************************************




    createEventLike: async(req, res) => {
        const { user_id, event_id, peer_id, user_name, user_img, imagesource } = req.body;


        const eventlikeModel = new EventlikeSchemaModel({
            user_id: user_id,
            event_id: event_id
        });
        await eventlikeModel.save(async err => {
            if (err) {
                res.status(500).json({
                    error: true,
                    data: "err" + err
                });
            } else {
                let eventData = await eventSchemaModel.findById(event_id);

                eventData.likes = ++eventData.likes;
                eventData.usersLiked.push(user_id);

                await eventData.save();

                if (user_id !== peer_id) {
                    let userToNotify = await userSchemaModel.findById(peer_id);
                    let peerToken = userToNotify.token;

                    var payload = {
                        notification: {
                            body: `${user_name} has Liked your event`,
                            title: "Folk App"
                        },
                        data: {
                            id: `${event_id}`,
                            post_owner_id: `${peer_id}`,
                            screen: "like",
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
                    let notifModel = new notificationsSchemaModel({
                        name: user_name,
                        title: "Liked your Event",
                        userImg: user_img,
                        imagesource: imagesource,
                        notificationType: 'eventlike',
                        postId: event_id,
                        notif_to_user: peer_id,
                        my_id: user_id
                    });
                    await notifModel.save();
                }

                res.status(200).json({ error: false, data: "done" });
            }
        });
    },
    deleteEventLike: async(req, res) => {
        const { error } = createEventLikeValidation(req.body);

        if (!error) {
            const { user_id, event_id } = req.body;

            //   const likeModel = new likeSchemaModel({user_id: user_id, post_id: post_id});
            await EventlikeSchemaModel
                .find({ user_id: user_id, event_id: event_id })
                .remove();
            let eventData = await eventSchemaModel.findById(event_id);

            eventData.likes = --eventData.likes;
            eventData.usersLiked.remove(user_id);
            await eventData.save();

            res.status(200).json({ error: false, data: "done" });
        } else {
            let detail = error.details[0].message;
            res.send({ error: true, data: detail });
        }
    },







    // ************************************************************************************************












};

function createLikeValidation(like) {
    const schema = Joi.object().keys({
        post_id: Joi.string().required(),
        user_id: Joi.string().required()
    });
    return Joi.validate(like, schema);
}

function createComLikeValidation(like) {
    const schema = Joi.object().keys({
        comment_id: Joi.string().required(),
        user_id: Joi.string().required()
    });
    return Joi.validate(like, schema);
}

function createEventLikeValidation(like) {
    const schema = Joi.object().keys({
        user_id: Joi.string().required(),
        event_id: Joi.string().required()
    });
    return Joi.validate(like, schema);
}
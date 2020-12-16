"use strict";
//created by Hatem Suthura
const Joi = require('joi');
const { eventSchemaModel } = require('../models/eventModel')
const { userSchemaModel } = require('../models/userModel')
const { joinEventSchemaModel } = require('../models/joinEventModel')
const { publicChatRoomModel } = require('../models/publicChatRoomModel');
const { notificationsSchemaModel } = require("../models/notificationsModel");


const mongoose = require('mongoose');
var admin = require("firebase-admin");


module.exports = {
    //
    createEvent: async(req, res) => {
        const { user_id, title, post_data, typology, foodcategory, geometry, address, event_date, maxparticipants, minage, maxage } = req.body;
        let has_img = false;
        let post_img = null;

        if (req.file) {
            has_img = true;
            post_img = req.file.filename;
        }

        let msg = {
            users_see_message: [user_id],
            message: 'first msg'
        };

        var roomModel = publicChatRoomModel({
            room_name: title,
            img: post_img,
            admin_id: user_id,
            lastMessage: msg,
            users: [user_id]
        });
        roomModel.users.push(user_id);
        await roomModel.save(async err => {
            if (err) {
                res.status(500).json({
                    error: true,
                    data: "unknown error" + err,
                    chatId: []
                });
            } else {
                // res.status(200).json({ error: false, data: roomModel });
                const eventModel = eventSchemaModel({
                    user_id: user_id,
                    title: title,
                    post_data: `${post_data}`,
                    typology: typology,
                    foodcategory: foodcategory,
                    geometry: JSON.parse(geometry),
                    address: address,
                    event_date: event_date,
                    maxparticipants: maxparticipants,
                    minage: minage,
                    maxage: maxage,
                    has_img: has_img,
                    post_img: post_img,
                    room_id: roomModel._id
                });
                eventModel.save(async err => {
                    if (err) {
                        console.log(err);
                        res.status(500).json({
                            error: true,
                            data: "err" + err,
                        });
                    } else {
                        res.status(200).json({ error: false, data: eventModel });
                    }
                });
            }
        });
    },

    updateEvent: async(req, res) => {
        const { event_id, title, post_data, typology, foodcategory, geometry, address, event_date, maxparticipants, minage, maxage } = req.body;
        let has_img = false;
        let post_img = null;
        if (req.file) {
            has_img = true;
            post_img = req.file.filename;
        }

        await eventSchemaModel.update({ '_id': mongoose.Types.ObjectId(event_id) }, {
            title: title,
            post_data: `${post_data}`,
            typology: typology,
            foodcategory: foodcategory,
            geometry: JSON.parse(geometry),
            address: address,
            event_date: event_date,
            maxparticipants: maxparticipants,
            minage: minage,
            maxage: maxage,
            has_img: has_img,
            post_img: post_img
        }).exec((err) => {
            if (err) {
                console.log(err);
                res.status(500).json({
                    error: true,
                    data: "err" + err,
                });
            } else {
                res.status(200).json({ error: false, data: "success" });
            }
        });
    },


    deleteEvent: async(req, res) => {
        const { event_id } = req.body;

        await eventSchemaModel.findByIdAndRemove(event_id);
        // await commentSchemaModel.find({ post_id: post_id }).remove();
        // await likeSchemaModel.find({ post_id: post_id }).remove();
        res.status(200).json({ error: false, data: 'done' });
    },



    getEvents: async(req, res) => {

        let results = {};
        const { user_id, page, lat, long, maxDistance, date, duration, sortParameter, minAge, maxAge } = req.body;


        const page_as_int = parseInt(page);
        const limit = parseInt('10');
        const startIndex = (page_as_int - 1) * limit;
        const endIndex = page_as_int * limit;

        console.log("lat" + lat, " , long " + long);


        function remDays(date, days) {
            var result = new Date(date);
            result.setDate(result.getDate() + days);
            return result;
        }

        var dateMactchString;

        if (duration === 'all') {
            dateMactchString = {
                "$match": {
                    "event_date": {
                        "$gte": new Date('2000-07-16 00:42:28.456052'), //low end
                        "$lt": new Date('3000-07-16 00:42:28.456052') //high end
                    }
                }
            };
        }

        if (duration === 'today') {
            dateMactchString = {
                "$match": {
                    "event_date": {
                        "$gte": new Date(date), //low end
                        "$lt": remDays(date, 1) //high end
                    }
                }
            };
        }

        if (duration === 'tomorrow') {
            dateMactchString = {
                "$match": {
                    "event_date": {
                        "$gte": remDays(date, 1), //low end
                        "$lt": remDays(date, 2) //high end
                    }
                }
            };
        }

        if (duration === 'tweek') {
            dateMactchString = {
                "$match": {
                    "event_date": {
                        "$gte": new Date(date), //low end
                        "$lt": remDays(date, 7) //high end
                    }
                }
            };
        }

        if (duration === 'lweek') {
            dateMactchString = {
                "$match": {
                    "event_date": {
                        "$gte": remDays(date, -7), //low end
                        "$lt": new Date(date) //high end
                    }
                }
            };
        }

        var minAgeString = {
            "$match": {
                "minage": {
                    "$gte": minAge,
                }
            }
        };

        var maxAgeString = {
            "$match": {
                "maxage": {
                    "$lt": maxAge,
                }
            }
        };

        var geoString = {
            "$geoNear": {
                "near": { "type": "Point", "coordinates": [parseFloat(long), parseFloat(lat), ] },
                "distanceField": "dist.calculated",
                "maxDistance": parseInt(maxDistance),
                "includeLocs": "dist.location",
                "spherical": true
            }
        };

        var lookupString = {
            "$lookup": {
                "from": userSchemaModel.collection.name,
                "localField": "user_id",
                "foreignField": "_id",
                "as": "user_id"
            }
        };
        var projectString = {
            "$project": {
                "post_data": 1,
                "likes": 1,
                "joinedCount": 1,
                "post_img": 1,
                "isUserLiked": 1,
                "usersLiked": 1,
                'event_date': 1,
                "has_img": 1,
                "user_id": {
                    "img": "$user_id.img",
                    "_id": "$user_id._id",
                    "user_name": "$user_id.user_name",
                    "bday": "$user_id.bday",
                    "imagesource": "$user_id.imagesource",
                    "fb_url": "$user_id.fb_url",
                    "followercount": "$user_id.followercount",
                },
                "title": 1,
                "geometry": 1,
                "typology": 1,
                "address": 1,
                "foodcategory": 1,
                "minage": 1,
                "maxage": 1,
                "maxparticipants": 1,
                "usersParticipating": 1,
                "created": 1,
                "room_id": 1,
                "createdAt": 1,
                "updatedAt": 1,
            }
        };
        var limitString = { "$limit": limit };
        var skipString = { "$skip": startIndex };

        var sortString;
        // var sortParameter = 'relevance';

        if (sortParameter == 'recent') {
            sortString = { "$sort": { "createdAt": -1 } };
        }
        if (sortParameter == 'popularity') {
            sortString = { "$sort": { "likes": -1 } };
        }
        if (sortParameter == 'relevance') {
            sortString = { "$sort": { "likes": -1 } };
        }


        var aggregateString = [
            geoString,
            dateMactchString,
            limitString,
            minAgeString,
            maxAgeString,
            skipString,
            sortString,
            lookupString,
            projectString,
        ];

        // if (duration === 'all') {
        //     aggregateString.splice(1, 1);
        // }


        eventSchemaModel.aggregate(aggregateString).then(async function(posts) {
            //some code here
            // res.send(posts);

            if (posts.length === 0) {
                results.error = true;
                results.data = 'No posts ';
                res.send(results);
            } else {
                let totalCommentCount = await eventSchemaModel.countDocuments().exec();
                if (endIndex < totalCommentCount) {
                    results.next = {
                        page: page_as_int + 1,
                        limit: limit
                    };
                }

                if (startIndex > 0) {
                    results.previous = {
                        page: page_as_int - 1,
                        limit: limit
                    };
                }


                posts.forEach((post) => {
                    post.isUserLiked = post.usersLiked.some(id => id.equals(user_id))
                });

                posts.forEach((post) => {
                    post.isUserJoined = post.usersParticipating.some(id => id.equals(user_id))
                });

                res.send({ error: false, totalCommentCount: totalCommentCount, data: posts });

            }
        });
    },


    joinEvent: async(req, res) => {
        const { user_id, event_id, peer_id, user_name, user_img, imagesource } = req.body;


        const joinedModel = new joinEventSchemaModel({
            user_id: user_id,
            event_id: event_id
        });
        await joinedModel.save(async err => {
            if (err) {
                res.status(500).json({
                    error: true,
                    data: "err" + err
                });
            } else {
                let eventData = await eventSchemaModel.findById(event_id);

                eventData.joinedCount = ++eventData.joinedCount;
                eventData.usersParticipating.push(user_id);

                await eventData.save();

                if (user_id !== peer_id) {
                    let userToNotify = await userSchemaModel.findById(peer_id);
                    let peerToken = userToNotify.token;

                    var payload = {
                        notification: {
                            body: `${user_name} has joined your event`,
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
                        title: "joined your event",
                        userImg: user_img,
                        imagesource: imagesource,
                        notificationType: 'joinevent',
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
    ///////
    getJoinedEvents: async(req, res) => {

        let results = {};
        const { user_id, page } = req.body;


        const page_as_int = parseInt(page);
        const limit = parseInt('10');
        const startIndex = (page_as_int - 1) * limit;
        const endIndex = page_as_int * limit;


        var lookupString = {
            "$lookup": {
                "from": eventSchemaModel.collection.name,
                "localField": "event_id",
                "foreignField": "_id",
                "as": "event_id"
            }
        };
        var userlookupString = {
            "$lookup": {
                "from": userSchemaModel.collection.name,
                "localField": "user_id",
                "foreignField": "_id",
                "as": "user_id"
            }
        };
        var projectString = {
            "$project": {
                "event_id": {
                    "post_data": "$event_id.post_data",
                    "likes": "$event_id.likes",
                    "joinedCount": "$event_id.joinedCount",
                    "post_img": "$event_id.post_img",
                    "isUserLiked": "$event_id.isUserLiked",
                    "usersLiked": "$event_id.usersLiked",
                    "event_date": "$event_id.event_date",
                    "has_img": "$event_id.has_img",
                    "title": "$event_id.title",
                    "geometry": "$event_id.geometry",
                    "typology": "$event_id.typology",
                    "address": "$event_id.address",
                    "foodcategory": "$event_id.foodcategory",
                    "minage": "$event_id.minage",
                    "maxage": "$event_id.maxage",
                    "maxparticipants": "$event_id.maxparticipants",
                    "usersParticipating": "$event_id.usersParticipating",
                    "created": "$event_id.created",
                    "room_id": "$event_id.room_id",
                    "createdAt": "$event_id.createdAt",
                    "updatedAt": "$event_id.updatedAt"

                }
            }
        };
        var limitString = { "$limit": limit };
        var skipString = { "$skip": startIndex };

        var sortString = { "$sort": { "createdAt": -1 } };



        var aggregateString = [
            limitString,
            skipString,
            sortString,
            userlookupString,
            lookupString
            // projectString,
        ];

        // if (duration === 'all') {
        //     aggregateString.splice(1, 1);
        // }


        joinEventSchemaModel.aggregate(aggregateString).then(async function(posts) {
            //some code here
            // res.send(posts);

            if (posts.length === 0) {
                results.error = true;
                results.data = 'No posts ';
                res.send(results);
            } else {
                let totalCommentCount = await joinEventSchemaModel.countDocuments().exec();
                if (endIndex < totalCommentCount) {
                    results.next = {
                        page: page_as_int + 1,
                        limit: limit
                    };
                }

                if (startIndex > 0) {
                    results.previous = {
                        page: page_as_int - 1,
                        limit: limit
                    };
                }


                posts.forEach((post) => {
                    post.event_id[0]['isUserLiked'] = post.event_id[0]['usersLiked'].some(id => id.equals(user_id))
                });

                posts.forEach((post) => {
                    post.event_id[0]['isUserJoined'] = post.event_id[0]['usersParticipating'].some(id => id.equals(user_id))
                });

                res.send({ error: false, data: posts });

            }
        });
    },



    //////


    leaveEvent: async(req, res) => {
        try {
            const { user_id, event_id } = req.body;

            await joinEventSchemaModel
                .find({ user_id: user_id, event_id: event_id })
                .remove();
            let postData = await eventSchemaModel.findById(event_id);

            postData.joinedCount = --postData.joinedCount;
            postData.usersParticipating.remove(user_id);
            await postData.save();

            res.status(200).json({ error: false, data: "done" });
        } catch (error) {
            let detail = error.details[0].message;
            res.send({ error: true, data: detail });
        }
    },

    ////////////////////////////////////////////


    getUserEvents: async(req, res) => {

        let results = {};
        const { user_id, page, peer_id } = req.body;


        const page_as_int = parseInt(page);
        const limit = parseInt('10');
        const startIndex = (page_as_int - 1) * limit;
        const endIndex = page_as_int * limit;



        var lookupString = {
            "$lookup": {
                "from": userSchemaModel.collection.name,
                "localField": "user_id",
                "foreignField": "_id",
                "as": "user_id"
            }
        };
        var projectString = {
            "$project": {
                "post_data": 1,
                "likes": 1,
                "joinedCount": 1,
                "post_img": 1,
                "isUserLiked": 1,
                "usersLiked": 1,
                'event_date': 1,
                "has_img": 1,
                "user_id": {
                    "img": "$user_id.img",
                    "_id": "$user_id._id",
                    "user_name": "$user_id.user_name",
                    "bday": "$user_id.bday",
                    "imagesource": "$user_id.imagesource",
                    "fb_url": "$user_id.fb_url",
                    "followercount": "$user_id.followercount"
                },
                "title": 1,
                "geometry": 1,
                "typology": 1,
                "address": 1,
                "foodcategory": 1,
                "minage": 1,
                "maxage": 1,
                "maxparticipants": 1,
                "usersParticipating": 1,
                "created": 1,
                "room_id": 1,
                "createdAt": 1,
                "updatedAt": 1,
            }
        };
        var limitString = { "$limit": limit };
        var skipString = { "$skip": startIndex };

        var sortString = { "$sort": { "createdAt": -1 } };

        var userMatchString = { "$match": { "user_id": mongoose.Types.ObjectId(peer_id) } }
            // var sortParameter = 'relevance';

        var aggregateString = [
            userMatchString,
            limitString,
            skipString,
            sortString,
            lookupString,
            projectString,
        ];



        eventSchemaModel.aggregate(aggregateString).then(async function(posts) {

            if (posts.length === 0) {
                results.error = true;
                results.data = 'No posts ';
                res.send(results);
            } else {
                let totalCommentCount = await eventSchemaModel.countDocuments().exec();
                if (endIndex < totalCommentCount) {
                    results.next = {
                        page: page_as_int + 1,
                        limit: limit
                    };
                }

                if (startIndex > 0) {
                    results.previous = {
                        page: page_as_int - 1,
                        limit: limit
                    };
                }


                posts.forEach((post) => {
                    post.isUserLiked = post.usersLiked.some(id => id.equals(user_id))
                });

                posts.forEach((post) => {
                    post.isUserJoined = post.usersParticipating.some(id => id.equals(user_id))
                });

                res.send({ error: false, totalCommentCount: totalCommentCount, data: posts });

            }
        });
    },





    getEventUsers: async(req, res) => {

        let results = {};
        const { event_id, user_id } = req.body;

        var lookupString = {
            "$lookup": {
                "from": userSchemaModel.collection.name,
                "localField": "user_id",
                "foreignField": "_id",
                "as": "user_id"
            }
        };
        var projectString = {
            "$project": {
                "user_id": {
                    "img": "$user_id.img",
                    "_id": "$user_id._id",
                    "user_name": "$user_id.user_name",
                    "bday": "$user_id.bday",
                    "imagesource": "$user_id.imagesource",
                    "fb_url": "$user_id.fb_url",
                    "followercount": "$user_id.followercount",
                    "isUserFollowed": "$user_id.isUserFollowed",
                    "usersFollowed": "$user_id.usersFollowed",
                    "isUserRequested": "$user_id.isUserRequested",
                    "usersRequested": "$user_id.usersRequested"
                },
            }
        };

        var sortString = { "$sort": { "createdAt": -1 } };

        var eventMatchString = { "$match": { "event_id": mongoose.Types.ObjectId(event_id) } }
            // var sortParameter = 'relevance';

        var aggregateString = [
            eventMatchString,
            sortString,
            lookupString,
            projectString,
        ];

        joinEventSchemaModel.aggregate(aggregateString).then(async function(posts) {

            if (posts.length === 0) {
                results.error = true;
                results.data = 'No Users ';
                res.send(results);
            } else {

                posts.forEach((post) => {
                    post.user_id[0]['isUserFollowed'][0] = post.user_id[0]['usersFollowed'][0].some(id => id.equals(user_id))
                });

                posts.forEach((post) => {
                    post.user_id[0]['isUserRequested'][0] = post.user_id[0]['usersRequested'][0].some(id => id.equals(user_id))
                });

                res.send({ error: false, data: posts });

            }
        });
    },



};
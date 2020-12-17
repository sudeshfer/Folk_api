"use strict";
//created by Hatem Suthura
const Joi = require('joi');
const { postSchemaModel } = require('../models/postsModel')
const { eventSchemaModel } = require('../models/eventModel')
const { userSchemaModel } = require('../models/userModel')
const mongoose = require('mongoose');
const { publicChatRoomModel } = require('../models/publicChatRoomModel');

const { commentSchemaModel } = require('../models/commentsModel')
const { likeSchemaModel } = require('../models/likesModel')
const { postcategorySchemaModel } = require('../models/postCategoriesModel');


module.exports = {

    createCategory: async(req, res) => {
        return new Promise((resolve, reject) => {
            const PostcategorytModel = postcategorySchemaModel({
                itype: req.body.itype,
                interests: req.body.interests
            });
            PostcategorytModel.save(async err => {
                if (err) {
                    res.status(500).json({
                        error: true,
                        data: "" + err,
                        chatId: []
                    });
                } else {
                    res.status(200).json({
                        error: false,
                        status: 'success'
                    });
                }
            });

        });
    },
    getCategories: async(req, res) => {
        const interests = await postcategorySchemaModel.find();

        res.send(interests);
    },

    createPost: async(req, res) => {
        const { user_id, post_data, typology, geometry, exp_date, category } = req.body;
        let has_img = false;
        let post_img = null;
        if (req.file) {
            has_img = true;
            post_img = req.file.filename;
        }
        if (typology == 'post') {
            const postModel = postSchemaModel({
                post_data: `${post_data}`,
                has_img: has_img,
                post_img: post_img,
                user_id: user_id,
                typology: typology,
                geometry: JSON.parse(geometry),
                exp_date: exp_date,
                category: category
            });
            postModel.save(async err => {
                if (err) {
                    console.log(err);
                    res.status(500).json({
                        error: true,
                        data: "err" + err,
                    });
                } else {
                    res.status(200).json({ error: false, data: postModel });
                }
            });
        } else {
            let msg = {
                users_see_message: [user_id],
                message: 'first msg'
            };

            var roomModel = publicChatRoomModel({
                room_name: post_data,
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
                    const postModel = postSchemaModel({
                        post_data: `${post_data}`,
                        has_img: has_img,
                        post_img: post_img,
                        user_id: user_id,
                        typology: typology,
                        geometry: JSON.parse(geometry),
                        exp_date: exp_date,
                        category: category,
                        room_id: roomModel._id
                    });
                    postModel.save(async err => {
                        if (err) {
                            console.log(err);
                            res.status(500).json({
                                error: true,
                                data: "err" + err,
                            });
                        } else {
                            res.status(200).json({ error: false, data: postModel });
                        }
                    });
                }
            });
        }
    },

    updatePost: async(req, res) => {
        const { postid, post_data, typology, exp_date, category } = req.body;
        let has_img = false;
        let post_img = null;
        if (req.file) {
            has_img = true;
            post_img = req.file.filename;
        }

        await postSchemaModel.update({ '_id': mongoose.Types.ObjectId(postid) }, {
            post_data: `${post_data}`,
            has_img: has_img,
            post_img: post_img,
            typology: typology,
            exp_date: exp_date,
            category: category
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

    getPosts: async(req, res) => {
        // const { error } = getPostsValidation(req.body);


        // if (!error) {
        let results = {};
        const { user_id, page, lat, long, maxDistance, typology, date, duration, sortParameter, categoryParameter } = req.body;

        console.log(typology.toString());

        const page_as_int = parseInt(page);
        const limit = parseInt('10');
        const startIndex = (page_as_int - 1) * limit;
        const endIndex = page_as_int * limit;

        console.log("lat" + lat, " , long " + long);


        console.log(categoryParameter);

        // var typo = typology.toString();
        var mactchString;

        if (typology === 'all') {
            mactchString = { "$match": { "$or": [{ "typology": "post" }, { "typology": "chat_group" }] } };
        }
        if (typology === 'post') {
            mactchString = { "$match": { "$or": [{ "typology": "post" }] } };
        }
        if (typology === 'chatgroup') {
            mactchString = { "$match": { "$or": [{ "typology": "chat_group" }] } };
        }
        var dateMactchString;
        // const date = '2020-07-15 23:54:38.673665';

        function remDays(date, days) {
            var result = new Date(date);
            result.setDate(result.getDate() + days);
            return result;
        }

        // var duration = 'all'

        if (duration === 'all') {
            dateMactchString = {
                "$match": {
                    "exp_date": {
                        "$gte": new Date('2000-07-16 00:42:28.456052'), //low end
                        "$lt": new Date('3000-07-16 00:42:28.456052') //high end
                    }
                }
            };
        }

        if (duration === 'today') {
            dateMactchString = {
                "$match": {
                    "exp_date": {
                        "$gte": new Date(date), //low end
                        "$lt": remDays(date, 1) //high end
                    }
                }
            };
        }

        if (duration === 'tomorrow') {
            dateMactchString = {
                "$match": {
                    "exp_date": {
                        "$gte": remDays(date, 1), //low end
                        "$lt": remDays(date, 2) //high end
                    }
                }
            };
        }

        if (duration === 'tweek') {
            dateMactchString = {
                "$match": {
                    "exp_date": {
                        "$gte": new Date(date), //low end
                        "$lt": remDays(date, 7) //high end
                    }
                }
            };
        }

        if (duration === 'lweek') {
            dateMactchString = {
                "$match": {
                    "exp_date": {
                        "$gte": remDays(date, -7), //low end
                        "$lt": new Date(date) //high end
                    }
                }
            };
        }

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
                "commentsCount": 1,
                "post_img": 1,
                "isUserLiked": 1,
                "usersLiked": 1,
                'exp_date': 1,
                "has_img": 1,
                "room_id": 1,
                "user_id": {
                    "img": "$user_id.img",
                    "_id": "$user_id._id",
                    "user_name": "$user_id.user_name",
                    "bday": "$user_id.bday",
                    "imagesource": "$user_id.imagesource",
                    "fb_url": "$user_id.fb_url",
                },
                "typology": 1,
                "geometry": 1,
                "category": 1,
                "created": 1,
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

        // var categoryParameter = { "catName": "Rugby", "catName": "Carrom" };
        // var categoryParameter = 'all';

        var categoryString = {
            "$match": {
                "category": { "$elemMatch": { "catName": { "$in": categoryParameter } } },
            }
        };


        var aggregateString = [
            geoString,
            mactchString,
            dateMactchString,
            limitString,
            skipString,
            sortString,
            lookupString,
            projectString,
        ];

        if (duration === 'all') {
            aggregateString.splice(2, 1);
        }

        if (categoryParameter != 'all') {
            aggregateString.push(categoryString);
        }

        postSchemaModel.aggregate(aggregateString).then(async function(posts) {
            //some code here


            if (posts.length === 0) {
                results.error = true;
                results.data = 'No posts ';
                res.send(results);
            } else {
                let totalCommentCount = await postSchemaModel.countDocuments().exec();
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


                // console.log('==================PPOST==============');
                // console.log(posts);
                res.send({ error: false, totalCommentCount: totalCommentCount, data: posts });

                // console.log(posts);

            }
        });




        // } else {
        //     let detail = error.details[0].message;
        //     res.send({ error: true, data: detail });
        // }
    },
    fetch_posts_by_user_id: async(req, res) => {
        let results = {};

        const { peer_id, user_id } = req.body;


        console.log(peer_id + "----------------------");

        let idToSearch = mongoose.Types.ObjectId(peer_id);
        postSchemaModel.aggregate([{
                "$match": { user_id: idToSearch }
            },
            { "$sort": { "createdAt": -1 } },
            {
                "$lookup": {
                    "from": userSchemaModel.collection.name,
                    "localField": "user_id",
                    "foreignField": "_id",
                    "as": "user_id"
                }
            },
            {
                "$project": {
                    "post_data": 1,
                    "likes": 1,
                    "commentsCount": 1,
                    "post_img": 1,
                    "isUserLiked": 1,
                    "usersLiked": 1,
                    'exp_date': 1,
                    "has_img": 1,
                    "user_id": {
                        "img": "$user_id.img",
                        "_id": "$user_id._id",
                        "user_name": "$user_id.user_name",
                        "bday": "$user_id.bday",
                        "imagesource": "$user_id.imagesource",
                        "fb_url": "$user_id.fb_url",
                    },
                    "typology": 1,
                    "geometry": 1,
                    "category": 1,
                    "created": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                }
            },
        ]).then(async function(posts) {
            //some code here
            console.log(posts);
            // console.log(userSchemaModel.collection.name);

            if (posts.length === 0) {
                results.error = true;
                results.data = 'No posts ';
                res.send(results);
            } else {
                let totalCommentCount = await postSchemaModel.countDocuments().exec();
                posts.forEach((post) => {
                    post.isUserLiked = post.usersLiked.some(id => id.equals(user_id))
                });

                // console.log('==================PPOST==============');
                // console.log(posts);
                res.send({ error: false, totalCommentCount: totalCommentCount, data: posts });


            }
        });
    },

    deletePost: async(req, res) => {
        const { post_id } = req.body;

        await postSchemaModel.findByIdAndRemove(post_id);
        await commentSchemaModel.find({ post_id: post_id }).remove();
        await likeSchemaModel.find({ post_id: post_id }).remove();
        res.status(200).json({ error: false, data: 'done' });
    },


    getPostById: async(req, res) => {

        let results = {}
        const { post_id, peer_id } = req.body;

        const posts = await postSchemaModel.findById(post_id)
            .populate(peer_id)
            .populate("user_id", "img user_name _id");
        if (posts.length === 0) {
            results.error = true;
            results.data = 'Post deleted ! ';
            res.send(results);
        } else {


            res.send({ error: false, data: posts });

        }

    },

    getLikedUsers: async(req, res) => {

        let results = {};
        const { post_id, user_id } = req.body;

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

        var eventMatchString = { "$match": { "post_id": mongoose.Types.ObjectId(post_id) } }
            // var sortParameter = 'relevance';

        var aggregateString = [
            eventMatchString,
            sortString,
            lookupString,
            projectString,
        ];

        likeSchemaModel.aggregate(aggregateString).then(async function(posts) {

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

function createPostValidation(post) {
    const schema = Joi.object().keys({
        post_data: Joi.string().required(),
        user_id: Joi.string().required()
    });
    return Joi.validate(post, schema);
}

function getPostsValidation(post) {
    const schema = Joi.object().keys({
        user_id: Joi.required(),
        page: Joi.required(),
    });
    return Joi.validate(post, schema);
}
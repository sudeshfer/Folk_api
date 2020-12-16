"use strict";
//created by Hatem Suthura
const Joi = require('joi');
const passwordHash = require("password-hash");
const { userSchemaModel } = require('../models/userModel');
const { postSchemaModel } = require('../models/postsModel');
const { likeSchemaModel } = require('../models/likesModel');
const { commentSchemaModel } = require('../models/commentsModel');
const { InterestSchemaModel } = require('../models/Interest');
const { userRequestSchemaModel } = require('../models/userRequestModel');
const { UserFollowSchemaModel } = require('../models/userFollowModel');
const PassReset = require('../models/PassReset');
var nodemailer = require('nodemailer');
const mongoose = require('mongoose');

const jwt = require('jsonwebtoken');
var admin = require("firebase-admin");


module.exports = {
    fbLogin: async(req, res) => {
        console.log(req.body.email);
        const user = await userSchemaModel.findOne({
            email: req.body.email
        });
        if (!user) return res.send({
            error: false,
            loginstatus: 'newuser',
            email: req.body.email
        });
        else {
            var query = { _id: user._id };

            var newVal = {
                $set: {
                    fb_url: req.body.fb_url
                }
            }
            await userSchemaModel.updateOne(query, newVal, function(err) {
                if (err) {
                    res.send(err);
                }
                const token = jwt.sign({
                    _id: user._id,
                    u_name: user.name,
                    imagesource: user.imagesource,
                    base_64: user.base_64,
                    fb_url: user.fb_url,
                }, process.env.TOKEN_SECRET);
                user.fb_url = req.body.fb_url;
                res.status(200).json({
                    error: false,
                    data: user,
                    loginstatus: 'olduser',
                    token: token
                });
            });
        };
    },

    phoneLogin: async(req, res) => {
        const user = await userSchemaModel.findOne({
            phone: req.body.phone,
            usertype: 'user'
        });
        if (!user) return res.send({
            error: false,
            loginstatus: 'newuser'
        });


        const token = jwt.sign({
            _id: user._id,
            u_name: user.name,
            imagesource: user.imagesource,
            base_64: user.base_64,
            fb_url: user.fb_url,
        }, process.env.TOKEN_SECRET);

        res.status(200).json({
            error: false,
            data: user,
            loginstatus: 'olduser',
            token: token
        });
    },


    createUser: async(req, res) => {
        console.log('=====I WAS CALLED=======');
        const { user_name, gender, bday, email, phone, imagesource, base_64, fb_url, ints, geometry } = req.body;

        let post_img = 'default-user-profile-image.png';
        if (req.file) {
            // has_img = true;
            post_img = req.file.filename;
        }
        const userModel = userSchemaModel({
            user_name: user_name,
            gender: gender,
            bday: bday,
            email: email,
            phone: phone,
            imagesource: imagesource,
            img: post_img,
            base_64: base_64,
            fb_url: fb_url,
            // interests: JSON.parse(ints),
        });

        const token = jwt.sign({
            u_name: req.body.name,
            imagesource: req.body.imagesource,
            base_64: req.body.base_64,
            fb_url: req.body.fb_url
        }, process.env.TOKEN_SECRET);

        userModel.save(async err => {
            if (err) {
                res.status(500).json({
                    error: true,
                    data: "" + err,
                    chatId: []
                });
            } else {
                res.status(200).json({
                    error: false,
                    data: userModel,
                    loginstatus: 'olduser',
                    token: token
                });
            }
        });
    },
    //
    createInterest: async(req, res) => {
        return new Promise((resolve, reject) => {
            const InterestModel = InterestSchemaModel({
                itype: req.body.itype,
                interests: req.body.interests
            });
            InterestModel.save(async err => {
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
    getInterest: async(req, res) => {
        const interests = await InterestSchemaModel.find();

        res.send(interests);
    },

    loginUser: async(req, res) => {
        const { error } = loginUserValidation(req.body);
        if (!error) {
            const { email, password } = req.body;
            const user = await userSchemaModel.findOne({ email });
            if (!user) {
                res
                    .status(500)
                    .json({ error: true, data: "no email found please register !" });
            }
            const isPasswordMatch = await passwordHash.verify(
                password,
                user.password
            );

            if (!isPasswordMatch) {
                res.status(500).json({ error: true, data: "password not match !" });
            } else {
                res.status(200).json({ error: false, data: user });
            }
        } else {
            let detail = error.details[0].message;
            res.send({ error: true, data: detail });
        }
    },
    getUser: async(req, res) => {
        // const { error } = idValidation(req.body);
        try {
            let id = `${req.body.user_id}`;
            let peer_id = `${req.body.peer_id}`;
            const user = await userSchemaModel.findById(peer_id);
            if (!user) {
                res.status(500).json({ error: true, data: "no user found !" });
            } else {
                // user.isUserRequested = user.usersRequested.includes(id);
                user.isUserRequested = user.usersRequested.some(id => id.equals(mongoose.Types.ObjectId(id)));
                user.isUserFollowed = user.usersFollowed.some(id => id.equals(mongoose.Types.ObjectId(id)));
                res.status(200).json({ error: false, data: user });
            }
        } catch (error) {
            let detail = error.details[0].message;
            res.send({ error: true, data: detail });
        }
    },


    getMaybeLikeUser: async(req, res) => {
        let results = {};
        const { user_id, lat, long, maxDistance,page } = req.body;

        const page_as_int = parseInt(page);
        const limit = parseInt('10');
        const startIndex = (page_as_int - 1) * limit;
        const endIndex = page_as_int * limit;

        var followMatchString = {
            "$match": { "usersFollowed": { "$nin": [mongoose.Types.ObjectId(user_id)] } }
        };
        var reqMatchString = {
            "$match": { "usersRequested": { "$nin": [mongoose.Types.ObjectId(user_id)] } }
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

        var limitString = { "$limit": limit };
        var skipString = { "$skip": startIndex };

        var aggregateString = [
            geoString,
            followMatchString,
            reqMatchString,
            limitString,
            skipString,
        ];

        userSchemaModel.aggregate(aggregateString).then(async function(posts) {
            //some code here

            if (posts.length === 0) {
                results.error = true;
                results.data = 'No posts ';
                res.send(results);
            } else {

                let totalCount = await userSchemaModel.countDocuments().exec();
                if (endIndex < totalCount) {
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
                    post.isUserFollowed = post.usersFollowed.some(id => id.equals(user_id))
                });

                posts.forEach((post) => {
                    post.isUserRequested = post.usersRequested.some(id => id.equals(user_id))
                });

                // console.log(posts[0].isUserRequested);

                res.send({ error: false, data: posts });
            }
        });
    },


    ////
    getUserTrustScore: async(req, res) => {
        // const { error } = idValidation(req.body);
        try {
            // let id = `${req.body.user_id}`;
            let peer_id = `${req.body.peer_id}`;
            const user = await userSchemaModel.findById(peer_id);

            let trust = {
                emailVerified: user.isEmailVerified,
                phoneVerified: true,
                isUserVerified: user.isUserVerified,
                isPicturesUploaded: false,
                isInterestsChoosed: false,
                isBioUpdated: false
            }

            if (user.email != null) {
                trust.emailVerified = true
            }
            if (
                user.img != 'default-user-profile-image.png' &&
                user.img2 != 'default-user-profile-image.png' &&
                user.img3 != 'default-user-profile-image.png' &&
                user.img4 != 'default-user-profile-image.png' &&
                user.img5 != 'default-user-profile-image.png' &&
                user.img6 != 'default-user-profile-image.png'
            ) {
                trust.isPicturesUploaded = true
            }

            if (user.interests.length > 0) {
                trust.isInterestsChoosed = true
            }

            if (user.bio != "Hi I'am using Folk") {
                trust.isBioUpdated = true
            }


            res.send({ error: false, data: trust });

        } catch (error) {
            let detail = error.details[0].message;
            res.send({ error: true, data: detail });
        }
    },
    ////

    getUserByEmail: async(req, res) => {

        if (req.body.email) {
            let email = `${req.body.email}`;
            const user = await userSchemaModel.findOne({ email: email });
            if (!user) {
                res.status(500).json({ error: true, data: "no user found !" });
            } else {
                res.status(200).json({ error: false, data: user });
            }
        } else {

            res.send({ error: true, data: 'user Email required' });
        }
    },
    getUsers: async(req, res) => {

        const user = await userSchemaModel.find().sort({ created: -1 });
        if (!user) {
            res.status(500).json({ error: true, data: "no user found !" });
        } else {
            res.status(200).json({ error: false, data: user });
        }

    },
    get_likes_posts_comments_counts: async(req, res) => {
        const { error } = idValidation(req.body);
        if (!error) {
            let id = `${req.body.user_id}`;

            let postsCount = await postSchemaModel.find({ user_id: id }).countDocuments().exec();
            let likesCount = await likeSchemaModel.find({ user_id: id }).countDocuments().exec();
            let commentsCount = await commentSchemaModel.find({ user_id: id }).countDocuments().exec();
            res.status(200).json({
                error: false,
                likes: `${likesCount}`,
                posts: `${postsCount}`,
                comments: `${commentsCount}`
            });

        } else {
            let detail = error.details[0].message;
            res.send({ error: true, data: detail });
        }
    },

    addUserImg: async(req, res) => {
        let user_id = req.body.user_id;
        let name = req.file.filename;
        let bio = req.body.bio;
        if (bio) {
            await userSchemaModel.findByIdAndUpdate(user_id, { img: name, bio: bio, imagesource: 'userimage' }).exec((err) => {
                if (err) res.send({ error: true, data: 'err' + err });
                else res.send({ error: false, data: name });
            });
        } else {
            await userSchemaModel.findByIdAndUpdate(user_id, { img: name }).exec((err) => {
                if (err) res.send({ error: true, data: 'err' + err });
                else res.send({ error: false, data: name });
            });
        }
    },
    addUserImg2: async(req, res) => {
        let user_id = req.body.user_id;
        let name = req.file.filename;
        let bio = req.body.bio;
        if (bio) {
            await userSchemaModel.findByIdAndUpdate(user_id, { img2: name, bio: bio }).exec((err) => {
                if (err) res.send({ error: true, data: 'err' + err });
                else res.send({ error: false, data: name });
            });
        } else {
            await userSchemaModel.findByIdAndUpdate(user_id, { img2: name }).exec((err) => {
                if (err) res.send({ error: true, data: 'err' + err });
                else res.send({ error: false, data: name });
            });
        }
    },
    addUserImg3: async(req, res) => {
        let user_id = req.body.user_id;
        let name = req.file.filename;
        let bio = req.body.bio;
        if (bio) {
            await userSchemaModel.findByIdAndUpdate(user_id, { img3: name, bio: bio }).exec((err) => {
                if (err) res.send({ error: true, data: 'err' + err });
                else res.send({ error: false, data: name });
            });
        } else {
            await userSchemaModel.findByIdAndUpdate(user_id, { img3: name }).exec((err) => {
                if (err) res.send({ error: true, data: 'err' + err });
                else res.send({ error: false, data: name });
            });
        }
    },
    addUserImg4: async(req, res) => {
        let user_id = req.body.user_id;
        let name = req.file.filename;
        let bio = req.body.bio;
        if (bio) {
            await userSchemaModel.findByIdAndUpdate(user_id, { img4: name, bio: bio }).exec((err) => {
                if (err) res.send({ error: true, data: 'err' + err });
                else res.send({ error: false, data: name });
            });
        } else {
            await userSchemaModel.findByIdAndUpdate(user_id, { img4: name }).exec((err) => {
                if (err) res.send({ error: true, data: 'err' + err });
                else res.send({ error: false, data: name });
            });
        }
    },
    addUserImg5: async(req, res) => {
        let user_id = req.body.user_id;
        let name = req.file.filename;
        let bio = req.body.bio;
        if (bio) {
            await userSchemaModel.findByIdAndUpdate(user_id, { img5: name, bio: bio }).exec((err) => {
                if (err) res.send({ error: true, data: 'err' + err });
                else res.send({ error: false, data: name });
            });
        } else {
            await userSchemaModel.findByIdAndUpdate(user_id, { img5: name }).exec((err) => {
                if (err) res.send({ error: true, data: 'err' + err });
                else res.send({ error: false, data: name });
            });
        }
    },
    addUserImg6: async(req, res) => {
        let user_id = req.body.user_id;
        let name = req.file.filename;
        let bio = req.body.bio;
        if (bio) {
            await userSchemaModel.findByIdAndUpdate(user_id, { img6: name, bio: bio }).exec((err) => {
                if (err) res.send({ error: true, data: 'err' + err });
                else res.send({ error: false, data: name });
            });
        } else {
            await userSchemaModel.findByIdAndUpdate(user_id, { img6: name }).exec((err) => {
                if (err) res.send({ error: true, data: 'err' + err });
                else res.send({ error: false, data: name });
            });
        }
    },

    remUserImg1: async(req, res) => {
        var query = { _id: req.body.user_id };

        var newVal = {
            $set: {
                img: 'default-user-profile-image.png'
            }
        }
        await userSchemaModel.updateOne(query, newVal, function(err) {
            if (err) {
                res.send(err);
            }
            res.status(200).json({ error: false, data: "done" });
        });
    },

    remUserImg2: async(req, res) => {
        var query = { _id: req.body.user_id };

        var newVal = {
            $set: {
                img2: 'default-user-profile-image.png'
            }
        }
        await userSchemaModel.updateOne(query, newVal, function(err) {
            if (err) {
                res.send(err);
            }
            res.status(200).json({ error: false, data: "done" });
        });
    },

    remUserImg3: async(req, res) => {
        var query = { _id: req.body.user_id };

        var newVal = {
            $set: {
                img3: 'default-user-profile-image.png'
            }
        }
        await userSchemaModel.updateOne(query, newVal, function(err) {
            if (err) {
                res.send(err);
            }
            res.status(200).json({ error: false, data: "done" });
        });
    },

    remUserImg4: async(req, res) => {
        var query = { _id: req.body.user_id };

        var newVal = {
            $set: {
                img4: 'default-user-profile-image.png'
            }
        }
        await userSchemaModel.updateOne(query, newVal, function(err) {
            if (err) {
                res.send(err);
            }
            res.status(200).json({ error: false, data: "done" });
        });
    },

    remUserImg5: async(req, res) => {
        var query = { _id: req.body.user_id };

        var newVal = {
            $set: {
                img5: 'default-user-profile-image.png'
            }
        }
        await userSchemaModel.updateOne(query, newVal, function(err) {
            if (err) {
                res.send(err);
            }
            res.status(200).json({ error: false, data: "done" });
        });
    },

    remUserImg6: async(req, res) => {
        var query = { _id: req.body.user_id };

        var newVal = {
            $set: {
                img6: 'default-user-profile-image.png'
            }
        }
        await userSchemaModel.updateOne(query, newVal, function(err) {
            if (err) {
                res.send(err);
            }
            res.status(200).json({ error: false, data: "done" });
        });
    },


    update_phone: async(req, res) => {
        let user_id = req.body.user_id;
        let phone = req.body.phone;


        const numberExists = await userSchemaModel.findOne({ phone: phone });


        if (!numberExists) {
            const user = await userSchemaModel.findByIdAndUpdate(user_id, { phone: phone }).exec((err) => {
                if (err) res.send({ error: true, data: 'err' + err });
                else res.send({ error: false, data: user });
            });
        } else {
            res.send({ error: true, data: 'Number Used By Other Account' });
        }


    },




    update_bio: async(req, res) => {
        let user_id = req.body.user_id;
        let bio = req.body.bio;
        const user = await userSchemaModel.findByIdAndUpdate(user_id, { bio: bio }).exec((err) => {
            if (err) res.send({ error: true, data: 'err' + err });
            else res.send({ error: false, data: user });
        });
    },


    update_email: async(req, res) => {
        let user_id = req.body.user_id;
        let email = req.body.email;
        const user = await userSchemaModel.findByIdAndUpdate(user_id, { email: email }).exec((err) => {
            if (err) res.send({ error: true, data: 'err' + err });
            else {
                var transport = nodemailer.createTransport({
                    host: "hardcodelk.com",
                    port: 465,
                    auth: {
                        user: "folk@hardcodelk.com",
                        pass: "folk@1234"
                    }
                });

                var mailOptions = {
                    from: '"Folk Team" <folk@hardcodelk.com>',
                    to: req.body.email,
                    subject: 'Email Change',
                    text: 'Hey there, you have added this email to your Folk account',
                    html: '<b>Hey there! </b><br> Hey there, you have added this email to your Folk account',
                };

                transport.sendMail(mailOptions, async(error, info) => {
                    if (error) {
                        res.send({ error: true, data: 'err' + error });
                        return console.log(error);
                    }
                });
                res.send({ error: false, data: user });
            }

        });
    },

    update_whatudo: async(req, res) => {
        let user_id = req.body.user_id;
        let whatudo = req.body.whatudo;
        const user = await userSchemaModel.findByIdAndUpdate(user_id, { whatudo: whatudo }).exec((err) => {
            if (err) res.send({ error: true, data: 'err' + err });
            else res.send({ error: false, data: user });
        });
    },


    update_user_interest: async(req, res) => {
        let user_id = req.body.user_id;
        let ints = req.body.ints;
        const user = await userSchemaModel.findByIdAndUpdate(user_id, { interests: ints }).exec((err) => {
            if (err) res.send({ error: true, data: 'err' + err });
            else res.send({ error: false, data: user });
        });
    },

    update_selectedlocation: async(req, res) => {
        let user_id = req.body.user_id;
        let selected = req.body.selected;

        const user = await userSchemaModel.findByIdAndUpdate(mongoose.Types.ObjectId(user_id), { selectedlocation: selected }).exec((err) => {
            if (err) res.send({ error: true, data: 'err' + err });
            else res.send({ error: false, data: user });
        });
    },

    update_user_location: async(req, res) => {
        let user_id = req.body.user_id;
        let geometry = req.body.geometry;
        const user = await userSchemaModel.findById(mongoose.Types.ObjectId(user_id));

        if (user.geometry.length < 3) {
            user.geometry.push(geometry);
            await user.save(async err => {
                if (err) {
                    res.status(500).json({
                        error: true,
                        data: "unknown error" + err
                    });
                } else {
                    res.status(200).json({ error: false, data: user });
                }
            });
        } else {
            res.status(500).json({
                error: true,
                data: "Limit Reached"
            });
        }
    },

    remove_user_location: async(req, res) => {
        let user_id = req.body.user_id;
        let locationid = req.body.locationid;

        let user = await userSchemaModel.findById(mongoose.Types.ObjectId(user_id));

        await userSchemaModel.update({ '_id': mongoose.Types.ObjectId(user_id) }, {
            $pull: { "geometry": { _id: mongoose.Types.ObjectId(locationid) } },
            selectedlocation: req.body.selected

        }).exec((err) => {
            if (err) res.send({ error: true, data: 'err' + err });
            else {

                // let user = await userSchemaModel.findById(mongoose.Types.ObjectId(user_id));

                // user.selectedlocation = --user.selectedlocation;
                // await user.save();

                res.send({ error: false, data: "Location Removed" });
            }
        });
    },


    update_bio_and_name: async(req, res) => {
        let user_id = req.body.user_id;
        let bio = req.body.bio;
        let user_name = req.body.user_name;
        await userSchemaModel.findByIdAndUpdate(user_id, { bio: bio, user_name: user_name }).exec((err) => {
            if (err) res.send({ error: true, data: 'err' + err });
            else res.send({ error: false, bio: bio, user_name: user_name });
        });
    },
    update_password: async(req, res) => {

        const { error } = updatePasswordValidation(req.body)
        if (!error) {
            let user_id = req.body.user_id;
            let old_password = req.body.old_password;
            let new_password = req.body.new_password;
            const user = await userSchemaModel.findOne({ _id: user_id });

            const isPasswordMatch = await passwordHash.verify(
                old_password,
                user.password
            );

            if (!isPasswordMatch) {
                res.status(500).json({ error: true, data: "password not match !" });
            } else {
                const hashedPassword = await passwordHash.generate(new_password);
                user.password = hashedPassword;
                user.save();
                res.status(200).json({ error: false, data: 'done' });
            }
        } else {
            let detail = error.details[0].message;
            res.send({ error: true, data: detail });
        }

    },
    updateAndAddUserToken: async function(req, res) {
        if (req.body.id && req.body.token) {

            await userSchemaModel.findByIdAndUpdate(req.body.id, {
                token: req.body.token
            });
            res.status(500).json({
                error: false,
                data: 'done'
            });
        } else {
            res.status(500).json({
                error: false,
                data: ' user id is required ! or token '
            });
        }
    },
    sendresetmail: async function(req, res) {
        const emailExists = await userSchemaModel.findOne({ email: req.body.email });
        if (emailExists) {
            const resetCode = Math.floor(Math.random() * Math.floor(999999));

            var transport = nodemailer.createTransport({
                host: "hardcodelk.com",
                port: 465,
                auth: {
                    user: "folk@hardcodelk.com",
                    pass: "folk@1234"
                }
            });
            var mailOptions = {
                from: '"Folk Team" <folk@hardcodelk.com>',
                to: req.body.email,
                subject: 'Reset Password',
                text: 'Hey there, This is your password reset email',
                html: '<b>Hey there! </b><br> This is your password reset email<br />Use This Code For Login:' + resetCode,
            };
            transport.sendMail(mailOptions, async(error, info) => {
                if (error) {
                    res.send({ status: "failed" });
                    return console.log(error);
                }
                const PASSRESET = new PassReset({
                    email: req.body.email,
                    resetcode: resetCode
                });
                try {
                    const savePASSRESET = await PASSRESET.save();

                    res.send({ status: "sent" });
                    console.log('Message sent');
                } catch (err) {
                    res.status(400).send(err);
                }
            });
        } else {
            res.status(200).json({
                error: true,
                message: 'no user'
            });
        }
    },


    verifyemail: async function(req, res) {
        const resetExists = await PassReset.findOne({
            email: req.body.email,
            resetcode: req.body.code
        });
        if (resetExists) {
            await PassReset.deleteOne(resetExists);

            const user = await userSchemaModel.findOne({
                email: req.body.email
            });

            const token = jwt.sign({
                _id: user._id,
                u_name: user.name,
                imagesource: user.imagesource,
                base_64: user.base_64,
                fb_url: user.fb_url,
            }, process.env.TOKEN_SECRET);

            res.status(200).json({
                error: false,
                data: user,
                loginstatus: 'olduser',
                token: token
            });
        } else {
            res.status(200).json({
                error: true,
                message: 'invalid code'
            });
        }
    },

    //////////////////////////////////////////////////////



    followRequest: async(req, res) => {
        const { user_id, peer_id, user_name } = req.body;


        const userReqModel = new userRequestSchemaModel({
            user_id: user_id,
            peer_id: peer_id
        });
        await userReqModel.save(async err => {
            if (err) {
                res.status(500).json({
                    error: true,
                    data: "err" + err
                });
            } else {
                let postData = await userSchemaModel.findById(peer_id);
                postData.usersRequested.push(user_id);

                await postData.save();

                if (user_id !== peer_id) {
                    let userToNotify = await userSchemaModel.findById(peer_id);

                    let peerToken = userToNotify.token;

                    var payload = {
                        notification: {
                            body: `${user_name} has requested to follow you`,
                            title: "Folk App"
                        },
                        data: {
                            id: `${user_id}`,
                            post_owner_id: `${peer_id}`,
                            screen: "followrequest",
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
                }

                res.status(200).json({ error: false, data: "done" });
            }
        });
    },

    cancelFollowRequest: async(req, res) => {

        try {
            const { user_id, peer_id } = req.body;

            await userRequestSchemaModel
                .find({ user_id: user_id, peer_id: peer_id })
                .remove();

            let postData = await userSchemaModel.findById(peer_id);

            postData.usersRequested.remove(user_id);
            await postData.save();

            res.status(200).json({ error: false, data: "done" });
        } catch (error) {
            let detail = error;
            res.send({ error: true, data: detail });
        }
    },

    declineFollowRequest: async(req, res) => {

        try {
            const { user_id, followed_by } = req.body;

            await userRequestSchemaModel
                .find({ user_id: followed_by, peer_id: user_id })
                .remove();

            let postData = await userSchemaModel.findById(user_id);

            postData.usersRequested.remove(followed_by);
            await postData.save();

            res.status(200).json({ error: false, data: "done" });
        } catch (error) {
            let detail = error;
            res.send({ error: true, data: detail });
        }
    },

    unfollowUser: async(req, res) => {

        try {
            const { user_id, peer_id } = req.body;

            await UserFollowSchemaModel
                .find({
                    user_id: mongoose.Types.ObjectId(user_id),
                    peer_id: mongoose.Types.ObjectId(peer_id)
                })
                .remove();

            let postData = await userSchemaModel.findById(peer_id);
            postData.followercount = --postData.followercount;

            postData.usersFollowed.remove(mongoose.Types.ObjectId(user_id));
            await postData.save();

            res.status(200).json({ error: false, data: "done" });
        } catch (error) {
            let detail = error;
            res.send({ error: true, data: detail });
        }
    },


    acceptFollowRequest: async(req, res) => {

        try {
            const { user_name, request_id, me, followed_by } = req.body;

            await userRequestSchemaModel.findByIdAndRemove(request_id);

            const userFollowModel = new UserFollowSchemaModel({
                user_id: followed_by,
                peer_id: me
            });
            await userFollowModel.save(async err => {
                if (err) {
                    res.status(500).json({
                        error: true,
                        data: "err" + err
                    });
                } else {
                    let postData = await userSchemaModel.findById(me);
                    postData.followercount = ++postData.followercount;
                    postData.usersRequested.remove(mongoose.Types.ObjectId(followed_by));
                    postData.usersFollowed.push(mongoose.Types.ObjectId(followed_by));
                    await postData.save();


                    let userToNotify = await userSchemaModel.findById(followed_by);

                    let peerToken = userToNotify.token;

                    var payload = {
                        notification: {
                            body: `${user_name} accepted your request`,
                            title: "Folk App"
                        },
                        data: {
                            id: `${me}`,
                            post_owner_id: `${me}`,
                            screen: "followrequest",
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
                    res.status(200).json({ error: false, data: "done" });
                }
            });



        } catch (error) {
            let detail = error;
            res.send({ error: true, data: detail });
        }
    },

    //////////////////////////////////////////////

    getUserReqs: async(req, res) => {

        let results = {};
        const { user_id } = req.body;

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
                },
            }
        };

        var userMatchString = { "$match": { "peer_id": mongoose.Types.ObjectId(user_id) } }


        var aggregateString = [
            userMatchString,
            lookupString,
            projectString,
        ];



        userRequestSchemaModel.aggregate(aggregateString).then(async function(posts) {

            if (posts.length === 0) {
                results.error = true;
                results.data = 'No posts ';
                res.send(results);
            } else {
                res.send({ error: false, data: posts });
            }
        });
    },

    //////////////////////////////////////////////////////

    getFollowers: async(req, res) => {

        let results = {};
        const { peer_id, user_id } = req.body;

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

        var eventMatchString = { "$match": { "peer_id": mongoose.Types.ObjectId(peer_id) } }
            // var sortParameter = 'relevance';

        var aggregateString = [
            eventMatchString,
            sortString,
            lookupString,
            projectString,
        ];

        UserFollowSchemaModel.aggregate(aggregateString).then(async function(posts) {

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

    //////////////////////////////////////////////////////

    getFolliwing: async(req, res) => {

        let results = {};
        const { peer_id, user_id } = req.body;

        var lookupString = {
            "$lookup": {
                "from": userSchemaModel.collection.name,
                "localField": "peer_id",
                "foreignField": "_id",
                "as": "peer_id"
            }
        };
        var projectString = {
            "$project": {
                "user_id": {
                    "img": "$peer_id.img",
                    "_id": "$peer_id._id",
                    "user_name": "$peer_id.user_name",
                    "bday": "$peer_id.bday",
                    "imagesource": "$peer_id.imagesource",
                    "fb_url": "$peer_id.fb_url",
                    "followercount": "$peer_id.followercount",
                    "isUserFollowed": "$peer_id.isUserFollowed",
                    "usersFollowed": "$peer_id.usersFollowed",
                    "isUserRequested": "$peer_id.isUserRequested",
                    "usersRequested": "$peer_id.usersRequested",
                    "token": "$peer_id.token"
                },
            }
        };

        var sortString = { "$sort": { "createdAt": -1 } };

        var eventMatchString = { "$match": { "user_id": mongoose.Types.ObjectId(peer_id) } }
            // var sortParameter = 'relevance';

        var aggregateString = [
            eventMatchString,
            sortString,
            lookupString,
            projectString,
        ];

        UserFollowSchemaModel.aggregate(aggregateString).then(async function(posts) {

            if (posts.length === 0) {
                results.error = true;
                results.data = 'No Users ';
                res.send(results);
            } else {

                posts.forEach((post) => {
                    post.user_id['isUserFollowed'][0] = post.user_id['usersFollowed'][0].some(id => id.equals(user_id))
                });

                posts.forEach((post) => {
                    post.user_id['isUserRequested'][0] = post.user_id['usersRequested'][0].some(id => id.equals(user_id))
                });

                res.send({ error: false, data: posts });

            }
        });
    },

};



function createUserValidation(user) {
    const schema = Joi.object().keys({
        user_name: Joi.string().min(5).max(30).required(),
        email: Joi.string().email({ minDomainAtoms: 2 }).max(30).required(),
        password: Joi.string().min(6).max(30).required(),
    });
    return Joi.validate(user, schema);
}

function updatePasswordValidation(user) {
    const schema = Joi.object().keys({
        user_id: Joi.string().required(),
        old_password: Joi.string().min(6).max(30).required(),
        new_password: Joi.string().min(6).max(30).required(),
    });
    return Joi.validate(user, schema);
}

function loginUserValidation(user) {
    const schema = Joi.object().keys({
        email: Joi.required(),
        password: Joi.required(),
    });
    return Joi.validate(user, schema);
}

function idValidation(id) {
    const schema = Joi.object().keys({
        user_id: Joi.required(),
    });
    return Joi.validate(id, schema);
}
"use strict";
//created by Hatem Suthura


const { instaSchemaModel } = require('../models/InstaAuthModel');


module.exports = {

    saveUserToken: async(req, res) => {

        const {
            user_id,
            user_token
        } = req.body;

        const instaModel = new instaSchemaModel({
            user_id: user_id,
            user_token: user_token
        });
        await instaModel.save(async err => {
            if (err) {
                res.status(500).json({
                    error: true,
                    data: "err" + err
                });
            } else {
                
                res.status(200).json({ error: false, data: instaModel });
            }
        });

    },

    getInstaToken: async(req, res) => {

        const instaModel = await instaSchemaModel.find({ user_id: req.body.user_id });
        if (instaModel.length === 0) {
            res.status(500).json({ error: true, data: "not found" });
        } else {
            res.status(200).json({user_token:instaModel[0].user_token});
        }

    },

    // markasread: async(req, res) => {
    //     var query = { notif_to_user: req.body.user_id };

    //     var newVal = { $set: { isread: true } }

    //     await instaSchemaModel.updateMany(query, newVal, function(err) {
    //         if (err) {
    //             res.status(500).json({ error: true, data: "err" + err });
    //         }
    //         res.status(200).json({ error: false, data: 'success' });
    //     });
    // },

    // getcount: async(req, res) => {

    //     const instaModel = await instaSchemaModel.find({ notif_to_user: req.body.user_id, isread: false });

    //     res.status(200).json({ error: false, count: instaModel.length });
    // },


};
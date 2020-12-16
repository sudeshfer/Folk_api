"use strict";
//created by Hatem Suthura


const { notificationsSchemaModel } = require('../models/notificationsModel');


module.exports = {

    getNotifications: async(req, res) => {

        const notifications = await notificationsSchemaModel.find({ notif_to_user: req.body.user_id }).sort({ created: -1 });
        if (notifications.length === 0) {
            res.status(500).json({ error: true, data: "no Notifications yet" });
        } else {
            res.status(200).json({ error: false, data: notifications });
        }

    },

    markasread: async(req, res) => {
        var query = { notif_to_user: req.body.user_id };

        var newVal = { $set: { isread: true } }

        await notificationsSchemaModel.updateMany(query, newVal, function(err) {
            if (err) {
                res.status(500).json({ error: true, data: "err" + err });
            }
            res.status(200).json({ error: false, data: 'success' });
        });
    },

    getcount: async(req, res) => {

        const notifications = await notificationsSchemaModel.find({ notif_to_user: req.body.user_id, isread: false });

        res.status(200).json({ error: false, count: notifications.length });
    },


};
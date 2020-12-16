"use strict";
//created by Hatem Suthura
const cors = require('cors');
const helmet = require('helmet'); // helmet morgan body-parser mongoose
const morgan = require('morgan');
const bodyParser = require('body-parser');
const express = require("express");
const mongoose = require('mongoose');
const userRouter = require('./router/userRouter');
const postRouter = require('./router/postRouter.js');
const eventRouter = require('./router/eventRouter.js');
const likesRouter = require('./router/likesRouter');
const conversionsRouter = require('./router/conversionsRouter');
const messageRouter = require('./router/messagesRouter');
const commentRouter = require('./router/commentsRouter');
const notificationsRouter = require('./router/notificationsRouter');
const publicRoomRouter = require('./router/publicRoomsRouter');
const publicRoomMessagesRouter = require('./router/publicRoomMessagesRouter');
const instaAuthRouter = require('./router/instaAuthRouter');
const dotenv = require('dotenv');
const app = express();
dotenv.config();

// adding Helmet to enhance your API's security
app.use(helmet());

// enabling CORS for all requests
app.use(cors());

// adding morgan to log HTTP requests
app.use(morgan('combined'));

app.use(express.json());
//
//to send data from post man and any front end
app.use(bodyParser.json({ limit: "200mb" }));
app.use(bodyParser.urlencoded({ limit: "200mb", extended: true, parameterLimit: 1000000 }));

// public place for img
app.use('/uploads', express.static('uploads'));

// parse an HTML body into a string
app.use(bodyParser.json());
const serviceAccount = require('./ocr-project-f6d5d-firebase-adminsdk-1d1v0-efc8ae19a8.json');
var admin = require("firebase-admin");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://yourtech-a45201.firebaseio.com"
});



// for local
// const mongoUrlLocal = 'mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&ssl=false'

const mongoUrlLocal = 'mongodb://admin:admin@newdatabase-shard-00-00-uc2xk.mongodb.net:27017,newdatabase-shard-00-01-uc2xk.mongodb.net:27017,newdatabase-shard-00-02-uc2xk.mongodb.net:27017/folk?ssl=true&replicaSet=newDatabase-shard-0&authSource=admin&retryWrites=true&w=majority'
mongoose.connect(mongoUrlLocal, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => { console.log('connected to data base'); });



// static end point for user api
app.use('/api/user', userRouter);
app.use('/api/post', postRouter);
app.use('/api/event', eventRouter);
app.use('/api/conversions', conversionsRouter);
app.use('/api/like', likesRouter);
app.use('/api/message', messageRouter);
app.use('/api/comment', commentRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/rooms', publicRoomRouter);
app.use('/api/roomsMessages', publicRoomMessagesRouter);
app.use('/api/instaAuth', instaAuthRouter);



module.exports = app;
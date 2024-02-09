"use strict";

const express = require("express");
const path = require("path");
const pjson = require(path.join(__dirname, "../package.json"));

const router = express.Router();

const user = require("../controllers/user.controller");
const Chat = require("../controllers/Chat.controller")
const subscriptionHandler = require("../controllers/subscriptionHandler");
const alert = require("../controllers/alert.controller");

const { isAuth } = require("../services/auth");

//User
router
  .route("/user")
  .get(isAuth, user.list_all_users)
  .delete(isAuth, user.deleteUsers);
router.route("/user/profile").get(isAuth, user.profile);
router.route("/user/login").post(user.login);
router.route("/user/check2FA").post(user.check2FA);
router.route("/user/register").post(user.register);
router.route("/user/:id").delete(isAuth, user.delete).put(isAuth, user.update);

//Notifications
router
  .route("/subscription/:id")
  .get(subscriptionHandler.sendPushNotificationAux)
  .post(subscriptionHandler.handlePushNotificationSubscription);
router.route("/subscription/delete/:id").get(subscriptionHandler.deleteAllKeys);

//Alert
router
  .route("/alert")
  .get(isAuth, alert.getAllAlert)
  .post(isAuth, alert.createAlert)
  .delete(isAuth, alert.deleteAlert);
router.route("/alert/:id").put(isAuth, alert.updateAlert);

//Chat
router
    .route("/Chat")
    .get(isAuth, Chat.getAllChats)
    .post(isAuth, Chat.createChat)
    .delete(isAuth, Chat.deleteChats);
router.route("/Chat/:id").put(isAuth, Chat.updateChat);

router.route("/").get((req, res) =>
  res.json({
    name: pjson.description,
    version: pjson.version,
    client_ip: req.connection.remoteAddress,
  })
);

module.exports = router;

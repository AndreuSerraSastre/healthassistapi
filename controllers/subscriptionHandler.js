const mongoose = require("mongoose");
const { sendPushNotification } = require("../utils/notificationAux");
const { createInternalAlert } = require("./alert.controller");
const { sendAlert } = require("../services/mail");
const User = mongoose.model("User");

const handlePushNotificationSubscription = async (req, res) => {
  const _id = req.params.id;
  let user = await User.findById(_id);
  user.pushkeys.push(req.body);
  user = await User.findByIdAndUpdate(_id, user, {
    runValidators: true,
    new: true,
  });
  res.status(201).json(user);
};

const deleteAllKeys = async (req, res) => {
  const _id = req.params.id;
  let user = await User.findById(_id);
  user.pushkeys = [];
  user = await User.findByIdAndUpdate(_id, user, {
    runValidators: true,
    new: true,
  });
  res.status(201).json(user);
};

const sendPushNotificationAux = async (req, res) => {
  const _id = req.params.id;
  let user = await User.findById(_id);
  sendNotification(
    [user],
    "Prueba de notificación",
    "Buenas noticias, las notificaciones llegan a este dispositivo",
    null,
    "notification-test",
    "https://healthassist-app.app.elingenierojefe.es/"
  );
  res.status(202).json({});
};

const sendNotification = async (
  users,
  title,
  text,
  image,
  tag,
  url,
  goTo,
  typeDispatch,
  objectId,
  from
) => {
  let result = true;

  for (let index = 0; index < users.length; index++) {
    const userId = users[index];

    const user = await User.findById(userId);

    if (user.webNotifications) {
      await createInternalAlert({
        title: title,
        description: text,
        to: userId,
        goTo: goTo,
        typeDispatch: typeDispatch,
        objectId: objectId,
        from: from || userId,
      });
    }

    if (user.mailNotifications) sendAlert(user, title, text, url);

    if (user.pushNotifications) {
      user.pushkeys.forEach((pushkey) => {
        if (!sendPushNotification(pushkey, title, text, image, tag, url)) {
          result = false;
        }
      });
    }
  }
  return result;
};

module.exports = {
  handlePushNotificationSubscription,
  sendPushNotificationAux,
  deleteAllKeys,
  sendNotification,
};

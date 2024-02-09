const mongoose = require("mongoose");
const cron = require("node-cron");
const moment = require("moment");
const { sendNotification } = require("../controllers/subscriptionHandler");

exports.singUpsAlerts = async () => {
  //const User = require("./../models");
  const User = mongoose.model("User");
  const users = await User.find();

  for (let index = 0; index < users.length; index++) {
    const user = users[index];
    for (let i = 0; i < user.notifications.length; i++) {
      const element = user.notifications[i];
      if (element.notify) {
        const minutes = moment(element.time).format("mm");
        const hour = moment(element.time).format("HH");
        cron.schedule(minutes + " " + hour + " * * *", async () => {
          try {
            await sendNotification(
              [user],
              element.text,
              "Puede desactivar esta opción en el perfil.",
              "",
              "custom-notification-" + element.text,
              "https://healthassist-app.app.elingenierojefe.es"
            );
          } catch (err) {
            console.log("ERROR SING-UP:", err);
          }
        });
      }
    }
  }
};

exports.resetAlerts = async () => {
  for (let index = 0; index < cron.getTasks().length; index++) {
    const element = cron.getTasks()[index];
    element.stop();
  }
  await this.singUpsAlerts();
};

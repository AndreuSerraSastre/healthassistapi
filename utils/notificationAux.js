const webpush = require("web-push");
const { v4: uuidv4 } = require("uuid");

const vapidKeys = {
  privateKey: "bdSiNzUhUP6piAxLH-tW88zfBlWWveIx0dAsDO66aVU",
  publicKey:
    "BIN2Jc5Vmkmy-S3AUrcMlpKxJpLeVRAfu9WBqUbJ70SJOCWGCGXKY-Xzyh7HDr6KbRDGYHjqZ06OcS3BjD7uAm8",
};

webpush.setVapidDetails(
  "mailto:example@yourdomain.org",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

exports.sendPushNotification = (suscription, title, text, image, tag, url) => {
  webpush
    .sendNotification(
      suscription,
      JSON.stringify({
        title,
        text,
        image,
        tag: uuidv4(),
        url,
      })
    )
    .catch((err) => {
      return false;
    });
  return true;
};

exports.sendPushNotificationUser = async (
  user,
  title,
  text,
  image,
  tag,
  url
) => {
  let result = true;
  user.pushkeys.forEach((pushkey) => {
    if (!this.sendPushNotification(pushkey, title, text, image, tag, url)) {
      result = false;
    }
  });
  return result;
};

const { getUserById } = require("../controllers/user.controller");
const { sendPushNotificationUser } = require("./notificationAux");

function removeItemAll(arr, value) {
  var i = 0;
  while (i < arr.length) {
    if (arr[i].equals(value)) {
      arr.splice(i, 1);
    } else {
      ++i;
    }
  }
  return arr;
}

exports.sendPushNotificationForUsers = async (users, currentuser, body) => {
  const finalUsers = removeItemAll(users, currentuser);

  finalUsers.map(async (user_id) => {
    const user = await getUserById(user_id);
    sendPushNotificationUser(
      user,
      body.title,
      body.text,
      body.image,
      body.tag,
      body.url
    );
  });
};

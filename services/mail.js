var nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  auth: {
    user: "elingenierojefe@gmail.com",
    pass: "jdzsntyawodneozi",
  },
});

exports.sent2FA = (DOBLEFAValue, mail) => {
  var mailOptions = {
    from: "elingenierojefe@gmail.com",
    to: mail,
    subject: "Aquí está el código de doble autentificación",
    text: "Introduce el siguiente código para poder acceder: " + DOBLEFAValue,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

exports.sendAlert = (user, title, text, url) => {
  if (user.email) {
    var mailOptions = {
      from: "elingenierojefe@gmail.com",
      to: user.email,
      subject: title,
      text:
        text + "\n" + "En el siguiente enlace podrás acceder a la web: " + url,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  }
};

exports.sendTest = () => {
  var mailOptions = {
    from: "elingenierojefe@gmail.com",
    to: "andreuserrasastre@gmail.com",
    subject: "Prueba",
    text: "Prueba",
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

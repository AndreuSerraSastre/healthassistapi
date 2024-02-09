"use strict";

const jwt = require("jsonwebtoken");
const fs = require("fs");
const Hashids = require("hashids");
const publicKey = fs.readFileSync("./config/public.key", "utf8");
const hashids = new Hashids(process.env.HASHID_SALT);
const privateKey = fs.readFileSync("./config/private.key", "utf8");
const exp_time = "24h";
const jwt_algorithm = "RS256";
const signOptions = { expiresIn: exp_time, algorithm: jwt_algorithm };
const mongoose = require("mongoose");
const User = mongoose.model("User");
const moment = require("moment");

var auth = {
  isAuth: (req, res, next) => {
    const authHeader = req.headers["authorization"];

    if (authHeader == undefined) {
      return res
        .status(401)
        .json({ error_code: "NO_TOKEN", message: "No token provided" });
    }

    const accessToken = authHeader.replace("Bearer ", "");

    jwt.verify(accessToken, publicKey, async (err, data) => {
      if (err) {
        return res
          .status(401)
          .json({ error_code: "INVALID_TOKEN", message: "Invalid token" });
      }
      data.usr = decode(data.usr);
      data.role = decode(data.role);
      req.decoded = data;

      await User.findByIdAndUpdate(data.usr, { last_login: moment() })

      next();
    });
  },
  userAuth: (user) => {
    try {
      let payload = {
        usr: encode(user._id + ""),
        role: encode(user.role + ""),
      };
      return jwt.sign(payload, privateKey, signOptions);
    } catch (err) {
      console.log(err);
      return err;
    }
  },
};

const encode = (id) => {
  return hashids.encodeHex(id);
};

var decode = (hashdid) => {
  return hashids.decodeHex(hashdid);
};

module.exports = auth;

"use strict";

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const logger = require("../utils/logger");
const auth = require("../services/auth");
const { catchAsync } = require("../utils/catchAsync");
const { deleteFile, storeFile } = require("../services/storage.service");
const { resetAlerts } = require("../utils/backgroundTasks");
const User = mongoose.model("User");
const salt_rounds = Number(process.env.BCRYPT_SALT_ROUNDS);
const { v4: uuidv4 } = require("uuid");
const { sent2FA, sendTest } = require("../services/mail");
let DOBLEFAVALUES = [];

exports.login = catchAsync(async (req, res, next) => {
  let { username, password } = req.body;

  if (!username || !password) {
    logger.warn(
      `${req.id} [MISSING CREDENTIALS] Failed user login attempt: ${username}`
    );

    return res.status(400).json({
      error_code: "MISSING_CREDENTIALS",
      message: "Missing username or password",
    });
  }

  let user = await User.findOne({ username: username, deleted: false });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    logger.warn(
      `${req.id} [INVALID CREDENTIALS] Failed user login attempt: ${username}`
    );

    return res.status(401).json({
      error_code: "INVALID_CREDENTIALS",
      message: "Invalid username or password",
    });
  }

  let token = await auth.userAuth(user);

  const resUser = await User.findByIdAndUpdate(user._id, {
    $set: { last_login: new Date() },
  });

  if (resUser.DOBLEFA) {
    const dobleFA = uuidv4().split("-")[0];
    sent2FA(dobleFA, resUser.email);
    DOBLEFAVALUES = DOBLEFAVALUES.filter((x) => x.username !== resUser.user);
    DOBLEFAVALUES.push({
      username: resUser.username,
      dobleFA,
      access_token: token,
    });
    return res.status(300).json({
      error_code: "ES NECESARIO EL CÓDIGO DE 2FA.",
      message: "ES NECESARIO EL CÓDIGO DE 2FA.",
    });
  } else {
    logger.info(`${req.id} Successful user login: ${username}`);

    return res.status(200).json({
      resUser,
      access_token: token,
    });
  }
});

exports.register = catchAsync(async (req, res, next) => {
  let user = new User(req.body);

  user.password = await bcrypt.hash(req.body.password, salt_rounds);

  await user.save();

  logger.info(`${req.id} User created successfully`);

  return res.status(201).json(user);
});

exports.list_all_users = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json(users);
});

exports.profile = catchAsync(async (req, res, next) => {
  const users = await User.findById(req.decoded.usr);

  res.status(200).json(users);
});

exports.delete = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.deleteMany(id);

  res.status(200).json(user);
});

exports.recover = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findByIdAndUpdate(id, { deleted: false });

  res.status(200).json(user);
});

exports.update = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const oldUser = await User.findById(id);

  if (req.body.password) {
    req.body.password = await bcrypt.hash(req.body.password, salt_rounds);
  }

  if (req.body.picture && !req?.body?.picture?._id) {
    if (oldUser.picture && oldUser?.picture?._id) {
      await deleteFile(oldUser?.picture?._id);
    }
    req.body.picture = await storeFile(req.body.picture, "profile_pic.png");
  }

  const user = await User.findByIdAndUpdate(id, req.body, {
    runValidators: true,
    new: true,
  });

  resetAlerts();

  res.status(200).json(user);
});

exports.deleteUsers = catchAsync(async (req, res) => {
  const ids = req.body;
  const query = await User.deleteMany(
    {
      _id: { $in: ids },
    },
  );

  this.list_all_users(req, res);
});

exports.getUserById = async (user_id) => {
  const user = await User.findById(user_id).select("-password");
  return user;
};

exports.updateUserById = async (user_id, body) => {
  const user = await User.findByIdAndUpdate(user_id, body, {
    runValidators: true,
    new: true,
  });
  return user;
};

exports.check2FA = catchAsync(async (req, res) => {
  const { username, dobleFA } = req.body;

  const params = DOBLEFAVALUES.find((x) => x.username === username);

  let user = await User.findOne({ username: username, deleted: false });

  if (params?.dobleFA === dobleFA) {
    DOBLEFAVALUES = DOBLEFAVALUES.filter((x) => x.username !== username);

    res.status(200).json({ resUser: user, access_token: params.access_token });
  } else {
    res.status(500).json("Código incorrecto");
  }
});

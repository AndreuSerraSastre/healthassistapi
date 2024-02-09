"use strict";

const mongoose = require("mongoose");

const ROLES = {
  admin: "a2470ee4",
  user: "a2470ee3"
};

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      unique: true,
      required: "You must send an username",
    },
    name: {
      type: String,
      trim: true,
      required: "You must send a name",
    },
    surname: {
      type: String,
      required: "You must send a surname",
    },
    email: {
      type: String,
      match: /^\S+@\S+\.\S+$/,
      trim: true,

      unique: true,
      required: "You must send an email address",
    },
    phone: {
      type: Number,
      trim: true,
    },
    role: {
      type: String,
      enum: ROLES,
      default: "a2470ee3",
      required: "You must send an user role",
    },
    DOBLEFA: {
      type: Boolean,
      default: false,
    },
    DOBLEFAValue: {
      type: String,
    },
    password: {
      type: String,
      required: "You must send a password",
    },
    picture: {
      type: Object,
    },
    last_login: {
      type: Date,
    },
    pushNotifications: {
      type: Boolean,
      default: true,
    },
    mailNotifications: {
      type: Boolean,
      default: true,
    },
    webNotifications: {
      type: Boolean,
      default: true,
    },
    deleted: {
      type: Boolean,
      default: false,
      required: "You must send a deleted value",
    },
    pushkeys: {
      type: Object,
      default: [],
    },
    notifications: {
      type: Object,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

/*UserSchema.path('username').validate(async (value) => {
  const usernameCount = await mongoose.models.Users.countDocuments({username: value });
  return !usernameCount;
}, 'User already exists (Username)');*/

module.exports = mongoose.model("User", UserSchema);

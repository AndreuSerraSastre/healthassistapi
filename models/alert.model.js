"use strict";

const mongoose = require("mongoose");

const AlertSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: "You must send a title",
    },
    description: {
      type: String,
      trim: true,
    },
    typeDispatch: {
      type: String,
    },
    goTo: {
      type: String,
    },
    objectId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: "You must send a user",
    },
    to: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: "You must send a user to",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Alert", AlertSchema);

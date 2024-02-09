"use strict";

const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema(
  {
    //FIELDS
    messages: [{
      type: Object,
      default: [],
    }],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      default: "Sin título"
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Chat", ChatSchema);

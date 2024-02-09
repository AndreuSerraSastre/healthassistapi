"use strict";

const express = require("express");
const http = require("http");
const mongoose = require("mongoose");

const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv").config();
const requestId = require("express-request-id")();
const morgan = require("morgan");
const socketio = require("socket.io");

const pjson = require(path.join(__dirname, "package.json"));

const { app, server, io } = require("./server");

/* DB Models */

const User = require("./models");
const { sockets } = require("./utils/sockets");

/* DB Models */

const routes = require(path.join(__dirname, "routes"));
const logger = require(path.join(__dirname, "utils/logger"));

const port = process.env.PORT || 3005;
const env = process.env.NODE_ENV || "development";

const loggerFormat = ":id;:method;:url;:status;:response-time ms;";

/* Mongoose config */
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.Promise = global.Promise;
mongoose.connect(
  env === "development"
    ? process.env.FULL_DB_URI_DEVELOP
    : process.env.FULL_DB_URI,
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  }
);
mongoose.connection.on("connected", function () {
  logger.info(
    `MongoDB connection is open to ${
      env === "development"
        ? process.env.FULL_DB_URI_DEVELOP
        : process.env.FULL_DB_URI
    }`
  );
  const { singUpsAlerts } = require("./utils/backgroundTasks");
  singUpsAlerts();
});

mongoose.connection.on("error", function (err) {
  logger.info("MongoDB connection has occured " + err + " error");
});

mongoose.connection.on("disconnected", function () {
  logger.info("MongoDB connection is disconnected");
});

process.on("SIGINT", function () {
  mongoose.connection.close(function () {
    logger.info(
      "MongoDB connection is disconnected due to application termination"
    );
    process.exit();
  });
});

/* Mongoose config */

app.set("port", port);
app.disable("x-powered-by");
app.use(cors({ credentials: true, origin: true }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json({ limit: "50mb" }));
app.use(requestId);

morgan.token("id", function getId(req) {
  return req.decoded?.usr;
});

app.use(morgan(loggerFormat, { stream: logger.stream }));

app.use(routes);

sockets(io);

server.listen(app.get("port"), function () {
  logger.info(
    `${pjson.description} running in port ${
      server.address().port
    } | env: ${env}`
  );
});

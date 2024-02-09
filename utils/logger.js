"use strict";

const appRoot = require("app-root-path");
const pjson = require("./../package.json");

const env = process.env.NODE_ENV || "development";
const { createLogger, format, transports } = require("winston");

var options = {
  file: {
    level: "debug",
    filename: `${appRoot}/logs/${pjson.name}.log`,
    handleExceptions: true,
    maxsize: 1073741824, // 1GB
    maxFiles: 500,
    colorize: false,
    format: format.combine(
      format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
      }),
      format.json()
    ),
  },
  console: {
    level: "debug",
    handleExceptions: true,
    format: format.combine(
      format.label({ label: pjson.name }),
      format.colorize(),
      format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
      }),
      format.printf(
        (info) =>
          `${info.timestamp} ${info.level} [${info.label}]: ${info.message}`
      )
    ),
  },
};

var logger = createLogger({
  transports: [
    new transports.File(options.file),
    new transports.Console(options.console),
  ],
  exitOnError: false, // do not exit on handled exceptions
});

logger.stream = {
  write: function (message, encoding) {
    logger.debug(message);
  },
};

module.exports = logger;

const winston = require("winston");

const logConfiguration = {
  exitOnError: false,
  transports: [
    new winston.transports.Console({
      level: "silly",
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({
      level: "info",
      filename: "./logs/info.log",
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({
      level: "debug",
      filename: "./logs/debug.log",
      format: winston.format.printf(({ message }) => message),
    }),
    new winston.transports.File({
      level: "error",
      filename: "./logs/errors.log",
    }),
    new winston.transports.File({
      filename: "./logs/exceptions.log",
      handleExceptions: true,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: "./logs/rejections.log" }),
  ],
};

const logger = winston.createLogger(logConfiguration);

module.exports = logger;

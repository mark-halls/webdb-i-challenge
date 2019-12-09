const express = require("express");

const router = require(`./accounts/accounts-router`);

const server = express();

server.use(logger);

server.use(`/api/accounts`, router);

module.exports = server;

function logger(req, res, next) {
  console.log(`${req.method} on ${req.originalUrl} at ${new Date(Date.now())}`);
  next();
}

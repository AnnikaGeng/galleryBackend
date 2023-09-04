const express = require("express");
const routes = require("./api/gallery");
const cors = require("cors");

function createServer() {
  const app = express();
  app.use(cors({ origin: "*" }));
  app.use(express.json());
  app.use("/", routes);
  return app;
}

module.exports = createServer;

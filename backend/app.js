global.config = require(process.env.NODE_ENV === "production"
  ? "./config-prod"
  : "./config-dev");

const express = require("express");
const cors = require("cors");
const authController = require("./controllers/auth-controller");
const vacationContoller = require("./controllers/vacations-controller");
const fileUpload = require("express-fileupload");
const io = require("socket.io");
const path = require("path");
const fs = require("fs");

const server = express();

server.use(fileUpload());
server.use(cors());
server.use(express.json());

server.use(express.static(path.join(__dirname, "../frontend")));
server.use(express.static(__dirname));
server.use("/api/auth", authController);
server.use("/api/vacations", vacationContoller);

if (!fs.existsSync("./images/")) {
  fs.mkdirSync("./images/");
}

server.use("*", (request, response) => {
  response.sendFile(path.join(__dirname, "../frontend/public/index.html"));
});

server.use("*", (request, response) =>
  response.status(404).send("Route not found.")
);
const port = process.env.PORT || 3001;

const listener = server.listen(port, () =>
  console.log("Start listining... " + port)
);
global.socketServer = io(listener);

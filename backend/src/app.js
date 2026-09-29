const express = require("express");
const cookieParser = require("cookie-parser");
const authRouter = require("./router/auth.router");
const musicRouter = require("./router/music.router");
const dns = require('dns');
dns.setServers(['8.8.8.8','1.1.1.1']
);

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRouter)
app.use("/api/music", musicRouter)
module.exports = app;


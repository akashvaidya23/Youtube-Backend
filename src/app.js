const express = require("express");
const app = express();
const cors = require("cors");
const cookieParcer = require("cookie-parser");

app.use(cors({
    origin: "*",
    credentials: true,
}));
app.use(express.json({
    limit: "20kb"
}));
app.use(express.urlencoded({extended: true, limit: "20kb"}));
app.use(express.static("public"));
app.use(cookieParcer());

module.exports = { app };
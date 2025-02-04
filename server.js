"use strict";

const express = require("express");
const app = express();
const path = require("path");
const port = 1776;

//serves the front-end content of the directory

app.use("", express.static(path.join(__dirname, "./public")));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

//serves the whole app
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log('Press Ctrl+C to end this process');
})
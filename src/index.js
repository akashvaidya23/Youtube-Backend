const { app } = require("./app.js");
const { connectDB } = require("./db/index.js");

const mongoose = require("mongoose");
const PORT = process.env.PORT || 8000;

connectDB().then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((err) => {
    console.error("Error connecting to MongoDB", err);
});

app.get("/", (req, res) => {
    res.send(`<h1>Hello there</h1>`);
});

/*
FIRST APPROACH
import express from "express";

const app = express();

;( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODBURL}/${DB_name}`);
        app.on("error", (error) => {
            console.log("Error connecting to MongoDB");
            throw error;
        });
        
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    } catch(err){
        console.log(err);
        throw err;
    }
})(); */
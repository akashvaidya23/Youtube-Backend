// require('dotenv').config({path:"/.env"});
// import connectDB from "./db/index.js";
const { connectDB } = require("./db/index.js");
const mongoose = require("mongoose");

connectDB();




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
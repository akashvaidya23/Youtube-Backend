require('dotenv').config();
const mongoose = require("mongoose");
const { DB_name } = require("../constants.js");

const connectDB = async () => {
    console.log("Connecting to MongoDB...", process.env.MONGODBURL);
    try {
        const connection = await mongoose.connect(`${process.env.MONGODBURL}/${DB_name}`);
        console.log("Hurrey, Connected to mongo DB ");
    } catch(err){
        console.log("Error connecting to MongoDB ", err);
        process.exit(1);
    }
};

module.exports = { connectDB };
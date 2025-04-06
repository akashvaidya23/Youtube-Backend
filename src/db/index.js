require('dotenv').config();
const mongoose = require("mongoose");
const { DB_name } = require("../constants.js");

const connectDB = async () => {
    try {
        const connection = await mongoose.connect(`${process.env.MONGODBURL}/${DB_name}`);
    } catch(err){
        process.exit(1);
    }
};

module.exports = { connectDB };
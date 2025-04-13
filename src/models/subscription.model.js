const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
    subscriber: {
        type: mongoose.Schema.types.ObjectId, // one who is subscribing
        ref: "User"
    }, 
    channel :{
        type: mongoose.Schema.types.ObjectId, // one to whom the subscrber is subscribing
        ref: "User"
    }
});

const Subscription = mongoose.Model("Subscription", subscriptionSchema);
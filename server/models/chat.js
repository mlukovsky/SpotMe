const mongoose = require('mongoose');
const { Schema } = mongoose;


const messageSchema = new Schema({
    text: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    time: Date
})


const chatSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: false
    },
    users: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    messages: [messageSchema]
})

module.exports = mongoose.model("Chat", chatSchema)
const mongoose = require('mongoose');
const { Schema } = mongoose;
const passportLocalMongoose = require('passport-local-mongoose');


const imageSchema = {
    url: String,
    filename: String,
    position: Number
}

const gymSchema = {
    latitude: Number,
    longitude: Number,
    name: String,
    address: String
}


const eventSchema = {
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    location: String,
    date: Date,
    description: String,
    recipients: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false
    }],
    pending: Boolean
}

const userSchema = new Schema({

    //This will only exist for users who register with google or facebook. uri is a unique id associated with a user's google/facebook account
    uri: {
        type: String,
        required: false,
        unique: true
    },
    //This will only exist for users who register with google or facebook
    provider: {
        type: String,
        required: false,
        enum: ['google', 'facebook']
    },
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: false,
        unique: true
    },
    dob: {
        type: Date,
        required: false,
        unique: false
    },
    bio: {
        type: String,
        required: false,
        unique: false
    },
    expLevel: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        required: false,
        unique: false
    },
    methods: {
        type: [String],
        enum: ['Powerlifting', 'Calisthenics', 'Cardio', 'Bodybuilding', 'Olympic Lifting', 'CrossFit', 'Yoga', 'Leg Day', 'Arm Day', 'Chest Day', 'Back Day', 'Shoulder Day', 'Filming', 'Running',
            'Maxing Out', 'Posing', 'Strength Training', 'Fat Loss', 'Muscle Building', 'General Fitness', 'Bulking', 'Cutting', 'Gear', 'Natty'],
        required: false,
        unique: false
    },
    images: [imageSchema],
    gyms: [gymSchema],
    leftSwipes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    rightSwipes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    matches: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    chats: [{
        type: Schema.Types.ObjectId,
        ref: 'Chat'
    }],
    //Radius in miles to search for other users, if not specified defaults to 10 miles
    distancePref: Number,
    //Age range to search for other users, if not specified defaults to +/- 5 years
    agePref: {
        //min will be int <=0 indicating how many years under the current user's age
        min: Number,
        //max will be int >=0 indicating how many years over the current user's age
        max: Number
    },
    events: [eventSchema]

})

//adds username and password fields to userSchema
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema)
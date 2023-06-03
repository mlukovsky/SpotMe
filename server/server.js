//Load env variables
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

//Import dependencies
const express = require('express');
const app = express();
const mongoose = require('mongoose')
const User = require('./models/user')
const Chat = require('./models/chat')
const cors = require('cors')
const session = require('express-session')
const passport = require('passport');
const { storage, cloudinary } = require('./cloudinary');
const { Server } = require('socket.io')
const { PriorityQueue } = require('./PriorityQueue');


//Socket.IO Connection & Events----------------------------------------------------------------------------


const io = new Server({
    path: '/socket.io/',
    cors: {
        origin: '*',
        credentials: true,
    },
})

io.listen(process.env.SOCKET_PORT)

io.on("connection", (socket) => {
    console.log(`${socket.id} user just connected!`);

    //Create chat room when users match
    socket.on("createRoom", async (roomName, userId, otherUserId) => {
        const chat = new Chat({
            name: roomName,
            users: [userId, otherUserId],
            messages: []
        })
        await chat.save();
        //Add this chat room to each user's chats array
        await User.findByIdAndUpdate(userId, { $push: { chats: chat._id } })
        await User.findByIdAndUpdate(otherUserId, { $push: { chats: chat._id } })
        socket.join(roomName);
        const currUser = await User.findById(userId).populate({ path: 'chats', populate: { path: 'users' } })
        //Returns the updated chat rooms via another event
        socket.emit("roomsList", currUser.chats);
    });
    //Emmitted when user enters a chat room and this sends the message history of that chat room
    socket.on("findRoom", async (id) => {
        const result = await Chat.findById(id).populate({ path: 'messages', populate: { path: 'author' } })
        socket.emit("foundRoom", result.messages)
    })
    //Emitted when user sends a new message
    socket.on("newMessage", async (data) => {
        const { room_id, message, user, timestamp } = data;
        const newMessage = {
            text: message,
            //author is user's mongodb ID
            author: user,
            time: timestamp
        }
        //Finds the room where the message was sent and add new message
        await Chat.findByIdAndUpdate(room_id, {
            $push: { messages: newMessage }
        })
        const updatedRoom = await Chat.findById(room_id).populate({ path: 'messages', populate: { path: 'author' } });
        //Updates the chatroom messages
        socket.to(updatedRoom.name).emit("roomMessage", newMessage);
        const currUser = await User.findById(user).populate({ path: 'chats', populate: { path: 'users' } });
        //Update list of chats screen and individual chat screen with the new message
        socket.emit("roomsList", currUser.chats);
        socket.emit("foundRoom", updatedRoom.messages);
    });

    socket.on("disconnect", () => {
        socket.disconnect();
        console.log("A user disconnected");
    });
})




//Socket.IO Connection & Events----------------------------------------------------------------------------


//Database Connection-------------------------------------------------------------------------------
mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
const db = mongoose.connection;
db.on('error', console.error.bind(console, "Connection error:"));
db.once('open', () => {
    console.log("Database connected");
});
//Database Connection---------------------------------------------------------------------------------

//MIDDLEWARES--------------------------------------------------------------------------------------------------------------
//cors allows the backend to accept requests from frontend domain

app.use(cors({
    origin: '*',
    credentials: true,
    optionsSuccessStatus: 200 //Some old browsers dont accept default, 204
}));


app.use(session({
    secret: 'burgers',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //date.now gives milliseconds so this indicates that cookie will expire in one day
        expires: Date.now() + 1000 * 60 * 60 * 24,
        maxAge: 1000 * 60 * 60 * 24
    }
}))

//Import passport local strategy config
require('./passportLocalConfig')(passport);

app.use(passport.initialize());
app.use(passport.session());

//Used to parse incoming requests
app.use(express.urlencoded({ extended: true, limit: '50mb', parameterLimit: 15000 }))
app.use(express.json({ limit: '50mb' }))

//Set response headers for CORS
app.use((req, res, next) => {
    res.set({
        'Access-Control-ALlow-Headers': 'true',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS'
    })
    next();
})

//MIDDLEWARES-------------------------------------------------------------------------------------------------------------------

//Routes-----------------------------------------------------------------------------------------------


//---------------GET CHAT ROOMS------------

app.get('/getChatRooms', async (req, res) => {
    if (req.user) {
        const user = await User.findOne({ username: req.user.username }).populate({ path: 'chats', populate: { path: 'users' } })
        return res.send(user.chats)
    }

})




//--------------GET CHAT ROOMS---------------

//For local authentication
app.post('/login',
    passport.authenticate('local', { failureFlash: true, keepSessionInfo: true }),
    function (req, res) {
        res.send(req.user)
    });

//For login through google/facebook
app.post('/login/oauth', async (req, res) => {
    const user = await User.findOne({ uri: req.body.uri })
    req.login(user, (err) => {
        if (err) { return res.send(err) }
        res.json(req.user)
    })
})
//For user registration
app.post('/register', async (req, res) => {
    const userExists = await User.findOne({ username: req.body.username }).count() > 0 ? true : false;
    if (userExists) {
        return res.send("User already exists");
    }
    console.log(req.body)
    const { username, password, name, dob, bio, expLevel, methods, imageData, provider, uri, gyms } = req.body;
    if (provider && uri) {
        const newUser = new User({ username, name, dob, bio, expLevel, methods, provider, uri, distancePref: 10, agePref: { min: -5, max: 5 } });
        imageData.forEach(i => newUser.images.push(i))
        gyms.forEach(g => newUser.gyms.push(g))
        await newUser.save();
        return res.send(newUser)
    } else {
        const newUser = new User({ username, name, dob, bio, expLevel, methods, distancePref: 10, agePref: { min: -5, max: 5 } });
        imageData.forEach(i => newUser.images.push(i))
        gyms.forEach(g => newUser.gyms.push(g))
        const registeredUser = await User.register(newUser, password);
        res.send(registeredUser)
    }
})


app.get('/getUser/:id', async (req, res) => {
    const user = await User.findOne({ _id: req.params.id });
    res.json(user)
})

app.put('/edituser', async (req, res) => {
    console.log(req.body)
    const { bio, expLevel, methods, imageData, id, gyms, distancePref, agePref } = req.body;
    const user = await User.findById(id)
    await user.updateOne(
        { bio: bio, expLevel: expLevel }
    )
    //add new methods to user's methods array
    await user.updateOne({ $addToSet: { methods: methods }, $set: { agePref: agePref } })
    user.distancePref = distancePref
    //add new gyms to user's gyms array
    await user.updateOne({ $addToSet: { gyms: gyms } })
    //deletedMethods is an array with the user's methods that are not found in the inputted methods array
    const deletedMethods = user.methods.filter(el => !methods.includes(el))
    await user.updateOne({ $pull: { methods: { $in: deletedMethods } } })
    //deletedGyms is an array with the user's gyms that are not found in the inputted gyms array
    const deletedGyms = user.gyms.filter(el => !gyms.some(gym => gym._id && gym._id === el._id))
    await user.updateOne({ $pull: { gyms: { $in: deletedGyms } } })
    imageData.forEach(i => user.images.push(i))
    await user.save();
    const updatedUser = await User.findById(id)
    console.log(updatedUser)
    res.json(updatedUser)
})

app.get('/isLoggedIn', (req, res) => {
    if (req.user) {
        res.json(req.user)

    } else {
        res.send("Couldn't get req.user")
    }
})

app.get('/logout', (req, res) => {
    req.logout(err => {
        if (err) { return res.send(err); }
        res.json(req.user)
    })
})

//------------------------------------------------------Match Making-------------------------------------------------------
app.get('/getQueue', async (req, res) => {
    //Search database for users whose gyms are within certain distance of current user and add points for that
    //give more points for users who are extra close
    //add points for shared passions and experience level
    //add users to priority queue with users having the most points getting the most priority
    //***10miles is 0.1429 degrees */
    const currentUserGyms = req.user.gyms;
    const cardStack = new PriorityQueue();
    let userPointsRanking = [];
    let latDiff; let longDiff;
    if (req.user.distancePref) {
        latDiff = req.user.distancePref / 69;
        longDiff = req.user.distancePref / 54.6
    } else {
        latDiff = 0.144928;
        longDiff = 0.18315;
    }
    //Find users who goes to a gym within a 10 mile radius of one of the gyms that the current user goes to 
    for (let gym of currentUserGyms) {
        const results = await User.find({
            gyms: { $elemMatch: { latitude: { $gte: gym.latitude - latDiff, $lte: gym.latitude + latDiff }, longitude: { $gte: gym.longitude - longDiff, $lte: gym.longitude + longDiff } } }
        })
        //all these users initially have 0 points
        results.forEach(res => {
            //user found in search is added to userPointsRanking unless they are already in it, or it is the current user, or the user is in current user's left swipes or right swipes or matches
            if (!userPointsRanking.some(el => el.user._id.equals(res._id)) && !res._id.equals(req.user._id) && !req.user.leftSwipes.includes(res._id) && !req.user.rightSwipes.includes(res._id) &&
                !req.user.matches.includes(res._id)) {
                userPointsRanking.push({ user: res, points: 0 })
            }
        })
    }

    for (let element of userPointsRanking) {
        //if the user has a gym in common with the current user, add 3 points
        if (element.user.gyms.some(el => currentUserGyms.includes(el))) {
            element.points += 6;
        }
        //for each method they have in common, add 1 point
        element.user.methods.forEach(m => {
            if (req.user.methods.includes(m)) { element.points += 1; }
        })
        if (req.user.agePref) {
            const ageDifference = Math.abs(req.user.dob.getFullYear() - element.user.dob.getFullYear());
            const range = req.user.agePref.max - req.user.agePref.min
            if (ageDifference <= Math.abs(req.user.agePref.min) || ageDifference <= req.user.agePref.max) {
                element.points += (-3 / range + 1) * ageDifference + 3;
            }
        } else {
            const ageDifference = Math.abs(req.user.dob.getFullYear() - element.user.dob.getFullYear())
            if (ageDifference <= 5) {
                element.points += -0.5 * ageDifference + 3;
            }
        }
        if (req.user.expLevel === element.user.expLevel) { element.points += 1; }
        cardStack.enqueue(element.user, element.points);
    }
    res.json(cardStack);
})

app.post('/handleSwipe', async (req, res) => {
    const { swipedUser, isRightSwipe } = req.body;
    const currUser = await User.findById(req.user._id)
    const swipedUserDocument = await User.findById(swipedUser._id);
    //If you swipe right on someone who already swiped right on you, it's a match. Add each user to the other's matches array.
    if (isRightSwipe && swipedUserDocument.rightSwipes.includes(req.user._id)) {
        await currUser.updateOne({ $addToSet: { matches: swipedUser._id } })
        await swipedUserDocument.updateOne({ $addToSet: { matches: req.user._id } })
        return res.send({ matched: true })
    }
    //If you swipe right on someone and they haven't swiped right on you, add them to the current user's right swipes array
    else if (isRightSwipe && !swipedUser.rightSwipes.includes(req.user._id)) {
        await currUser.updateOne({ $addToSet: { rightSwipes: swipedUser._id } })
        return res.send(`${swipedUser.name} added to right swipes`)
    }
    //If you swipe left on someone, add them to current user's left swipes array
    else {
        await currUser.updateOne({ $addToSet: { leftSwipes: swipedUser._id } })
        return res.send(`${swipedUser.name} added to left swipes`)
    }
})


app.post('/unmatch', async (req, res) => {
    const { chatRoomId, users } = req.body;
    await Chat.findByIdAndDelete(chatRoomId);
    const currUserId = users.filter(user => user.username === req.user.username)[0]._id;
    const otherUserId = users.filter(user => user.username !== (req.user.username))[0]._id;
    const currUser = await User.findById(currUserId).populate({ path: 'chats', populate: { path: 'users' } });
    //remove other user from current user's matches and add them to the left swipes
    await currUser.updateOne({ $pull: { chats: chatRoomId, matches: otherUserId }, $push: { leftSwipes: otherUserId } })
    // await currUser.updateOne({$pull: {matches: otherUserId}})
    //remove current user from other user's matches
    await User.findByIdAndUpdate(otherUserId, { $pull: { matches: currUserId, chats: chatRoomId } })
    console.log(currUser.chats)
    return res.send(currUser.chats)
})



//------------------------------------------------------Match Making-------------------------------------------------------

//-----------------------------------------------------SCHEDDULING---------------------------------------------------------


app.post('/sendGymRequest', async (req, res) => {
    console.log(req.body)
    const { date, time, recipients, location, description } = req.body;
    const currUser = await User.findById(req.user._id);

    const newDate = new Date(date.substring(0, date.indexOf('T')) + time.substring(time.indexOf('T'), time.length))
    if (recipients.length === 0) {
        const event = {
            location: location,
            date: newDate,
            description: description,
            pending: false
        }
        await currUser.updateOne({ $push: { events: event } })
        return res.send(currUser);
    }
    else {
        recipients.forEach(async (r) => {
            await User.findByIdAndUpdate(r.id, {
                $push: {
                    events: {
                        location: location,
                        date: newDate,
                        description: description,
                        pending: true,
                        sender: req.user._id,
                        recipients: recipients.map(r => r.id),

                    }
                }
            })
        })
        await currUser.updateOne({
            $push: {
                events: {
                    location: location,
                    date: newDate,
                    description: description,
                    pending: true,
                    sender: req.user._id,
                    recipients: recipients.map(r => r.id),

                }
            }
        })
        return res.send(currUser)
    }
})



app.post('/handleRequest', async (req, res) => {
    //console.log(req.body)
    //this eventRequest _id only works for the current user's version of that event
    const { accepted, eventRequest } = req.body;
    const user = await User.findById(req.user._id)
    const sender = await User.findById(eventRequest.sender._id)
    //make event pending = false for current user and sender
    if (accepted) {
        await user.updateOne({ $set: { "events.$[event].pending": false } }, { arrayFilters: [{ "event._id": { $eq: eventRequest._id } }] });
        await sender.updateOne({ $set: { "events.$[event].pending": false } }, { arrayFilters: [{ "event.date": { $eq: eventRequest.date } }] })
    }
    //delete event from current user and sender
    else if (!accepted && eventRequest.recipients.length === 1) {
        await user.updateOne({ $pull: { events: { _id: { $eq: eventRequest._id } } } })
        await sender.updateOne({ $pull: { events: { date: { $eq: eventRequest.date } } } })
    }
    //delete event from current user and remove current user's id from recipients array for sender and other recipients
    else if (!accepted && eventRequest.recipients.length > 1) {
        await user.updateOne({ $pull: { events: { _id: { $eq: eventRequest._id } } } })
    }
}
)


app.get('/getEvents', async (req, res) => {
    const user = await User.findById(req.user._id).populate({ path: 'events', populate: { path: 'sender' } })
    const events = [...user.events];
    let requests = [];
    events.forEach(e => {
        if (e.recipients.includes(user._id) && e.pending) {
            requests.push(e)
        }
    })
    const confirmedEvents = events.filter((e) => !e.pending);
    res.json({ requests: requests, confirmedEvents: confirmedEvents })
})


app.get('/getMatchesData', async (req, res) => {
    const user = await User.findById(req.user._id).populate('matches');
    res.json(user.matches)
})

//-----------------------------------------------------SCHEDDULING---------------------------------------------------------



//------------------------------------------------------IMAGE UPLOAD & DELETE--------------------------------------------------
app.post('/image', async (req, res) => {
    const responses = [];
    const uploadedImages = []
    req.body.images.forEach((img) => {
        const response = cloudinary.uploader.upload(img.uri, {
            folder: "Spot-Me/"
        })
        responses.push(response);
        //response is a promise for the individual API call.
    })
    await Promise.all(responses)
        .then((response) => {
            console.log('all promises resolved')
            response.map((r, i) => uploadedImages.push({ url: r.secure_url, filename: r.public_id.slice(r.public_id.indexOf('/') + 1) + '.' + r.format, position: req.body.images[i].position }))
        })
        .catch((err) => console.log(err))
    //Promise.all turns the array of promises into one promise
    console.log(uploadedImages)
    res.send(uploadedImages)
})

app.put('/image', async (req, res) => {
    const user = await User.findById(req.body.id)
    const newImages = req.body.images.filter(i => i.isNew);
    for (let img of user.images) {
        const inputImg = req.body.images.find(element => element.position === img.position)
        //if user has image with position x, and req.body.images doesn't have img with position x OR 
        //img with position x isNew, then delete that image from cloudinary and database
        if (!inputImg || inputImg.isNew) {
            await cloudinary.uploader.destroy("Spot-Me/" + img.filename.substring(0, img.filename.indexOf('.')));
            await user.updateOne({ $pull: { images: { position: img.position } } });
            await user.save();
        }
    }
    //Upload new images
    const responses = [];
    const uploadedImages = [];
    newImages.forEach((img) => {
        const response = cloudinary.uploader.upload(img.uri, {
            folder: "Spot-Me/"
        })
        responses.push(response);
    })
    await Promise.all(responses)
        .then((response) => {
            console.log('all promises resolved')
            response.map((r, i) => uploadedImages.push({ url: r.secure_url, filename: r.public_id.slice(r.public_id.indexOf('/') + 1) + '.' + r.format, position: newImages[i].position }))
        })
        .catch((err) => console.log(err))
    console.log(uploadedImages)
    res.send(uploadedImages)
})
//------------------------------------------------------IMAGE UPLOAD & DELETE--------------------------------------------------


//Routes---------------------------------------------------------------------------------------------------

app.listen(process.env.PORT, () => {
    console.log(`SERVER LISTENING ON PORT ${process.env.PORT}`);
})
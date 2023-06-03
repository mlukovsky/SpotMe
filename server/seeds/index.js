const mongoose = require('mongoose');
const User = require('../models/user')
const { interests, expLevel, gyms, names } = require('./seedHelpers')

//Database Connection-------------------------------------------------------------------------------
mongoose.connect('mongodb+srv://mitchell:mitch123@cluster0.aog1wen.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
const db = mongoose.connection;
db.on('error', console.error.bind(console, "Connection error:"));
db.once('open', () => {
    console.log("Database connected");
});
//Database Connection---------------------------------------------------------------------------------


const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDb = async () => {
    for (let i = 0; i < 70; i++) {
        const randomYear = Math.floor(Math.random() * (2006 - 1992 + 1) + 1992);
        const randomDay = Math.floor(Math.random() * 30 + 1);
        const randomMonth = Math.floor(Math.random() * 12);
        const randomNumMethods = Math.floor(Math.random() * 10 + 1);
        const randomMethods = [];
        while (randomMethods.length < randomNumMethods) {
            const method = sample(interests);
            if (!randomMethods.includes(method)) {
                randomMethods.push(method)
            } else { continue; }
        }
        const user = new User({
            username: `user${i}`,
            name: sample(names),
            dob: new Date(randomYear, randomMonth, randomDay),
            bio: "I'm a fake user!",
            expLevel: sample(expLevel),
            methods: randomMethods,
        })
        user.images.push({
            url: "https://res.cloudinary.com/dcmbmqlad/image/upload/v1669349974/Spot-Me/default-profile_v1zxe3.jpg",
            filename: "default-profile_v1zxe3.jpg",
            position: 0
        })
        user.gyms.push(sample(gyms))
        await User.register(user, "fake")
    }
}

seedDb().then(() => mongoose.connection.close())
const mongoose = require('mongoose');
const campground = require('../models/campground');
const cities = require("./cities");
const { descriptors, places } = require('./seedHelpers');

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geoCoder = mbxGeocoding({accessToken: "pk.eyJ1IjoiZ21jaGUxOSIsImEiOiJjbG9yamY3Z3owczVzMnFzOHhkeGl1MzJvIn0.z3Oaf3VSN7-Jc-i0P9dQMQ"});


mongoose.connect('mongodb://127.0.0.1:27017/expressApp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, "connection error: "));
db.once('open', () => {
    console.log("database conncected succesfully")
})

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const url = "https://res.cloudinary.com/donyy9ezp/image/upload/v1699308400/YelpCamp/azscmqks1h8jysbbfbem.jpg"
const url1 = "https://res.cloudinary.com/donyy9ezp/image/upload/v1698392368/YelpCamp/pstu3tgbrywaiv1bnowj.jpg"
const url2 = "https://res.cloudinary.com/donyy9ezp/image/upload/v1698091010/YelpCamp/jn2udxykexnnirpvtq8s.webp"
const url3 = "https://res.cloudinary.com/donyy9ezp/image/upload/v1698313552/YelpCamp/xd3spdbcqjtydoj72a7v.jpg"
const url4 = "https://res.cloudinary.com/donyy9ezp/image/upload/v1698392368/YelpCamp/pstu3tgbrywaiv1bnowj.jpg"
const arr_images = [url, url, url2, url3, url4]

const filename = "YelpCamp/fq0ns04pl3rwa0ytz1uo";
const sendDb = async () => {
    try {
        await campground.deleteMany({});
        for (let i = 0; i < 100; i++) {

            const rand = Math.floor(Math.random() * cities.length); // Use cities.length to avoid out-of-bounds errors
            const title = `${sample(descriptors)} ${sample(places)}`;
            const curLocation = `${cities[rand].city} ${cities[rand].state}`;
            const curGeometry = await findGeometry(curLocation);
            new_url = arr_images[i & arr_images.length];

            const camp = new campground({
                title: title,
                images: [{url:new_url, filename}],
                location: curLocation,
                price: rand,
                description: `${title}, nestled between rolling hills and crystal lakes, offers vibrant markets, historic landmarks, serene parks, and a 
                rich tapestry of cultures.`,
                author: "652edb34876c4b541ee377cf",
                // seeds new feature
                geometry: curGeometry
            });
            await camp.save();
            console.log(`saved ${i} th element`, camp);
        }
        console.log('everything saved successfully');
        db.close();
    } catch (error) {
        console.error("Error occurred:", error);
    }
}

async function findGeometry(title) {
    const data = await geoCoder.forwardGeocode({
        query: title,
        limit: 1
    }).send()
    return data.body.features[0].geometry;
}


sendDb();
const printRes = async function () {
    const res = await campground.find({});
    console.log(res);
}
printRes();


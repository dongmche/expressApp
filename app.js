// if (process.env.NODE_ENV !== 'production') {
//     require('dotenv').config();
// }
require('dotenv').config();




const Campground = require('./models/campground')
const express = require('express');
const ejsMate = require('ejs-mate');
const { default: mongoose } = require('mongoose');
const asyncCatch = require('./utils/asyncCatch');
const ExpressError = require('./utils/ExpressError');
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const Review = require('./models/review');
const Helmet = require('helmet');


const path = require('path');
const campground = require('./models/campground');

// const { DB_URL } = require("./statics.js");


const dbUrl = process.env.DB_URL;
// const dbUrl = 'mongodb://127.0.0.1:27017/expressApp';
// const dbUrl = DB_URL;
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});




const db = mongoose.connection;

db.on('error', console.error.bind(console, "connection error: "));
db.once('open', () => {
    console.log("database conncected succesfully")
})

const app = express();
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));

// express session, flash 
const session = require('express-session');
const MongoStore = require('connect-mongo');

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'thisshouldbeabettersecret!'
    }
});


store.on('error', function (e) {
    console.log('session store error', e);
})

const sessionConfig = {
    store,
    name: 'session',
    secret: 'passwordSecretDoesnotMatter',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};
app.use(session(sessionConfig));

const flash = require('connect-flash');
app.use(flash());





//  helmet
app.use(Helmet({
    contentSecurityPolicy: false,
})
);



// express passport
const User = require('./models/users');
const passport = require('passport');
const localStrategy = require('passport-local');
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(flash());

// app.get('/fakeUser', async (req, res) => {
//     const user = new User({email:'gio@gmail.com', username: 'gio'});
//     const newUser = await User.register(user, 'password');
//     res.send(newUser);
// })


//mongo sanitization
const mongoSanitize = require('express-mongo-sanitize');
app.use(
    mongoSanitize({
        replaceWith: '_',
    }),
);

app.use((req, res, next) => {
    console.log(req.query);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})






// static public directoris
app.use(express.static(path.join(__dirname, 'public')));


// routes
const campgroundRoute = require('./routes/campgrounds');
const reviewsRoute = require('./routes/reviews');
const usersRoute = require('./routes/users');
app.use('/campgrounds', campgroundRoute);
app.use('/campgrounds/:id/reviews', reviewsRoute);
app.use('/', usersRoute);



//test
app.get('/test', (req, res) => {
    res.render('test')
})

app.get('/', (req, res) => {
    res.render('home')
})




app.all('*', (req, res, next) => {
    console.log(req.query);
    res.render('home');
    // console.log('inside all* route');
    // next(new ExpressError('from all route', 404));
})

app.use((err, req, res, next) => {
    console.log('error were cought', err.message);
    console.log('printing error in a next line');
    console.log(err);
    const { statusCode = 404 } = err;
    if (!err.message) err.message = 'page not found';
    res.status(statusCode).render('error', { err });
});


app.listen('8089', () => {
    console.log('app started succesfully on port 8089');
})
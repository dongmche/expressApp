const express = require('express');
const asyncCatch = require('../utils/asyncCatch');
const Campground = require('../models/campground');
const Review = require('../models/review');
const ExpressError = require('../utils/ExpressError');
const {campgroundSchema, reviewSchema} = require('../schemas.js');
const Joi = require('joi');
const {isLoggedIn, isAuthor} = require('../middleware');


//mult
const multer = require('multer');
const {storage} = require('../cloudinary/index'); 
const upload = multer({storage});

const validateCampground = (req, res, next) => {
    console.log('validating started');
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const message = error.details.map(el => el.message).join('.');
        next(new ExpressError(message, 404));
    }else{
        next();
    }   
}




// routes
const router = express.Router();
const campgroundsCon = require('../controller/campgroundsCon');


// campgorunnds show and add
router.get('/', campgroundsCon.allCampgroundsShow);

router.post('/', isLoggedIn, upload.array('image'), validateCampground, asyncCatch(campgroundsCon.campgroundAdd));
// router.post('/', upload.array('image'), (req, res) => {
//     console.log(req.files);
//     return res.send(`it worked?}`);
// });

router.post('/delete/:id', isAuthor, asyncCatch(campgroundsCon.campgroundDelete));
router.get('/new', isLoggedIn, campgroundsCon.renderNewForm);

// edit
router.get('/edit/:id', isLoggedIn, isAuthor, asyncCatch(campgroundsCon.renderEditForm));
router.post('/edit/:id', isLoggedIn, upload.array('image'), validateCampground, isAuthor, campgroundsCon.campgroundEdit);

// router.post('/edit/:id', isLoggedIn, upload.array('image'), validateCampground, isAuthor, (req, res) => {
//     console.log(req.files);
//     res.send('it worked?');
// })



router.get('/:id', asyncCatch(campgroundsCon.campgroundShow));



module.exports = router;
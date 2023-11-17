const express = require('express');
const asyncCatch = require('../utils/asyncCatch');
const Review = require('../models/review');
const Campground = require('../models/campground');
const {reviewSchema} = require('../schemas.js');
const ExpressError = require('../utils/ExpressError');
const {isLoggedIn, isReviewAuthor} = require('../middleware');



const validateReview = (req, res, next) => {
    console.log('validate review started');
    const {error} = reviewSchema.validate(req.body);
    console.log('finished validation');
    if(error){
        const message = error.details.map(el => el.message).join('.');
        console.log('review error were thrown');
        console.log(message);
        next(new ExpressError(message, 404));
    }else{
        next();
    }   
}




// routes
const router = express.Router({mergeParams: true});

router.post("/:review_id/delete", isLoggedIn, isReviewAuthor, asyncCatch(async(req, res) => {
    console.log('inside reviews delete');
    const{id, review_id} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull : {reviews: review_id}});
    await Review.findByIdAndDelete(review_id);
    req.flash('success', 'succesfully deleted a review');
    res.redirect(`/campgrounds/${id}`);
}))


router.post('/', isLoggedIn, async(req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'succesfully added a review');
    res.redirect(`/campgrounds/${campground._id}`)
})


// router.post('/:id/reviews', validateReview, asyncCatch(async (req, res) => {
//     res.send('testing');
//     console.log('in a route campgrounds/:id/reviews')
//     const curCampground = await Campground.findById(req.params.id);
//     const review = new Review(req.body.review);
//     const{id} = req.params;
//     console.log(req.params);
//     console.log('cur id is a', id);
//     console.log(curCampground);

//     curCampground.reviews.push(review);
//     await review.save();
//     await curCampground.save();
//     res.redirect(`/campgrounds/${campground._id}`)
// }))

module.exports = router;
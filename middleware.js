const Review = require("./models/review");
const Campground = require("./models/campground");

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'authenticate first');  
        return res.redirect('/login');
    }
    next();
}

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

module.exports.isAuthor = async (req, res, next) => {
    const{id} = req.params;
    const campground = await Campground.findById(id);
    if(campground && !campground.author.equals(req.user._id)){
        req.flash('error', 'you have no permission to do this');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}
module.exports.isReviewAuthor = async (req, res, next) => {
    const{id, review_id} = req.params;
    console.log(`id is an ${id}`);
    console.log(`reviewId is an ${review_id}`);
    const review = await Review.findById(review_id);
    if(review && !review.author.equals(req.user._id)){
        req.flash('error', 'you have no permission to do this');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}
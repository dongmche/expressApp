const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mabBoxToken = process.env.MAPBOX_TOKEN;
const geoCoder = mbxGeocoding({ accessToken: mabBoxToken });

const printUsedMemory = function () {
    const used = process.memoryUsage();
    console.log(`Memory usage: ${JSON.stringify({
        rss: `${(used.rss / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(used.heapTotal / 1024 / 1024).toFixed(2)} MB`,
        heapUsed: `${(used.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        external: `${(used.external / 1024 / 1024).toFixed(2)} MB`,
    })}`);
}

module.exports.campgroundAdd = async (req, res, next) => {
    const data = await geoCoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()


    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    campground.images = req.files.map(e => ({ url: e.path, filename: e.filename, }));
    campground.geometry = data.body.features[0].geometry;
    await campground.save();
    req.flash('success', 'succesfully created a new campground');
    printUsedMemory();
    res.redirect(`/campgrounds/${campground._id}`);
}



module.exports.campgroundDelete = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'succesfully deleted a campground');
    res.redirect(`/campgrounds`);
};

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
};
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/edit', { campground });
}

module.exports.campgroundEdit = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { new: true });
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
        console.log(campground);
    }

    const images = req.files.map(e => ({ url: e.path, filename: e.filename }));
    campground.images.push(...images);
    await campground.save();
    req.flash('success', 'succesfully updated a campground');
    res.redirect(`/campgrounds/${id}`);
}

module.exports.campgroundShow = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({ path: 'reviews', populate: { path: 'author' } }).populate('author');

    if (!campground) {
        req.flash('error', 'campground does not exists');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground })
}

module.exports.allCampgroundsShow = async (req, res) => {
    console.log('campgrounds show route');
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}

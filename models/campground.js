const mongoose = require('mongoose');
const Review = require('./review');
const User = require('./users');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload', '/upload/w_200');
});


const options = {toJSON : {virtuals : true}}
const campgroundSchema = new Schema(
    {
        title: String,
        // image: String,
        images: [ImageSchema],
        price: Number,
        description: String,
        location: String,
        geometry:{
            type:{
                type:String,
                enum:['Point'],
                require: true
            },
            coordinates:{
                type:[Number],
                required: true
            }
        },

        author: {
            type: Schema.Types.ObjectId,
            ref:'User'
        },
        reviews: [
            {type: Schema.Types.ObjectId,
            ref: 'Review'
            }
        ]
    }, options)

campgroundSchema.virtual('properties.popUpMarkup').get(function(){
    return  `<a href="/campgrounds/${this._id}">${this.title}</a>`
})

campgroundSchema.post('findOneAndDelete', async function(data) {
    if(data){
        try {
            await Review.deleteMany({ _id: { $in: data.reviews } });
            console.log('Associated reviews deleted.');
        } catch (error) {
            console.error('Error deleting associated reviews:', error);
        }
    }
    console.log('Campground deleted.');
});

module.exports=  mongoose.model('Campground', campgroundSchema);
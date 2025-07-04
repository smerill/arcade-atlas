const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;
const { cloudinary } = require('../cloudinary');

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});


const opts = { toJSON: { virtuals: true } }

const CheckpointSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

CheckpointSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/checkpoints/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`
});

CheckpointSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        if (doc.reviews && doc.reviews.length) {
            await Review.deleteMany({
                _id: {
                    $in: doc.reviews
                }
            });
        }
        if (doc.images && doc.images.length) {
            for (let img of doc.images) {
                await cloudinary.uploader.destroy(img.filename);
            }
        }
    }
});

module.exports = mongoose.model('Checkpoint', CheckpointSchema);
const express = require('express');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { reviewSchema } = require('../schemas');
const Checkpoint = require('../models/checkpoint');
const Review = require('../models/review');

const router = express.Router({ mergeParams: true });

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

router.post('/', validateReview, catchAsync(async (req, res) => {
    const checkpoint = await Checkpoint.findById(req.params.id);
    const review = new Review(req.body.review);
    checkpoint.reviews.push(review);
    await review.save();
    await checkpoint.save();
    req.flash('success', 'Created new review');
    res.redirect(`/checkpoints/${checkpoint._id}`);
}));

router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Checkpoint.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review');
    res.redirect(`/checkpoints/${id}`);
}));

module.exports = router;
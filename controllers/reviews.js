const Checkpoint = require('../models/checkpoint');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const checkpoint = await Checkpoint.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    checkpoint.reviews.push(review);
    await review.save();
    await checkpoint.save();
    req.flash('success', 'Created new review');
    res.redirect(`/checkpoints/${checkpoint._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Checkpoint.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review');
    res.redirect(`/checkpoints/${id}`);
}
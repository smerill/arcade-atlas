const Checkpoint = require('./models/checkpoint');
const Review = require('./models/review');
const ExpressError = require('./utils/ExpressError');
const { checkpointSchema, reviewSchema } = require('./schemas');

module.exports.validateCheckpoint = (req, res, next) => {
    const { error } = checkpointSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const checkpoint = await Checkpoint.findById(id);
    if (!checkpoint.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/checkpoints/${id}`);
    }
    next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const review = await Review.findById(req.params.reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/checkpoints/${req.params.id}`);
    }
    next();
}
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const { checkpointSchema, reviewSchema } = require('./schemas');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const Checkpoint = require('./models/checkpoint');
const Review = require('./models/review');

// db will be created if it doesnt exist
mongoose.connect('mongodb://127.0.0.1:27017/arcade-atlas');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const validateCheckpoint = (req, res, next) => {
    const { error } = checkpointSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// run 'node seeds/index.js' BEFORE acessing these paths to populated the db
// this ensures you have data to test CRUD op

app.get('/checkpoints', catchAsync(async (req, res) => {
    const checkpoints = await Checkpoint.find({});
    res.render('checkpoints/index.ejs', { checkpoints });
}));

app.get('/checkpoints/new', (req, res) => {
    res.render('checkpoints/new.ejs');
});

app.get('/checkpoints/:id', catchAsync(async (req, res) => {
    const checkpoint = await Checkpoint.findById(req.params.id).populate('reviews');
    res.render('checkpoints/show.ejs', { checkpoint });
}));

app.get('/checkpoints/:id/edit', catchAsync(async (req, res) => {
    const checkpoint = await Checkpoint.findById(req.params.id);
    res.render('checkpoints/edit.ejs', { checkpoint });
}));

app.post('/checkpoints', validateCheckpoint, catchAsync(async (req, res, next) => {
    // if (!req.body.checkpoint) throw new ExpressError('Invalid Checkpoint Data', 400);
    const checkpoint = new Checkpoint(req.body.checkpoint);
    await checkpoint.save();
    res.redirect(`/checkpoints/${checkpoint._id}`);
}));

app.post('/checkpoints/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const checkpoint = await Checkpoint.findById(req.params.id);
    const review = new Review(req.body.review);
    checkpoint.reviews.push(review);
    await review.save();
    await checkpoint.save();
    res.redirect(`/checkpoints/${checkpoint._id}`);
}));

app.patch('/checkpoints/:id', validateCheckpoint, catchAsync(async (req, res) => {
    const checkpoint = await Checkpoint.findByIdAndUpdate(req.params.id, { ...req.body.checkpoint });
    res.redirect(`/checkpoints/${checkpoint._id}`);
}));

app.delete('/checkpoints/:id', catchAsync(async (req, res) => {
    await Checkpoint.findByIdAndDelete(req.params.id);
    res.redirect('/checkpoints');
}));

app.delete('/checkpoints/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Checkpoint.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/checkpoints/${id}`);
}));

app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError('PAGE NOT FOUND', 404));
});

app.use((err, req, res, next) => {
    const { status = 500 } = err;
    if (!err.message) err.message = 'Something Went Wrong!';
    res.status(status).render('error.ejs', { err });
});

app.listen(3000, () => {
    console.log("PORT 3000");
});
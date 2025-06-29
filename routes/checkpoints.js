const express = require('express');
const catchAsync = require('../utils/catchAsync');
const Checkpoint = require('../models/checkpoint');
const { isLoggedIn, validateCheckpoint, isAuthor } = require('../middleware');

const router = express.Router();

router.get('/', catchAsync(async (req, res) => {
    const checkpoints = await Checkpoint.find({});
    res.render('checkpoints/index.ejs', { checkpoints });
}));

router.get('/new', isLoggedIn, (req, res) => {
    res.render('checkpoints/new.ejs');
});

router.get('/:id', catchAsync(async (req, res) => {
    const checkpoint = await Checkpoint.findById(req.params.id).populate({ path: 'reviews', populate: { path: 'author' } }).populate('author');
    console.log(checkpoint);
    if (!checkpoint) {
        req.flash('error', 'Cannot find that checkpoint');
        return res.redirect('/checkpoints');
    }
    res.render('checkpoints/show.ejs', { checkpoint });
}));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const checkpoint = await Checkpoint.findById(req.params.id);
    if (!checkpoint) {
        req.flash('error', 'Cannot find that checkpoint');
        return res.redirect('/checkpoints');
    }
    res.render('checkpoints/edit.ejs', { checkpoint });
}));

router.post('/', isLoggedIn, validateCheckpoint, catchAsync(async (req, res, next) => {
    // if (!req.body.checkpoint) throw new ExpressError('Invalid Checkpoint Data', 400);
    const checkpoint = new Checkpoint(req.body.checkpoint);
    checkpoint.author = req.user._id;
    await checkpoint.save();
    req.flash('success', 'Successfully made a new checkpoint');
    res.redirect(`/checkpoints/${checkpoint._id}`);
}));

router.patch('/:id', isLoggedIn, isAuthor, validateCheckpoint, catchAsync(async (req, res) => {
    const checkpoint = await Checkpoint.findByIdAndUpdate(req.params.id, { ...req.body.checkpoint });
    req.flash('success', 'Successfully updated checkpoint');
    res.redirect(`/checkpoints/${checkpoint._id}`);
}));

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    await Checkpoint.findByIdAndDelete(req.params.id);
    req.flash('success', 'Successfully deleted checkpoint');
    res.redirect('/checkpoints');
}));

module.exports = router;
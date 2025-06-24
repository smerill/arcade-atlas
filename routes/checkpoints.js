const express = require('express');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { checkpointSchema } = require('../schemas');
const Checkpoint = require('../models/checkpoint');

const router = express.Router();

const validateCheckpoint = (req, res, next) => {
    const { error } = checkpointSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

router.get('/', catchAsync(async (req, res) => {
    const checkpoints = await Checkpoint.find({});
    res.render('checkpoints/index.ejs', { checkpoints });
}));

router.get('/new', (req, res) => {
    res.render('checkpoints/new.ejs');
});

router.get('/:id', catchAsync(async (req, res) => {
    const checkpoint = await Checkpoint.findById(req.params.id).populate('reviews');
    if (!checkpoint) {
        req.flash('error', 'Cannot find that checkpoint');
        return res.redirect('/checkpoints');
    }
    res.render('checkpoints/show.ejs', { checkpoint });
}));

router.get('/:id/edit', catchAsync(async (req, res) => {
    const checkpoint = await Checkpoint.findById(req.params.id);
    if (!checkpoint) {
        req.flash('error', 'Cannot find that checkpoint');
        return res.redirect('/checkpoints');
    }
    res.render('checkpoints/edit.ejs', { checkpoint });
}));

router.post('/', validateCheckpoint, catchAsync(async (req, res, next) => {
    // if (!req.body.checkpoint) throw new ExpressError('Invalid Checkpoint Data', 400);
    const checkpoint = new Checkpoint(req.body.checkpoint);
    await checkpoint.save();
    req.flash('success', 'Successfully made a new checkpoint');
    res.redirect(`/checkpoints/${checkpoint._id}`);
}));

router.patch('/:id', validateCheckpoint, catchAsync(async (req, res) => {
    const checkpoint = await Checkpoint.findByIdAndUpdate(req.params.id, { ...req.body.checkpoint });
    req.flash('success', 'Successfully updated checkpoint');
    res.redirect(`/checkpoints/${checkpoint._id}`);
}));

router.delete('/:id', catchAsync(async (req, res) => {
    await Checkpoint.findByIdAndDelete(req.params.id);
    req.flash('success', 'Successfully deleted checkpoint');
    res.redirect('/checkpoints');
}));

module.exports = router;
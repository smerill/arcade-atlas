const Checkpoint = require('../models/checkpoint');

module.exports.index = async (req, res) => {
    const checkpoints = await Checkpoint.find({});
    res.render('checkpoints/index.ejs', { checkpoints });
}

module.exports.renderNewForm = (req, res) => {
    res.render('checkpoints/new.ejs');
}

module.exports.showCheckpoint = async (req, res) => {
    const checkpoint = await Checkpoint.findById(req.params.id).populate({ path: 'reviews', populate: { path: 'author' } }).populate('author');
    if (!checkpoint) {
        req.flash('error', 'Cannot find that checkpoint');
        return res.redirect('/checkpoints');
    }
    res.render('checkpoints/show.ejs', { checkpoint });
}

module.exports.renderEditForm = async (req, res) => {
    const checkpoint = await Checkpoint.findById(req.params.id);
    if (!checkpoint) {
        req.flash('error', 'Cannot find that checkpoint');
        return res.redirect('/checkpoints');
    }
    res.render('checkpoints/edit.ejs', { checkpoint });
}

module.exports.createCheckpoint = async (req, res, next) => {
    // if (!req.body.checkpoint) throw new ExpressError('Invalid Checkpoint Data', 400);
    const checkpoint = new Checkpoint(req.body.checkpoint);
    checkpoint.author = req.user._id;
    await checkpoint.save();
    req.flash('success', 'Successfully made a new checkpoint');
    res.redirect(`/checkpoints/${checkpoint._id}`);
}

module.exports.updateCheckpoint = async (req, res) => {
    const checkpoint = await Checkpoint.findByIdAndUpdate(req.params.id, { ...req.body.checkpoint });
    req.flash('success', 'Successfully updated checkpoint');
    res.redirect(`/checkpoints/${checkpoint._id}`);
}

module.exports.deleteCheckpoint = async (req, res) => {
    await Checkpoint.findByIdAndDelete(req.params.id);
    req.flash('success', 'Successfully deleted checkpoint');
    res.redirect('/checkpoints');
}
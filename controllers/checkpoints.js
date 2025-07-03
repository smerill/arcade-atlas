const Checkpoint = require('../models/checkpoint');
const { cloudinary } = require('../cloudinary');
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;


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
    const geoData = await maptilerClient.geocoding.forward(req.body.checkpoint.location, { limit: 1 });
    const checkpoint = new Checkpoint(req.body.checkpoint);
    checkpoint.geometry = geoData.features[0].geometry;
    checkpoint.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    checkpoint.author = req.user._id;
    await checkpoint.save();
    console.log(checkpoint);
    req.flash('success', 'Successfully made a new checkpoint');
    res.redirect(`/checkpoints/${checkpoint._id}`);
}

module.exports.updateCheckpoint = async (req, res) => {
    const checkpoint = await Checkpoint.findByIdAndUpdate(req.params.id, { ...req.body.checkpoint });
    const geoData = await maptilerClient.geocoding.forward(req.body.checkpoint.location, { limit: 1 });
    checkpoint.geometry = geoData.features[0].geometry;
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    checkpoint.images.push(...imgs);
    await checkpoint.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await checkpoint.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    req.flash('success', 'Successfully updated checkpoint');
    res.redirect(`/checkpoints/${checkpoint._id}`);
}

module.exports.deleteCheckpoint = async (req, res) => {
    await Checkpoint.findByIdAndDelete(req.params.id);
    req.flash('success', 'Successfully deleted checkpoint');
    res.redirect('/checkpoints');
}
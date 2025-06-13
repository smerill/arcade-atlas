const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const Checkpoint = require('./models/checkpoint');

// db will be created if it doesnt exist
mongoose.connect('mongodb://127.0.0.1:27017/arcade-atlas');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// run 'node seeds/index.js' BEFORE acessing these paths to populated the db
// this ensures you have data to test CRUD op

app.get('/checkpoints', async (req, res) => {
    const checkpoints = await Checkpoint.find({});
    res.render('checkpoints/index.ejs', { checkpoints });
});

app.get('/checkpoints/new', (req, res) => {
    res.render('checkpoints/new.ejs');
});

app.get('/checkpoints/:id', async (req, res) => {
    const checkpoint = await Checkpoint.findById(req.params.id);
    res.render('checkpoints/show.ejs', { checkpoint });
});

app.get('/checkpoints/:id/edit', async (req, res) => {
    const checkpoint = await Checkpoint.findById(req.params.id);
    res.render('checkpoints/edit.ejs', { checkpoint });
});

app.post('/checkpoints', async (req, res) => {
    const checkpoint = new Checkpoint(req.body.checkpoint);
    await checkpoint.save();
    res.redirect(`/checkpoints/${checkpoint._id}`);
});

app.patch('/checkpoints/:id', async (req, res) => {
    const checkpoint = await Checkpoint.findByIdAndUpdate(req.params.id, { ...req.body.checkpoint });
    res.redirect(`/checkpoints/${checkpoint._id}`);
});

app.delete('/checkpoints/:id', async (req, res) => {
    await Checkpoint.findByIdAndDelete(req.params.id);
    res.redirect('/checkpoints');
});

app.listen(3000, () => {
    console.log("PORT 3000");
});
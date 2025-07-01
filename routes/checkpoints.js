const express = require('express');
const multer = require('multer');
const { storage } = require('../cloudinary');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, validateCheckpoint, isAuthor } = require('../middleware');
const checkpoints = require('../controllers/checkpoints');

const router = express.Router();
const upload = multer({ storage });

router.route('/')
    .get(catchAsync(checkpoints.index))
    .post(isLoggedIn, validateCheckpoint, upload.array('image'), catchAsync(checkpoints.createCheckpoint));

router.get('/new', isLoggedIn, checkpoints.renderNewForm);

router.route('/:id')
    .get(catchAsync(checkpoints.showCheckpoint))
    .patch(isLoggedIn, isAuthor, validateCheckpoint, upload.array('image'), catchAsync(checkpoints.updateCheckpoint))
    .delete(isLoggedIn, isAuthor, catchAsync(checkpoints.deleteCheckpoint));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(checkpoints.renderEditForm));

module.exports = router;
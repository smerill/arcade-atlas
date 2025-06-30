const express = require('express');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, validateCheckpoint, isAuthor } = require('../middleware');
const checkpoints = require('../controllers/checkpoints');

const router = express.Router();

router.route('/')
    .get(catchAsync(checkpoints.index))
    .post(isLoggedIn, validateCheckpoint, catchAsync(checkpoints.createCheckpoint));

router.get('/new', isLoggedIn, checkpoints.renderNewForm);

router.route('/:id')
    .get(catchAsync(checkpoints.showCheckpoint))
    .patch(isLoggedIn, isAuthor, validateCheckpoint, catchAsync(checkpoints.updateCheckpoint))
    .delete(isLoggedIn, isAuthor, catchAsync(checkpoints.deleteCheckpoint));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(checkpoints.renderEditForm));

module.exports = router;
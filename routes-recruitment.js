const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Route for rendering the home page
router.get('/recruitment', (req, res) => {
    const user = req.session.user; // Fetch the user directly from the session
    res.locals.user = user; // Assign the user to res.locals
    res.render('recruitment', { user: req.session.user });
});

module.exports = router;

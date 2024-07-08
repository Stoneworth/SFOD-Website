// routes-index.js
const express = require('express');
const router = express.Router();

// Route for rendering the home page
router.get('/', (req, res) => {
    const loggedInUsername = req.session.loggedinUsername;
    const loggedinsaltProfile = req.session.loggedinsaltProfile;
    const isAdmin = req.session.isAdmin;
    const user = req.session.user;

    // Check if user session exists (for logged-in check)
    if (user) {
        // User is logged in, render the index page with user data
        res.render('index', {
            loggedinUsername: loggedInUsername,
            loggedinsaltProfile: loggedinsaltProfile,
            isAdmin: isAdmin,
            user: user || null
        });
    } else {
        // User is not logged in, render the index page without user data
        res.render('index', {
            loggedinUsername: loggedInUsername,
            loggedinsaltProfile: loggedinsaltProfile,
            isAdmin: isAdmin,
            user: null // or any default value you prefer
        });
    }
});

module.exports = router;

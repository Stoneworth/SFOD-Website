const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { User, LogRewards, Rewards, Log } = require('./database');

// Middleware to check if the user is authenticated and verified
async function isAuthenticated(req, res, next) {

    if (req.session && req.session.user && req.session.user._id) {
        try {
            const user = await User.findById(req.session.user._id); // Use findById for Mongoose
            if (user) {
                if (user.isVerified) {
                    req.user = user; // Attach user object to req.user
                    return next();
                } else {
                    req.session.alert = "You need to verify your email.";
                    return res.redirect('/email-verification');
                }
            } else {
                req.session.alert = "User not found.";
                return res.redirect('/login');
            }
        } catch (error) {
            console.error('Database error:', error);
            req.session.alert = "An error occurred.";
            return res.redirect('/login');
        }
    } else {
        req.session.alert = "You must log in to see that page.";
        return res.redirect('/login');
    }
}

// Route to render profile based on saltProfile and create an HTML file
router.get('/profile-:saltProfile.html', isAuthenticated, async (req, res) => {
    const saltProfile = req.params.saltProfile;
    const dressImagePath = path.join(__dirname, 'public/img/profile-dress', `dress-${saltProfile}.png`);
    const dressImageExists = fs.existsSync(dressImagePath);
    const activeTab = req.query.tab || 'overview';  // Default to 'overview' tab

    const loggedinUsername = req.session.loggedinUsername; // Fetch logged-in username directly from the session
    const loggedinsaltProfile = req.session.loggedinsaltProfile; // Fetch logged-in saltProfile directly from the session
    const isAdmin = req.session.isAdmin; // Fetch isAdmin directly from the session

    try {
        const user = await User.findOne({ saltProfile }).populate('logs');
        if (!user) {
            console.error(`User with saltProfile ${saltProfile} not found.`);
            return res.status(404).send('Profile not found');
        }

        const logs = user.logs || []; // Ensure logs is an array

        const logRewards = await LogRewards.find({ userId: user._id });

        // Define pagination parameters for the logs
        const currentPage = parseInt(req.query.page) || 1;
        const logsPerPage = 7; // Set the number of logs per page
        const totalLogs = logs.length;
        const totalPages = Math.ceil(totalLogs / logsPerPage);

        const currentPageRewards = parseInt(req.query.page) || 1;
        const logsPerPageRewards = 7; // Set the number of logs per page
        const totalLogsRewards = logRewards.length;
        const totalPagesRewards = Math.ceil(totalLogsRewards / logsPerPageRewards);

        // Sort logs by date from newest to oldest
        logs.sort((a, b) => new Date(b.changeDate) - new Date(a.changeDate));
        logRewards.sort((a, b) => new Date(b.changeDate) - new Date(a.changeDate));

        const paginatedLogs = logs.slice((currentPage - 1) * logsPerPage, currentPage * logsPerPage);
        const paginatedLogsRewards = logRewards.slice((currentPageRewards - 1) * logsPerPageRewards, currentPageRewards * logsPerPageRewards);

        res.render('profile-template', {
            user: user,
            loggedinUsername: loggedinUsername,
            loggedinsaltProfile: loggedinsaltProfile,
            isAdmin: isAdmin,
            username: user.username,
            email: user.email,
            country: user.country,
            rank: user.rank,
            team: user.team,
            steam64id: user.steam64id,
            role: user.role,
            mos: user.mos,
            callsign: user.callsign,
            active: user.active,
            createdAt: user.createdAt,
            rankAssignedDate: user.rankAssignedDate,
            saltProfile: user.saltProfile,
            dressImageExists: dressImageExists,
            logs: paginatedLogs,
            logRewards: paginatedLogsRewards,
            currentPage: currentPage,
            totalPages: totalPages,
            currentPageRewards: currentPageRewards,
            totalPagesRewards: totalPagesRewards,
            userId: user._id,
            activeTab: activeTab // Pass activeTab to the template
        }, (err, html) => {
            if (err) {
                console.error('Error rendering profile template:', err);
                return res.status(500).send('Internal server error');
            }

            const filePath = path.join(__dirname, 'public', 'profiles', `profile-${saltProfile}.html`);
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
            fs.writeFile(filePath, html, (err) => {
                if (err) {
                    console.error('Error writing HTML file:', err);
                    return res.status(500).send('Internal server error');
                }
                res.send(html);
            });
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).send('Internal server error');
    }
});

// Example Node.js/Express function to format log messages

function formatLogMessage(logRewards, username) {
    const { newValue, changeDate } = log;
    const date = new Date(changeDate);
    const formattedDate = date.toLocaleString('en-US', { month: 'long', day: 'numeric' });

    switch (changeType) {
        case 'rank':
            return `${username} has been awarded the ${newValue} ${formattedDate}.`;
        default:
            return null; // Ignore unknown change types
    }
}

async function logChanges(userId, newData) {
    try {
        const user = await User.findById(userId);
        if (!user) {
            console.error(`User with ID ${userId} not found.`);
            return;
        }

        const changes = [];
        const fieldsToTrack = ['rank', 'role', 'team']; // Fields you want to track

        fieldsToTrack.forEach(field => {
            if (user[field] !== newData[field]) {
                changes.push({
                    changeDate: new Date(),
                    changeType: field,
                    oldValue: user[field],
                    newValue: newData[field]
                });
            }
        });

        if (changes.length > 0) {
            user.logs.push(...changes);
            fieldsToTrack.forEach(field => {
                if (newData[field] !== undefined) {
                    user[field] = newData[field]; // Update only tracked fields
                }
            });
            await user.save();
        } else {
        }
    } catch (error) {
        console.error(`Error logging changes for user with ID ${userId}:`, error);
    }
}


module.exports = { formatLogMessage };
module.exports = router;
module.exports.isAuthenticated = isAuthenticated; // Ensure the middleware is exported

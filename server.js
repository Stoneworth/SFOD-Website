require('dotenv').config(); // Ensure this is at the top to load environment variables

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');

const routesIndex = require('./routes-index');
const routesLogin = require('./routes-login-signup');
const routesDashboard = require('./routes-dashboard');
const routesProfile = require('./routes-profile');
const routesOrbatNato = require('./routes-orbat-nato');
const routesApplication = require('./routes-application');
const routesRecruitment = require('./routes-recruitment');
const routesForgotPassword = require('./routes-forgot-password');
const isAuthenticated = require('./routes-profile').isAuthenticated; // Import the middleware

const sessionSecret = process.env.SESSION_SECRET2;

if (!sessionSecret) {
    throw new Error("SESSION_SECRET2 is not defined in the environment variables.");
}

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect('mongodb://127.0.0.1:27017/dsqn-arma3-userDB')
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: 'mongodb://127.0.0.1:27017/dsqn-arma3-userDB',
        collectionName: 'sessions'
    }),
    cookie: {
        httpOnly: true,
        maxAge: 3600000, // 1 hour
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    }
}));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Use routes defined in the routes.js file
app.use('/', routesIndex);
app.use('/', routesLogin);
app.use('/', routesDashboard);
app.use('/', routesProfile);
app.use('/', routesOrbatNato);
app.use('/', routesApplication);
app.use('/', routesRecruitment);
app.use('/', routesForgotPassword);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
const server = app.listen(80, () => {
    console.log(`Server is running on port 80`);
});

// Handle graceful shutdown on 'e' key press
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(data) {
    if (data.trim().toLowerCase() === 'e') {
        console.log('Shutting down server...');
        process.exit();
    }
});

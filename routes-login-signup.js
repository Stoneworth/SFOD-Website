require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const { User, Rewards, Logs, OTCPhase } = require('./database');
const { sendVerificationEmail, sendPasswordResetEmail } = require('./emailService');

const router = express.Router();

router.get('/signup', (req, res) => {
    res.render('signup');
});

router.post('/signup', async (req, res) => {
    const { username, password, email, country } = req.body;

    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            if (existingUser.username === username) {
                return res.status(400).send('Username already exists.');
            }
            if (existingUser.email === email) {
                return res.status(400).send('Email already exists.');
            }
        }

        const salt = crypto.randomBytes(16).toString('hex');
        const saltProfile = crypto.randomBytes(16).toString('hex');

        crypto.pbkdf2(password, salt, 100000, 64, 'sha512', async (err, derivedKey) => {
            if (err) throw err;

            const hashedPassword = derivedKey.toString('hex');
            const verificationCode = Math.floor(Math.random() * 1000000).toString();

            const newUser = new User({
                username,
                password: hashedPassword,
                country,
                discord: 'N/A',
                dob: 'N/A',
                salt: salt,
                saltProfile: saltProfile,
                email,
                steam64id: 'N/A',
                dlc: 'N/A',
                find: 'N/A',
                isVerified: false,
                verificationCode,
                isAdmin: false,
                rank: 'Civilian',
                role: 'N/A',
                mos: 'N/A',
                team: 'N/A',
                callsign: 'N/A',
                active: 'N/A',
                timeInRank: Date.now(),
                timeInUnit: Date.now(),
                resetPasswordToken: 'N/A',
                resetPasswordExpires: Date.now(),
            });

            await newUser.save();

            const rewardsSTART = new Rewards({
                userId: newUser._id,
                // ribbons
                UNIT_A_PUC: false,
                UNIT_B_JMUA: false,
                UNIT_C_VUA: false,
                UNIT_D_MUC: false,
                UNIT_E_ASUA: false,
                A_SS: false,
                B_DSSM: false,
                C_LOM: false,
                D_DFC: false,
                E_SM: false,
                F_BSM: false,
                G_PH: false,
                H_DMSM: false,
                I_MSM: false,
                J_AM: false,
                K_JSCM: false,
                L_ACM: false,
                M_JSAM: false,
                N_AAM: false,
                O_POWM: false,
                P_GCM: false,
                Q_AFEM: false,
                R_AFSM: false,
                S_OVSM: false,
                T_NCOPDR: false,
                UA_ASR: false,
                // badges
                AAB: false,
                AAVB: false,
                CAB: false,
                CIB: false,
                CMD: false,
                EOD: false,
                EIB: false,
                MFF: false,
                RQ: false,
                // jshop
                IB: false,
                IG: false,
                IM: false,
                RB: false,
                RG: false,
                RM: false,
                // MOS
                AVIATION: false,
                EODMOS: false,
                ZEUS: false,
                MED: false,
                SF: false,
                SIGNAL: false,
                // tabs
                CAG: false,
                RGR: false,
                SF: false,
                // Unit Insignia
                CAGINSIGN: false,
                FCDINSIGN: false,
            });

            await rewardsSTART.save();

            const OTCPhaseNew = new OTCPhase({
                userId: newUser._id,
                phaseZero: false,
                phaseOne: false,
                phaseTwo: false,
                otcComplete: false,
            });

            await OTCPhaseNew.save();

            sendVerificationEmail(email, verificationCode);
            res.status(200).send('Signup successful! Please check your email for the verification code.');
        });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).send(`Error during signup: ${error.message}`);
    }
});

router.get('/verify-email', (req, res) => {
    res.render('verify-email', {});
});

router.post('/verify-email', async (req, res) => {
    const { email, verificationCode } = req.body;

    try {
        const user = await User.findOne({ email: email.toLowerCase(), verificationCode });

        if (user) {
            user.isVerified = true;
            user.verificationCode = null;
            await user.save();

            // Set session variables
            req.session.userId = user._id;
            req.session.username = user.username;
            req.session.salt = user.salt;
            req.session.saltProfile = user.saltProfile;
            req.session.isAdmin = user.isAdmin;
            const loggedinUsername = req.session.loggedinUsername; // Fetch logged-in username directly from the session
            const loggedinsaltProfile = req.session.loggedinsaltProfile; // Fetch logged-in saltProfile directly from the session

            // Create and save the profile HTML file
            const profileHtmlPath = path.join(__dirname, 'public', 'profiles', `profile-${user.saltProfile}.html`);
            const profileHtmlDir = path.dirname(profileHtmlPath);
            if (!fs.existsSync(profileHtmlDir)) {
                fs.mkdirSync(profileHtmlDir, { recursive: true });
            }

            const logs = user.logs || []; // Ensure logs is an array

            res.render('profile-template', {
                user: user,
                username: user.username,
                loggedinUsername: loggedinUsername,
                loggedinsaltProfile: loggedinsaltProfile,
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
                logs: logs,  // Pass logs to the template
                logRewards: [], // Assume no rewards initially
                currentPage: 1, // Initial page
                totalPages: 1, // Only one page of logs
                currentPageRewards: 1,
                totalPagesRewards: 1,
                dressImageExists: false, // Default to false, handle it in another way if needed
            }, (err, html) => {
                if (err) {
                    console.error('Error rendering profile template:', err);
                    return res.status(500).send('Internal server error');
                }

                fs.writeFile(profileHtmlPath, html, (err) => {
                    if (err) {
                        console.error('Error writing profile HTML file:', err);
                        return res.status(500).send('Internal server error');
                    }
                    res.status(200).send('Email verified successfully');
                });
            });

        } else {
            console.error('Invalid verification code or email:', email, verificationCode);
            res.status(400).send('Invalid verification code or email.');
        }
    } catch (error) {
        console.error('Error during email verification:', error);
        res.status(500).send('Internal server error');
    }
});

router.get('/login', (req, res) => {
    const alertMessage = req.session.alert;
    delete req.session.alert; // Clear the alert message after retrieving
    res.render('login', { alert: alertMessage });
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Username or password is incorrect.' });
        }

        if (!user.salt) {
            return res.status(500).json({ message: 'Internal server error.' });
        }

        // Verify the password using crypto.pbkdf2
        crypto.pbkdf2(password, user.salt, 100000, 64, 'sha512', (err, derivedKey) => {
            if (err) {
                return res.status(500).json({ message: 'Internal server error.' });
            }

            const hashedPassword = derivedKey.toString('hex');

            if (hashedPassword === user.password) {
                if (!user.isVerified) {
                    return res.status(403).json({ message: 'You must verify your email to gain full access to the website.' });
                }

                // Set session variables
                req.session.loggedinUsername = user.username;
                req.session.loggedinsaltProfile = user.saltProfile;
                req.session.isAdmin = user.isAdmin;
                req.session.user = {
                    _id: user._id,
                    username: user.username,
                    saltProfile: user.saltProfile,
                    isAdmin: user.isAdmin
                };

                res.redirect('/');
            } else {
                res.status(401).json({ message: 'Username or password is incorrect.' });
            }
        });

    } catch (error) {
        console.error('Error during login', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



// Logout route
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Error logging out.');
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

module.exports = router;

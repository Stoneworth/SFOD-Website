const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const { createCanvas, loadImage, registerFont } = require('canvas');
const { User, Log, LogRewards, Rewards, OTCPhase } = require('./database');
const rewardNames = require('./rewardNames');
const isAuthenticated = require('./routes-profile').isAuthenticated; // Import the middleware

// Function to get images from a directory
function getImagesFromDir(dir) {
    const imagesDir = path.join(__dirname, 'public', 'img', dir);
    return fs.readdirSync(imagesDir)
        .filter(file => file.endsWith('.png'))
        .map(file => path.parse(file).name);
}

// Function to get all images from defined folders
function getAllImages() {
    return {
        ribbons: getImagesFromDir('ribbons'),
        badge: getImagesFromDir('badge'),
        jshop: getImagesFromDir('jshop'),
        mos: getImagesFromDir('mos'),
        rank: getImagesFromDir('rank'),
        tabs: getImagesFromDir('tabs'),
        unitinsignia: getImagesFromDir('unitinsignia'),
    };
}

const isAdmin = async (req, res, next) => {
    if (req.session.userId) {
        try {
            const user = await User.findById(req.session.userId);
            if (user && user.isAdmin) {
                return next();
            } else {
                return res.status(403).json({ message: 'Access denied: Admins only' });
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    } else {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

const fontPath = path.join(__dirname, 'public/fonts/arial.ttf');
if (fs.existsSync(fontPath)) {
    registerFont(fontPath, { family: 'Arial' });
} else {
    console.error('Arial font not found at:', fontPath);
}

// Predefined ribbon positions with size
// Predefined ribbon positions with size
const imagePositions = {
    'ribbons/a_SS': { x: 1448, y: 550, width: 120, height: 40 },
    'ribbons/b_DSSM': { x: 1570, y: 550, width: 120, height: 40 },
    'ribbons/c_LOM': { x: 1692, y: 550, width: 120, height: 40 },

    'ribbons/d_DFC': { x: 1413, y: 591, width: 120, height: 40 },
    'ribbons/e_SM': { x: 1535, y: 591, width: 120, height: 40 },
    'ribbons/f_BSM': { x: 1657, y: 591, width: 120, height: 40 },

    'ribbons/g_PH': { x: 1375, y: 632, width: 120, height: 40 },
    'ribbons/h_DMSM': { x: 1497, y: 632, width: 120, height: 40 },
    'ribbons/i_MSM': { x: 1619, y: 632, width: 120, height: 40 },

    'ribbons/j_AM': { x: 1334, y: 673, width: 120, height: 40 },
    'ribbons/k_JSCM': { x: 1456, y: 673, width: 120, height: 40 },
    'ribbons/l_ACM': { x: 1578, y: 673, width: 120, height: 40 },

    'ribbons/m_JSAM': { x: 1334, y: 714, width: 120, height: 40 },
    'ribbons/n_AAM': { x: 1456, y: 714, width: 120, height: 40 },
    'ribbons/o_POWM': { x: 1578, y: 714, width: 120, height: 40 },

    'ribbons/p_GCM': { x: 1334, y: 755, width: 120, height: 40 },
    'ribbons/q_AFEM': { x: 1456, y: 755, width: 120, height: 40 },
    'ribbons/r_AFSM': { x: 1578, y: 755, width: 120, height: 40 },

    'ribbons/s_OVSM': { x: 1334, y: 796, width: 120, height: 40 },
    'ribbons/t_NCOPDR': { x: 1456, y: 796, width: 120, height: 40 },
    'ribbons/ua_ASR': { x: 1578, y: 796, width: 120, height: 40 },

    'ribbons/unit_a_PUC': { x: 470, y: 748, width: 112, height: 40 },
    'ribbons/unit_b_JMUA': { x: 582, y: 748, width: 112, height: 40 },
    'ribbons/unit_c_VUA': { x: 416, y: 787, width: 112, height: 40 },
    'ribbons/unit_d_MUC': { x: 526, y: 787, width: 112, height: 40 },
    'ribbons/unit_e_ASUA': { x: 638, y: 787, width: 112, height: 40 },
    // BADGE
    'badge/AAB': { x: 1417, y: 911, width: 135, height: 90 },
    'badge/AAVB': { x: 1700, y: 456, width: 165, height: 55 },
    'badge/CAB': { x: 1550, y: 456, width: 115, height: 57 },
    'badge/CIB': { x: 1600, y: 380, width: 200, height: 75 },
    'badge/CMD': { x: 1550, y: 456, width: 90, height: 62 },
    'badge/EOD': { x: 1700, y: 456, width: 106, height: 64 },
    'badge/EIB': { x: 1600, y: 400, width: 198, height: 35 },
    'badge/MFF': { x: 1237, y: 911, width: 161, height: 84 },
    'badge/RQ': { x: 1585, y: 898, width: 111, height: 169 },
    // jshop badges
    'jshop/IB': { x: 1534, y: 1186, width: 140, height: 160 },
    'jshop/IG': { x: 1534, y: 1186, width: 140, height: 160 },
    'jshop/IM': { x: 1534, y: 1186, width: 140, height: 160 },
    'jshop/RB': { x: 1294, y: 1160, width: 154, height: 184 },
    'jshop/RG': { x: 1294, y: 1160, width: 154, height: 184 },
    'jshop/RM': { x: 1294, y: 1160, width: 154, height: 184 },
    // MOS Badge
    'mos/AVIATION': { x: 750, y: 486, width: 556, height: 84 },
    'mos/EODMOS': { x: 773, y: 489, width: 489, height: 82 },
    'mos/ZEUS': { x: 778, y: 485, width: 497, height: 110 },
    'mos/MED': { x: 750, y: 479, width: 543, height: 94 },
    'mos/SF': { x: 750, y: 489, width: 536, height: 84 },
    'mos/SIGNAL': { x: 750, y: 485, width: 533, height: 92 },
    //rank
    'rank/5_1lt': { x: 132, y: 154, width: 1812, height: 279 },
    'rank/13_1sg': { x: -3, y: 811, width: 2059, height: 329 },
    'rank/6_2lt': { x: 75, y: 140, width: 1812, height: 279 },
    'rank/1_col': { x: 113, y: 154, width: 1812, height: 279 },
    'rank/4_cpt': { x: 126, y: 154, width: 1812, height: 279 },
    'rank/10_cw2': { x: 124, y: 154, width: 1812, height: 279 },
    'rank/9_cw3': { x: 122, y: 154, width: 1812, height: 279 },
    'rank/8_cw4': { x: 126, y:154, width: 1812, height: 279 },
    'rank/7_cw5': { x: 125, y: 154, width: 1812, height: 279 },
    'rank/2_ltc': { x: 121, y: 154, width: 1812, height: 279 },
    'rank/3_maj': { x: 118, y: 154, width: 1812, height: 279 },
    'rank/14_msg': { x: -1, y: 811, width: 2059, height: 329 },
    'rank/12_sgm': { x: 11, y: 816, width: 2059, height: 329 },
    'rank/17_sgt': { x: 9, y: 815, width: 2059, height: 329 },
    'rank/16_ssg': { x: 10, y: 809, width: 2059, height: 329 },
    'rank/15_sfc': { x: 10, y: 706, width: 2025, height: 430 },
    'rank/11_wo1': { x: 128, y: 154, width: 1812, height: 279 },
    //tabs
    'tabs/CAG': { x: 1908, y: 468, width: 96, height: 355 },
    'tabs/SF': { x: 1897, y: 387, width: 86, height: 50 },
    'tabs/RGR': { x: 1903, y: 428, width: 86, height: 50 },
    //unitinsignia
    'unitinsignia/CAGINSIGN': { x: 292, y: 249, width: 1471, height: 55 },
    'unitinsignia/FCDINSIGN': { x: 315, y: 252, width: 1415, height: 43 },
    };

function sortItems(items) {
    if (!Array.isArray(items)) {
        console.error('sortItems expected an array but got:', items);
        return [];
    }
    return items.sort((a, b) => {
        const aNum = parseInt(a.match(/^\d+/));
        const bNum = parseInt(b.match(/^\d+/));
        return aNum - bNum;
    });
}

function calculateDaysSince(date) {
    if (!date) {
        return 'N/A'; // Return placeholder if date is missing
    }

    const givenDate = new Date(date);
    if (isNaN(givenDate.getTime())) {
        return 'Invalid Date'; // Return error message if date is invalid
    }

    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - givenDate); // Difference in milliseconds
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
    return diffDays;
}

// Create sortedImages object
const images = getAllImages();
const sortedImages = {
    ribbons: sortItems(images.ribbons),
    badge: sortItems(images.badge),
    jshop: sortItems(images.jshop),
    mos: sortItems(images.mos),
    rank: sortItems(images.rank),
    tabs: sortItems(images.tabs),
    unitinsignia: sortItems(images.unitinsignia),
};

function generateColumnHTML(items, title, logRewards) {
    return `
        <div class="column">
            <h2>${title}</h2>
            ${items.map(item => {
                const rewardKey = item.toUpperCase().replace(/\s+/g, '_'); // Convert item name to match the schema keys
                const isChecked = logRewards && logRewards[rewardKey] ? 'checked' : '';
                return `
                    <div class="item">
                        <input type="checkbox" name="${rewardKey}" value="true" ${isChecked}> ${item.replace(/^\d+/, '').replace(/_/g, ' ')}
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// Route to display rewards
router.get('/admin/rewards/:userId', isAdmin, async (req, res) => {
    try {
        const userId = req.params.userId;
        const logRewards = await LogRewards.findOne({ userId });
        if (!logRewards) {
            return res.status(404).json({ message: 'LogRewards not found for user' });
        }
        
        const columnsHTML = Object.keys(sortedImages).map(key => generateColumnHTML(sortedImages[key], key, logRewards)).join('');
        
        res.send(`
            <html>
                <body>
                    <form id="rewardsForm" action="/admin/rewards/${userId}" method="POST">
                        ${columnsHTML}
                        <button type="submit">Generate Image</button>
                    </form>
                </body>
            </html>
        `);
    } catch (error) {
        console.error('Error fetching LogRewards:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to update rewards
router.post('/admin/rewards/:userId', isAdmin, async (req, res) => {
    try {
        const userId = req.params.userId;
        const updates = {};

        // Convert req.body to updates object
        for (const key in req.body) {
            updates[key] = req.body[key] === 'true';
        }

        await LogRewards.findOneAndUpdate({ userId }, updates, { new: true });
        res.redirect(`/admin/rewards/${userId}`);
    } catch (error) {
        console.error('Error updating LogRewards:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Routes
router.post('/generate', async (req, res) => {
    const { userId, rewards } = req.body;


    if (!userId) {
        console.error('Invalid request: Missing userId.');
        return res.status(400).send('Invalid request: Missing userId.');
    }

    const selectedRewards = Array.isArray(rewards) ? rewards : [];

    const allPossibleRewards = [
        'UNIT_A_PUC', 'UNIT_B_JMUA', 'UNIT_C_VUA', 'UNIT_D_MUC', 'UNIT_E_ASUA',
        'A_SS', 'B_DSSM', 'C_LOM', 'D_DFC', 'E_SM', 'F_BSM', 'G_PH', 'H_DMSM',
        'I_MSM', 'J_AM', 'K_JSCM', 'L_ACM', 'M_JSAM', 'N_AAM', 'O_POWM', 'P_GCM',
        'Q_AFEM', 'R_AFSM', 'S_OVSM', 'T_NCOPDR', 'UA_ASR', 'AAB', 'AAVB', 'CAB',
        'CIB', 'CMD', 'EOD', 'EIB', 'MFF', 'RQ', 'IB', 'IG', 'IM', 'RB', 'RG', 'RM',
    ];

    const templatePath = path.join(__dirname, '/public/img/dress-template.png'); // Adjust template path as needed

    try {
        const canvas = createCanvas(2048, 1379); // Adjust canvas size as needed
        const ctx = canvas.getContext('2d');

        const templateImage = await loadImage(templatePath);
        ctx.drawImage(templateImage, 0, 0);

        for (const selection of selectedRewards) {
            if (selection) { // Check if selection is not empty
                const [category, imageName] = selection.split('/');
                if (category && imageName) {
                    const imagePath = path.join(__dirname, `/public/img/${category}/${imageName}.png`);

                    try {
                        const image = await loadImage(imagePath);
                        const position = imagePositions[selection];

                        if (position) {
                            ctx.drawImage(image, position.x, position.y, position.width, position.height);
                        } else {
                            console.error(`No position defined for ${selection}`);
                        }
                    } catch (loadImageError) {
                        console.error(`Error loading image for ${selection}:`, loadImageError);
                    }
                } else {
                    console.error(`Invalid selection format: ${selection}`);
                }
            } else {
                console.error('Empty selection encountered');
            }
        }

        // Retrieve user's saltProfile and rewards from the database
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const saltProfile = user.saltProfile; // Assuming saltProfile is a unique identifier or name
        const outputFileName = `dress-${saltProfile}.png`; // Construct output file name
        console.log('Generated output file name:', outputFileName);

        // Extract and format username
        const username = user.username.split('.').pop().trim().toUpperCase();

        // Draw username on the canvas
        const textX = 585; // x-coordinate
        const textY = 950; // y-coordinate
        ctx.font = '46px Arial';
        ctx.fillStyle = 'white'; // Set the fill color to white
        ctx.textAlign = 'center'; // Center the text horizontally
        ctx.fillText(username, textX, textY);

        const outputPath = path.join(__dirname, '/public/img/profile-dress', outputFileName);

        const out = fs.createWriteStream(outputPath);
        const stream = canvas.createPNGStream();
        stream.pipe(out);

        // Check current rewards from the database
        const currentRewards = await Rewards.findOne({ userId });
        const currentRewardsState = currentRewards ? currentRewards.toObject() : {};

        out.on('finish', async () => {

            // Update user rewards and create logs only for new rewards
            const updates = {};
            const logPromises = [];

            allPossibleRewards.forEach(reward => {
                updates[reward] = false;
            });

            selectedRewards.forEach(selection => {
                const rewardName = selection.split('/')[1];
                const rewardKey = rewardName.toUpperCase().replace(/-/g, '_');

                if (rewardNames.hasOwnProperty(rewardKey) && !currentRewardsState[rewardKey]) {
                    const fullRewardName = rewardNames[rewardKey]; // Get the full name from rewardNames
                    updates[rewardKey] = true;

                    // Log the reward with the full name
                    const logReward = new LogRewards({
                        userId: userId,
                        changeDate: new Date(),
                        newValue: fullRewardName // Store the full reward name in newValue
                    });

                    logPromises.push(logReward.save().then(savedLogReward => {
                        return savedLogReward;
                    }).catch(logError => {
                        console.error('Error saving log or LogRewards entry:', logError);
                        throw logError;
                    }));
                }
            });

            try {
                // Wait for all log promises to complete
                await Promise.all(logPromises);

                // Update or create the rewards entry for the user
                const rewardResult = await Rewards.findOneAndUpdate(
                    { userId },
                    { $set: updates },
                    { new: true, upsert: true }
                );

                // Redirect to /dashboard upon completion
                res.redirect('/dashboard');
            } catch (updateError) {
                console.error('Error updating Rewards:', updateError);
                res.status(500).send('An error occurred while updating the Rewards.');
            }
        });
    } catch (err) {
        console.error('Error generating the dress profile:', err);
        res.status(500).send('An error occurred while generating the dress profile.');
    }
});



router.get('/edit', isAuthenticated, (req, res) => {
    // Render edit page with sortedImages
    const { ribbons, badge, jShop, MOS, rank, tabs, unitinsignia } = sortedImages;

    res.render('edit', {
        ribbonsColumn: generateColumnHTML(ribbons, 'Ribbons'),
        badgeColumn: generateColumnHTML(badge, 'Badge'),
        jShopColumn: generateColumnHTML(jShop, 'J-Shop'),
        MOSColumn: generateColumnHTML(MOS, 'MOS'),
        rankColumn: generateColumnHTML(rank, 'Rank'),
        tabsColumn: generateColumnHTML(tabs, 'Tabs'),
        unitinsigniaColumn: generateColumnHTML(unitinsignia, 'unitinsignia')
    });
});

router.get('/dashboard', isAuthenticated, async (req, res) => {
    try {
        const users = await User.find({});
        const usersCAN = await User.find({ rank: 'CAN' });
        const selectedUserId = req.query.userId;
        let userRewards = {};

        if (selectedUserId) {
            const logRewards = await LogRewards.findOne({ userId: selectedUserId });
            userRewards = logRewards ? logRewards.toObject() : {};
        }

        const userPhases = await Promise.all(users.map(async user => {
            const otcPhase = await OTCPhase.findOne({ userId: user._id });
            return {
                ...user.toObject(),
                otcphase: otcPhase ? (otcPhase.phaseZero ? 'phaseZero' : otcPhase.phaseOne ? 'phaseOne' : otcPhase.phaseTwo ? 'phaseTwo' : otcPhase.otcComplete ? 'otcComplete' : 'none') : 'none'
            };
        }));

        const usersWithCalculatedTimes = userPhases.map(user => ({
            ...user,
            timeInUnit: calculateDaysSince(user.createdAt),
            timeInRank: calculateDaysSince(user.rankAssignedDate)
        }));

        res.render('dashboard', {
            users: usersWithCalculatedTimes,
            sortedImages,
            selectedUserId,
            rewards: userRewards
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Internal server error');
    }
});

router.post('/delete-user/:id', async (req, res) => {
    if (req.session.userId) {
        const user = await User.findById(req.session.userId);
        if (user && user.isAdmin) {
            try {
                await User.findByIdAndDelete(req.params.id);
                res.redirect('/dashboard');
            } catch (error) {
                console.error('Error deleting user:', error);
                res.status(500).send('Internal server error');
            }
        } else {
            res.status(403).send('Access denied'); // Not an admin
        }
    } else {
        res.redirect('/login'); // Not logged in
    }
});

router.post('/update-all-users', isAuthenticated, async (req, res) => {
    const { users } = req.body;

    try {
        if (!Array.isArray(users)) {
            throw new Error('Invalid input: users should be an array');
        }

        const updatePromises = users.map(async (user) => {
            // Check if the user properties are arrays and flatten them
            Object.keys(user).forEach((key) => {
                if (Array.isArray(user[key])) {
                    console.warn(`Flattening array for ${key}:`, user[key]);
                    user[key] = user[key][0]; // Use the first element of the array
                }
            });

            if (typeof user.username !== 'string') {
                console.error('Invalid username for user:', user);
                throw new Error('Invalid username: must be a string');
            }

            const existingUser = await User.findById(user.id);
            if (!existingUser) {
                console.error('User not found with ID:', user.id);
                throw new Error('User not found');
            }

            const updates = {
                username: user.username,
                isAdmin: user.isAdmin === 'true', // Convert to boolean
                rank: user.rank,
                role: user.role,
                mos: user.mos,
                callsign: user.callsign,
                active: user.active,
                team: user.team
            };

            // Log changes
            const logPromises = [];
            ['rank', 'role', 'team'].forEach((key) => {
                if (updates[key] !== existingUser[key]) {
                    const log = new Log({
                        userId: user.id,
                        changeType: key,
                        oldValue: existingUser[key],
                        newValue: updates[key]
                    });
                    logPromises.push(log.save().then(savedLog => {
                        existingUser.logs.push(savedLog._id);
                    }));
                }
            });

            await Promise.all(logPromises);

            // Update the user
            if (existingUser.rank !== user.rank) {
                updates.rankAssignedDate = moment().toDate(); // Update rankAssignedDate if the rank has changed
            }

            Object.assign(existingUser, updates);
            await existingUser.save();
        });

        await Promise.all(updatePromises);

        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error updating users:', error);
        res.status(500).send('Internal server error');
    }
});

router.post('/update-all-members', isAuthenticated, async (req, res) => {
    const { users } = req.body;

    try {
        if (!Array.isArray(users)) {
            throw new Error('Invalid input: users should be an array');
        }

        const updatePromises = users.map(async (user) => {
            // Check if the user properties are arrays and flatten them
            Object.keys(user).forEach((key) => {
                if (Array.isArray(user[key])) {
                    console.warn('Flattening array for ${key}:, user[key]');
                    user[key] = user[key][0]; // Use the first element of the array
                }
            });

            if (typeof user.username !== 'string') {
                console.error('Invalid username for user:', user);
                throw new Error('Invalid username: must be a string');
            }

            const existingUser = await User.findById(user.id);
            if (!existingUser) {
                console.error('User not found with ID:', user.id);
                throw new Error('User not found');
            }

            const updates = {
                username: user.username,
                isAdmin: user.isAdmin === 'true', // Convert to boolean
                rank: user.rank,
                role: user.role,
                mos: user.mos,
                callsign: user.callsign,
                active: user.active,
                team: user.team
            };

            if (existingUser.rank !== user.rank) {
                updates.rank = user.rank;
                updates.rankAssignedDate = moment().toDate(); // Update rankAssignedDate if the rank has changed
            }

            return User.findByIdAndUpdate(user.id, updates, { new: true });
        });

        await Promise.all(updatePromises);

        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error updating users:', error);
        res.status(500).send('Internal server error');
    }
});

router.post('/update-all-applicants', async (req, res) => {
    try {
      const users = req.body.users;
  
      await Promise.all(users.map(async (user) => {
        const userId = user.id;
        const otcPhaseField = user.otcphase;
  
        let otcPhaseDoc = await OTCPhase.findOne({ userId });
  
        if (!otcPhaseDoc) {
          otcPhaseDoc = new OTCPhase({ userId });
        }
  
        // Reset all phases to false
        otcPhaseDoc.phaseZero = false;
        otcPhaseDoc.phaseOne = false;
        otcPhaseDoc.phaseTwo = false;
        otcPhaseDoc.otcComplete = false;
  
        // Set the specified phase to true
        otcPhaseDoc[otcPhaseField] = true;
        await otcPhaseDoc.save();
  
      }));
  
      res.redirect('/dashboard');
    } catch (error) {
      console.error('Error updating users:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.get('/user-otcphase/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const otcPhaseDoc = await OTCPhase.findOne({ userId });

        if (!otcPhaseDoc) {
            return res.status(404).json({ error: 'OTCPhase document not found' });
        }

        res.json({
            phaseZero: otcPhaseDoc.phaseZero,
            phaseOne: otcPhaseDoc.phaseOne,
            phaseTwo: otcPhaseDoc.phaseTwo,
            otcComplete: otcPhaseDoc.otcComplete,
        });
    } catch (error) {
        console.error('Error fetching user OTC phase:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/update-all-civilians', isAuthenticated, async (req, res) => {
    const { users } = req.body;


    try {
        if (!Array.isArray(users)) {
            throw new Error('Invalid input: users should be an array');
        }

        const updatePromises = users.map(async (user) => {
            // Check if the user properties are arrays and flatten them
            Object.keys(user).forEach((key) => {
                if (Array.isArray(user[key])) {
                    console.warn('Flattening array for ${key}:, user[key]');
                    user[key] = user[key][0]; // Use the first element of the array
                }
            });

            if (typeof user.username !== 'string') {
                console.error('Invalid username for user:', user);
                throw new Error('Invalid username: must be a string');
            }

            const existingUser = await User.findById(user.id);
            if (!existingUser) {
                console.error('User not found with ID:', user.id);
                throw new Error('User not found');
            }

            const updates = {
                username: user.username,
                isAdmin: user.isAdmin === 'true', // Convert to boolean
                rank: user.rank,
                role: user.role,
                mos: user.mos,
                callsign: user.callsign,
                active: user.active,
                team: user.team
            };

            if (existingUser.rank !== user.rank) {
                updates.rank = user.rank;
                updates.rankAssignedDate = moment().toDate(); // Update rankAssignedDate if the rank has changed
            }


            return User.findByIdAndUpdate(user.id, updates, { new: true });
        });

        await Promise.all(updatePromises);

        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error updating users:', error);
        res.status(500).send('Internal server error');
    }
});

router.get('/user-rewards/:userId', isAuthenticated, async (req, res) => {
    try {
        const userId = req.params.userId;
        const rewards = await Rewards.findOne({ userId });

        if (rewards) {
            res.json(rewards.toObject());
        } else {
            res.json({});
        }
    } catch (error) {
        console.error('Error fetching user rewards:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;

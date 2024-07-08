const mongoose = require('mongoose');

const log = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    changeType: { type: String, required: true },
    oldValue: { type: String, required: true },
    newValue: { type: String, required: true },
    changeDate: { type: Date, default: Date.now }
});

const logRewards = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    newValue: { type: String, required: true },
    changeDate: { type: Date, default: Date.now }
});

const rewards = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // ribbons
    UNIT_A_PUC: Boolean,
    UNIT_B_JMUA: Boolean,
    UNIT_C_VUA: Boolean,
    UNIT_D_MUC: Boolean,
    UNIT_E_ASUA: Boolean,
    A_SS: Boolean,
    B_DSSM: Boolean,
    C_LOM: Boolean,
    D_DFC: Boolean,
    E_SM: Boolean,
    F_BSM: Boolean,
    G_PH: Boolean,
    H_DMSM: Boolean,
    I_MSM: Boolean,
    J_AM: Boolean,
    K_JSCM: Boolean,
    L_ACM: Boolean,
    M_JSAM: Boolean,
    N_AAM: Boolean,
    O_POWM: Boolean,
    P_GCM: Boolean,
    Q_AFEM: Boolean,
    R_AFSM: Boolean,
    S_OVSM: Boolean,
    T_NCOPDR: Boolean,
    UA_ASR: Boolean,
    // badges
    AAB: Boolean,
    AAVB: Boolean,
    CAB: Boolean,
    CIB: Boolean,
    CMD: Boolean,
    EOD: Boolean,
    EIB: Boolean,
    MFF: Boolean,
    RQ: Boolean,
    // jshop
    IB: Boolean,
    IG: Boolean,
    IM: Boolean,
    RB: Boolean,
    RG: Boolean,
    RM: Boolean,
    // MOS
    AVIATION: Boolean,
    EODMOS: Boolean,
    ZEUS: Boolean,
    MED: Boolean,
    SF: Boolean,
    SIGNAL: Boolean,
    //tabs
    CAG: Boolean,
    RGR: Boolean,
    SF: Boolean,
    // Unit Insignia
    CAGINSIGN: Boolean,
    FCDINSIGN: Boolean,
});

// Define the User schema
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    country: String,
    dob: String,
    salt: String,
    saltProfile: String,
    email: String,
    steam64id: String,
    dlc: String,
    find: String,
    isVerified: Boolean,
    verificationCode: String,
    isAdmin: Boolean,
    rank: String,
    role: String,
    mos: String,
    team: String,
    callsign: String,
    active: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    createdAt: { type: Date, default: Date.now },
    rankAssignedDate: {type: Date, default: Date.now },
    logs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Log' }],
    logRewards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LogRewards' }]
});


// Define the UserApplication schema
const otcPhase = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    phaseZero: Boolean,
    phaseOne: Boolean,
    phaseTwo: Boolean,
    otcComplete : Boolean,
});

// Create the models
const User = mongoose.model('User', userSchema);
const OTCPhase = mongoose.model('OTCPhase', otcPhase);
const Log = mongoose.model('Log', log);
const LogRewards = mongoose.model('LogRewards', logRewards);
const Rewards = mongoose.model('Rewards', rewards);

// Export the models
module.exports = { User, OTCPhase, Log, LogRewards, Rewards};

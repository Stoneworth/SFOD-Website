const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { User, OTCPhase } = require('./database');

router.get('/orbat-nato', async (req, res) => {
    const user = req.session.user;
    res.locals.user = user;

    try {
        const callsignsTroopHQ = ["D1A", "D1B", "D1C", "D1D"];
        const callsignsAlpha = ["DA1", "DA2", "DA3", "DA4", "DA5", "DA6"];
        const callsignsBravo = ["DB1", "DB2", "DB3", "DB4", "DB5", "DB6"];
        const callsignsCharlie = ["DC1", "DC2", "DC3", "DC4", "DC5", "DC6"];

        const callsignsSierraHQ = ["D3A", "D3B", "D3C"];
        const callsignsSierra = ["DS1", "DS2", "DS3"];

        const rolesZeus = ["Intel Officer", "Intel Analyst"];

        const teamEcho = ["Echo"];

        const rolesATOHQ = ["Squadron CO", "Squadron XO"];
        const rolesATOAOD = ["Lead Pilot", "Pilot"];
        const rolesATOSWD = ["Lead Pilot", "Pilot"];

        const phaseZero = ["true"];
        const phaseOne = ["true"];
        const phaseTwo = ["true"];

        const oneTroopHQ = await User.find({ callsign: { $in: callsignsTroopHQ } }).exec();
        const alphaTeam = await User.find({ callsign: { $in: callsignsAlpha } }).exec();
        const bravoTeam = await User.find({ callsign: { $in: callsignsBravo } }).exec();
        const charlieTeam = await User.find({ callsign: { $in: callsignsCharlie } }).exec();

        const threeTroopHQ = await User.find({ callsign: { $in: callsignsSierraHQ } }).exec();
        const sierraTeam = await User.find({ callsign: { $in: callsignsSierra } }).exec();

        const combatSupport = await User.find({ role: { $in: rolesZeus } }).exec();

        const echoTeam = await User.find({ team: { $in: teamEcho } }).exec();

        const ATOHQ = await User.find({ role: { $in: rolesATOHQ } }).exec();
        const ATOAOD = await User.find({ team: 'Assault Operations Division', role: { $in: rolesATOAOD } }).exec();
        const ATOSWD = await User.find({ role: { $in: rolesATOSWD }, team: 'Strike Warfare Division' }).exec();

        const candidateZero = await OTCPhase.aggregate([
            { $match: { phaseZero: true } },
            {
                $lookup: {
                    from: 'users', // The name of the User collection
                    localField: 'userId', // Field in OTCPhase
                    foreignField: '_id', // Field in User
                    as: 'userDetails'
                }
            },
            { $unwind: '$userDetails' }
        ]);

        // Fetch phaseOne members with user details
        const candidateOne = await OTCPhase.aggregate([
            { $match: { phaseOne: true } },
            {
                $lookup: {
                    from: 'users', // The name of the User collection
                    localField: 'userId', // Field in OTCPhase
                    foreignField: '_id', // Field in User
                    as: 'userDetails'
                }
            },
            { $unwind: '$userDetails' }
        ]);

        // Fetch phaseTwo members with user details
        const candidateTwo = await OTCPhase.aggregate([
            { $match: { phaseTwo: true } },
            {
                $lookup: {
                    from: 'users', // The name of the User collection
                    localField: 'userId', // Field in OTCPhase
                    foreignField: '_id', // Field in User
                    as: 'userDetails'
                }
            },
            { $unwind: '$userDetails' }
        ]);
        
        oneTroopHQ.sort((a, b) => callsignsTroopHQ.indexOf(a.callsign) - callsignsTroopHQ.indexOf(b.callsign));
        alphaTeam.sort((a, b) => callsignsAlpha.indexOf(a.callsign) - callsignsAlpha.indexOf(b.callsign));
        bravoTeam.sort((a, b) => callsignsBravo.indexOf(a.callsign) - callsignsBravo.indexOf(b.callsign));
        charlieTeam.sort((a, b) => callsignsCharlie.indexOf(a.callsign) - callsignsCharlie.indexOf(b.callsign));

        threeTroopHQ.sort((a, b) => callsignsSierraHQ.indexOf(a.callsign) - callsignsSierraHQ.indexOf(b.callsign));
        sierraTeam.sort((a, b) => callsignsSierra.indexOf(a.callsign) - callsignsSierra.indexOf(b.callsign));

        combatSupport.sort((a, b) => rolesZeus.indexOf(a.role) - rolesZeus.indexOf(b.role));

        echoTeam.sort((a, b) => teamEcho.indexOf(a.role) - teamEcho.indexOf(b.role));

        ATOHQ.sort((a, b) => rolesATOHQ.indexOf(a.role) - rolesATOHQ.indexOf(b.role));
        ATOAOD.sort((a, b) => rolesATOAOD.indexOf(a.role) - rolesATOAOD.indexOf(b.role));
        ATOSWD.sort((a, b) => rolesATOSWD.indexOf(a.role) - rolesATOSWD.indexOf(b.role));

        candidateZero.sort((a, b) => phaseZero.indexOf(a.phaseZero) - phaseZero.indexOf(b.phaseZero));
        candidateOne.sort((a, b) => phaseOne.indexOf(a.phaseOne) - phaseOne.indexOf(b.phaseOne));
        candidateTwo.sort((a, b) => phaseTwo.indexOf(a.phaseTwo) - phaseTwo.indexOf(b.phaseTwo));

        res.render('orbat-nato', { user, oneTroopHQ, alphaTeam, bravoTeam, charlieTeam, threeTroopHQ, sierraTeam, combatSupport,
            echoTeam, ATOHQ, ATOAOD, ATOSWD, candidateZero, candidateOne, candidateTwo
         });
    } catch (error) {
        console.error('Error fetching members:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;

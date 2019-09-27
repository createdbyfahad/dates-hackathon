const express = require('express');
const {check } = require('express-validator');


const controller = require('./controllers/main');
const passportConfig = require('./config/passport');
const constants = require('./constants');

const dashboard = express.Router();
dashboard.use(passportConfig.isAuthenticated);
dashboard.get('/', controller.getMain);
dashboard.get('/farm', controller.getFarm);
dashboard.get('/farm/add', controller.addTree);
dashboard.post('/farm/add', [
        check('type').isIn(constants.palmTypes),
        check('age').isInt({ min: 0 }).toInt(),
        check('plantation').isISO8601(),
        check('locationRow').isInt({ min: 0, max: 500 }).toInt(),
        check('locationColumn').isInt({ min: 0, max: 500 }).toInt(),
    ],  controller.postTree);
dashboard.get('/farm/:id(\\d+)/', controller.getTree);
dashboard.get('/farm/:id(\\d+)/health/add', controller.addHealth);
dashboard.post('/farm/:id(\\d+)/health/add', [
        check('type').isIn(constants.palmHealth),
        check('startDate').isISO8601().isBefore(new Date().toString()),
        check('comment').isLength({ min: 0, max: 140 })
    ], controller.postHealth);
dashboard.get('/farm/:id(\\d+)/health/:healthId/healthy', controller.processHealth);

dashboard.post('/farm/:id(\\d+)/harvest/add', [
    check('weight').isFloat({min: 0.1, max: 20}),
    check('comment').isLength({ min: 0, max: 140 })
], controller.postHarvest);




exports.default = dashboard;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sessionController_1 = require("../controllers/sessionController");
const router = (0, express_1.Router)();
const manejoSession = new sessionController_1.SessionController();
router.get('/session', (req, res) => {
    //res.send("Inicio de Sesión");
    res.render('auth/login');
});
router.post('/session', (req, res) => manejoSession.loginUser(req, res));
router.get('/logout', (req, res) => { manejoSession.logoutUser(req, res); });
exports.default = router;

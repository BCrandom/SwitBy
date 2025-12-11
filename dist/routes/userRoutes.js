"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const router = (0, express_1.Router)();
const userController = new userController_1.userThings();
router.get('/profile/:id', (req, res) => {
    userController.mostrarPerfil(req, res);
});
router.get('/profile/editar/:id', (req, res) => {
    const id = req.params.id;
    res.render('users/editProfile', { id });
});
router.post('/profile/editar/:id', (req, res) => {
    userController.editarPerfil(req, res);
});
exports.default = router;

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../db");
class SessionController {
    loginUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ message: 'Estos campos son Obligatorios!' });
            }
            const db = yield (0, db_1.initializeDB)();
            //Validación del correo y contraseña
            const user = yield db.get('SELECT * FROM usuarios WHERE email = ?', [email]);
            if (!user || !(yield bcrypt_1.default.compare(password, user.password))) {
                return res.status(400).json({ message: 'Usuario o Contrseña, Incorrectos! D:' });
            }
            //Crear la sesión del usuario
            req.session.user = {
                id: user.id,
                name: user.name,
                email: user.email
            };
            /* return res.status(200).json({
              message: 'Inicio de sesión exitoso :D', user: req.session.user
            }); */
            res.redirect('/main');
        });
    }
    logoutUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            req.session.destroy((err) => {
                if (err) {
                    return console.log("Error:", err);
                }
                res.redirect('/session');
            });
        });
    }
}
exports.SessionController = SessionController;

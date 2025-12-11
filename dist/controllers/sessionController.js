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
            try {
                //Validación del correo
                const user = yield db.get(`SELECT 
            u.id, u.email, u.password, u.is_active,
            p.username, p.avatar_url,
            r.rol_name
          FROM usuarios u
          INNER JOIN perfiles p ON u.id = p.user_id
          INNER JOIN roles r ON u.rol_id = r.id
          WHERE u.email = ?`, [email]);
                //Verificar si el usuario existe y la contraseña es correcta
                if (!user || !(yield bcrypt_1.default.compare(password, user.password))) {
                    return res.status(400).json({ message: 'Credenciales Incorrectos! D:' });
                }
                //Verificar si la cuenta está activa
                if (user.is_active === 0) {
                    return res.status(403).json({
                        message: 'Tu cuenta ha sido desactivada. Contacta al soporte.'
                    });
                }
                //Actualizar la última actividad del usuario
                yield db.run(`UPDATE perfiles SET last_activity = datetime('now') WHERE user_id = ?`, [user.id]);
                //Crear la sesión del usuario
                req.session.user = {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    avatar: user.avatar_url,
                    rol: user.rol_name
                };
                //Guardar la sesión en el navegador
                req.session.save((err) => {
                    if (err) {
                        console.error("Error al guardar sesión:", err);
                        return res.status(500).json({ message: "Error de sesión" });
                    }
                    // Redirigir a la página principal
                    res.redirect('/main');
                });
            }
            catch (e) {
                console.error("Error:", e);
                return res.status(500).json({ message: "Error con la validación de los campos" });
            }
        });
    }
    //Cerrar Sesión manejado errores
    logoutUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            req.session.destroy((err) => {
                if (err) {
                    console.error("Error:", err);
                    return res.status(500).json({ message: "No se pudo cerrar sesión" });
                }
                res.redirect('/session');
            });
        });
    }
}
exports.SessionController = SessionController;

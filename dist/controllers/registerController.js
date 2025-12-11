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
exports.RegisterController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../db");
class RegisterController {
    registerUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, email, password } = req.body;
            if (!name || !email || !password) {
                return res.status(400).json({ message: 'Estos campos son Obligatorios!' });
            }
            const db = yield (0, db_1.initializeDB)();
            //Validar existencia del usuario/////
            try {
                const revUser = yield db.get('SELECT * FROM usuarios WHERE email = ?', [email]);
                if (revUser) {
                    return res.status(400).json({ message: 'El Correo ya existe :)' });
                }
                const revProfile = yield db.get('SELECT user_id FROM perfiles WHERE username = ?', [name]);
                if (revProfile) {
                    return res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
                }
                ////VALIDACIÓN////////
                //A partir de acá, se viene el registro completo para las dos tablas
                yield db.run('BEGIN TRANSACTION');
                try {
                    //Hashear la contraseña y guardar el usuario en la base de datos
                    const passwordHash = yield bcrypt_1.default.hash(password, 10);
                    const insertUserStmt = yield db.prepare('INSERT INTO usuarios (email, password) VALUES (?, ?)');
                    const result = yield insertUserStmt.run(email, passwordHash);
                    yield insertUserStmt.finalize();
                    //Acá, obtenemos el ID que ya está generado en la tabla de usuarios
                    const userId = result.lastID;
                    if (!userId) {
                        throw new Error('Error al generar el ID del usuario');
                    }
                    //Al obtener el ID, procedemos a crear el perfil asociado
                    const insertProfileStmt = yield db.prepare('INSERT INTO perfiles (user_id, username) VALUES (?, ?)');
                    yield insertProfileStmt.run(userId, name);
                    yield insertProfileStmt.finalize();
                    yield db.run('COMMIT');
                    return res.status(201).json({
                        message: 'Usuario registrado correctamente :D',
                    });
                }
                catch (e) {
                    console.error('Error durante la transacción:', e);
                    // Deshacemos todo (Borra el usuario si se creó pero falló el perfil)
                    yield db.run('ROLLBACK');
                    return res.status(500).json({ message: 'Error interno al registrar el usuario.' });
                }
            }
            catch (e) {
                console.error(e);
                return res.status(500).json({ message: 'Error de servidor' });
            }
        });
    }
}
exports.RegisterController = RegisterController;

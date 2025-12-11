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
Object.defineProperty(exports, "__esModule", { value: true });
exports.userThings = void 0;
const db_1 = require("../db");
class userThings {
    mostrarPerfil(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            try {
                const db = yield (0, db_1.initializeDB)();
                const user = yield db.get("SELECT * FROM usuarios as u INNER JOIN perfiles p ON u.id = p.user_id WHERE id = ?", [id]);
                if (!user) {
                    return res.status(404).send("Usuario no encontrado");
                }
                res.render("users/profile", { user });
            }
            catch (error) {
                console.error(error);
                res.status(500).send("Error en la base de datos");
            }
        });
    }
    editarPerfil(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, first_name, last_name, bio } = req.body;
            const id = req.params.id;
            const db = yield (0, db_1.initializeDB)();
            try {
                const stmt = yield db.run(`UPDATE perfiles SET username = ?, first_name = ?, last_name = ?, bio = ? WHERE user_id = ?`, [username, first_name, last_name, bio, id]);
                if (stmt) {
                    //res.send("Se actualizarion los datos bien");
                    res.redirect(`/profile/${id}`);
                }
                else {
                    res.status(404).send("No se encontró el usuario para actualizar");
                }
            }
            catch (error) {
                console.log("Ocurrio un error: ", error);
            }
        });
    }
}
exports.userThings = userThings;
;

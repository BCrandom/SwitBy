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
exports.UserController = void 0;
const db_1 = require("../db");
const postsMainController_1 = require("./postsMainController");
class UserController {
    getMain(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const verPost = (_a = yield (0, postsMainController_1.mostrarPost)()) !== null && _a !== void 0 ? _a : [];
                res.status(200).render("layouts/main", {
                    user: req.session.user,
                    receivePosts: verPost
                });
            }
            catch (error) {
                console.log("Error: ", error);
            }
        });
    }
    getCreatePost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.status(200).render("post/create", {
                user: req.session.user
            });
        });
    }
    postCreatePost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { title, content, category } = req.body; //Requiriendo los datos desde la vista
            const userID = (_a = req.session.user) === null || _a === void 0 ? void 0 : _a.id; //Posterior revisión para validar mejor
            //const nowTime = new Date().toLocaleDateString('es-VE') //Uso de la clase Date, para la definición de la fecha de creación del post
            if (!userID) {
                return res.status(401).redirect('/session');
            }
            if (!title || !content || !category) {
                return res.status(400).send("Faltan datos obligatorios");
            }
            const db = yield (0, db_1.initializeDB)();
            try {
                const stmt = yield db.prepare(`INSERT INTO publicaciones (title, content, user_id, category_id) VALUES (?, ?, ?, ?)`);
                yield stmt.run(title, content, userID, category);
                yield stmt.finalize();
                res.status(201).redirect('/main');
            }
            catch (e) {
                console.error(e);
                res.status(500).send("Error al crear la publicación");
            }
        });
    }
}
exports.UserController = UserController;

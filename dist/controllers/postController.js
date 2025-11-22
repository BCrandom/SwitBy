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
exports.mostrarPost = mostrarPost;
const db_1 = require("../db");
const dbPromise = (0, db_1.initializeDB)();
function mostrarPost() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const db = yield dbPromise;
            const stmt = yield db.prepare(`
            SELECT * FROM publicaciones AS p 
            JOIN usuarios AS u ON p.user_id = u.id 
            ORDER BY creationDate DESC
            `);
            const posts = yield stmt.all();
            yield stmt.finalize();
            console.log("aqui se supone hay un post");
            return posts;
        }
        catch (error) {
            console.log("Ocurrio un error: ", error);
        }
    });
}

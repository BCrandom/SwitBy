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
function mostrarPost() {
    return __awaiter(this, void 0, void 0, function* () {
        const db = yield (0, db_1.initializeDB)();
        try {
            const query = `
            SELECT 
              p.id AS post_id,
              p.title,
              p.content,
              p.creationDate,
              p.updateDate,
              p.user_id,
              -- Datos del Autor (Desde Perfiles)
              perf.username AS author_name,
              perf.avatar_url AS author_avatar
            FROM publicaciones AS p 
            -- Unimos con perfiles usando el user_id
            INNER JOIN perfiles AS perf ON p.user_id = perf.user_id
            ORDER BY p.creationDate DESC
        `;
            const stmt = yield db.prepare(query);
            console.log(stmt);
            const posts = yield stmt.all();
            console.log("aqui se supone hay un post");
            yield stmt.finalize();
            return posts;
        }
        catch (error) {
            console.log("Ocurrio un error: ", error);
        }
    });
}

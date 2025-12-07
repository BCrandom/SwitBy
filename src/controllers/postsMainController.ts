import { initializeDB } from "../db";

export async function mostrarPost() {

    const db = await initializeDB();

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
        const stmt = await db.prepare(query);
        console.log(stmt)
        const posts = await stmt.all();
        console.log("aqui se supone hay un post");
        await stmt.finalize();
        return posts;
    } catch (error) {
        console.log("Ocurrio un error: ", error)
    }
}
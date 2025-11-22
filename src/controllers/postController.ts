import { initializeDB } from "../db";

const dbPromise = initializeDB();

export async function mostrarPost() {
    try {
        const db = await dbPromise
        const stmt = await db.prepare(`
            SELECT * FROM publicaciones AS p 
            JOIN usuarios AS u ON p.user_id = u.id 
            ORDER BY creationDate DESC
            `);
        const posts = await stmt.all();
        await stmt.finalize();
        console.log("aqui se supone hay un post");
        return posts;
    } catch (error) {
        console.log("Ocurrio un error: ", error)
    }
}
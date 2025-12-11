import { Request, Response } from 'express';
import { initializeDB } from "../db";

export class userThings {
    async mostrarPerfil(req: Request, res: Response) {
        const id = req.params.id;

        try {          
            const db = await initializeDB();

            const user = await db.get(
                "SELECT * FROM usuarios as u INNER JOIN perfiles p ON u.id = p.user_id WHERE id = ?", 
                [id]
            );

            if (!user) {
                return res.status(404).send("Usuario no encontrado");
            }

            res.render("users/profile", { user });

        } catch (error) {
            console.error(error);
            res.status(500).send("Error en la base de datos");
        }

    }

    async editarPerfil(req: Request, res: Response) {
        const { username, first_name, last_name, bio } = req.body
        const id = req.params.id;
        const db = await initializeDB();

        try {
            const stmt = await db.run(
                `UPDATE perfiles SET username = ?, first_name = ?, last_name = ?, bio = ? WHERE user_id = ?`,
                [username, first_name, last_name, bio, id]
            );
            if (stmt) {
                //res.send("Se actualizarion los datos bien");
                res.redirect(`/profile/${id}`);
            } else {
                res.status(404).send("No se encontró el usuario para actualizar");
            }
        } catch (error) {
            console.log("Ocurrio un error: ", error)
        }
    }
};
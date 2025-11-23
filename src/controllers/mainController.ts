import { Request, Response } from 'express';
import { initializeDB } from '../db';
import { mostrarPost } from "../controllers/postController";

export class UserController {

  async getMain (req: Request, res: Response) {
    try {
      const verPost = await mostrarPost();
      res.status(200).render("layouts/main", { 
        user: req.session.user,
        posts: verPost
      });
    } catch (error) {
      console.log("Error: ", error)
    }
  }

  async getCreatePost (req: Request, res: Response){
    res.status(200).render("post/create");
  }

  async postCreatePost (req: Request, res: Response){
    const { title, content, category } = req.body; //Requiriendo los datos desde la vista
    const userID = req.session.user?.id; //Posterior revisión para validar mejor

    if (!userID) {
      return res.status(401).send("Usuario no autenticado");
    }

    if (!title || !content || !category) {
      return res.status(400).send("Faltan datos obligatorios");
    }

    try {
      const db = await initializeDB();
      const stmt = await db.prepare(`INSERT INTO publicaciones (title, content, user_id, category_id) VALUES (?, ?, ?, ?)`);
      await stmt.run(title, content, userID, category);
      await stmt.finalize();

      res.status(201).send("Publicación creada exitosamente");
    } catch (e) {
      console.error(e);
      res.status(500).send("Error al crear la publicación");
    }
  }
}
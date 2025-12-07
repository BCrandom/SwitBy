import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { initializeDB } from '../db';

export class SessionController{
  async loginUser(req: Request, res: Response) {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Estos campos son Obligatorios!' });
    }

    const db = await initializeDB();

    try {
      //Validación del correo
    
      const user = await db.get(
        `SELECT 
            u.id, u.email, u.password, u.is_active,
            p.username, p.avatar_url,
            r.rol_name
          FROM usuarios u
          INNER JOIN perfiles p ON u.id = p.user_id
          INNER JOIN roles r ON u.rol_id = r.id
          WHERE u.email = ?`,
          [email]
        );
      //Verificar si el usuario existe y la contraseña es correcta
      if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(400).json({ message: 'Credenciales Incorrectos! D:' });
      }
      //Verificar si la cuenta está activa
      if (user.is_active === 0) {
        return res.status(403).json({ 
          message: 'Tu cuenta ha sido desactivada. Contacta al soporte.' 
        });
      }
      //Actualizar la última actividad del usuario
      await db.run(
        `UPDATE perfiles SET last_activity = datetime('now') WHERE user_id = ?`, [user.id]
      );

      //Crear la sesión del usuario
      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar_url,
        rol: user.rol_name
      }

      //Guardar la sesión en el navegador
      req.session.save((err) => {
          if (err) {
              console.error("Error al guardar sesión:", err);
              return res.status(500).json({ message: "Error de sesión" });
          }
          // Redirigir a la página principal
          res.redirect('/main');
        });

    } catch (e) {
      console.error("Error:", e);
      return res.status(500).json({ message: "Error con la validación de los campos" });
    }
  }
  //Cerrar Sesión manejado errores
  async logoutUser(req: Request, res: Response) {
    req.session.destroy((err) => {
    if (err) {
      console.error("Error:", err);
      return res.status(500).json({ message: "No se pudo cerrar sesión" });
    }
    res.redirect('/session');
  });
  }
}
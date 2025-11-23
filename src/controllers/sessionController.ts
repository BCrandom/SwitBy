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

    //Validación del correo y contraseña
    
    const user = await db.get(
      'SELECT * FROM usuarios WHERE email = ?', [email]
    );

    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(400).json({ message: 'Usuario o Contrseña, Incorrectos! D:' });
    }

    //Crear la sesión del usuario

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email
    }

    /* return res.status(200).json({ 
      message: 'Inicio de sesión exitoso :D', user: req.session.user 
    }); */

    res.redirect('/main')
    
  }

  async logoutUser(req: Request, res: Response) {
    req.session.destroy((err) => {
    if (err) {
      return console.log("Error:", err);
    }
    res.redirect('/session');
  });
  }
}
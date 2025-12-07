import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { initializeDB } from '../db';

export class RegisterController{
  async registerUser(req: Request, res: Response) {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Estos campos son Obligatorios!' });
    }

    const db = await initializeDB();

    //Validar existencia del usuario/////

    try {
      const revUser = await db.get(
        'SELECT * FROM usuarios WHERE email = ?', [email]
      );

      if (revUser) {
        return res.status(400).json({ message: 'El Correo ya existe :)' });
      }

      const revProfile = await db.get(
        'SELECT user_id FROM perfiles WHERE username = ?', [name]
      );

      if (revProfile) {
        return res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
      }

    ////VALIDACIÓN////////
    //A partir de acá, se viene el registro completo para las dos tablas

      await db.run('BEGIN TRANSACTION');

        try {

          //Hashear la contraseña y guardar el usuario en la base de datos
          const passwordHash = await bcrypt.hash(password, 10);

          const insertUserStmt = await db.prepare(
            'INSERT INTO usuarios (email, password) VALUES (?, ?)'
          );
          const result = await insertUserStmt.run(email, passwordHash);
          await insertUserStmt.finalize();

          //Acá, obtenemos el ID que ya está generado en la tabla de usuarios
          const userId = result.lastID;

          if (!userId) {
            throw new Error('Error al generar el ID del usuario');
          }

          //Al obtener el ID, procedemos a crear el perfil asociado
          const insertProfileStmt = await db.prepare(
            'INSERT INTO perfiles (user_id, username) VALUES (?, ?)'
          )
          await insertProfileStmt.run(userId, name);
          await insertProfileStmt.finalize();

          await db.run('COMMIT')
          
          return res.status(201).json({ 
            message: 'Usuario registrado correctamente :D', 
          });

        } catch (e) {
          console.error('Error durante la transacción:', e);
            
          // Deshacemos todo (Borra el usuario si se creó pero falló el perfil)
          await db.run('ROLLBACK'); 
            
          return res.status(500).json({ message: 'Error interno al registrar el usuario.' });
        }
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: 'Error de servidor' });
    }
  }
}
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
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

    async passwordSegurity(req: Request, res: Response) {
        const userId = req.session.user?.id;
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.render('users/authSegurity/passwordSegurity', { error: 'Todos los campos son obligatorios.', user: req.session.user });
        }

        if (newPassword !== confirmPassword) {
            return res.render('users/authSegurity/passwordSegurity', { error: 'Las contraseñas nuevas no coinciden.', user: req.session.user });
        }

        // Validación Regex en Backend (Seguridad extra)
        const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}/;
        if (!passwordRegex.test(newPassword)) {
            return res.render('users/authSegurity/passwordSegurity', { 
                error: 'La contraseña es muy débil. Debe incluir mayúsculas, minúsculas, números y símbolos.',
                user: req.session.user
            });
        }

        const db = await initializeDB();

        try {
            // Obtener hash actual
            const user = await db.get('SELECT password FROM usuarios WHERE id = ?', [userId]);

            if (!user) return res.redirect('/logout');

            // A. Verificar contraseña actual
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.render('users/authSegurity/passwordSegurity', { error: 'La contraseña actual es incorrecta.', user: req.session.user });
            }

            // B. Verificar que NO sea igual a la anterior
            const isSameAsBefore = await bcrypt.compare(newPassword, user.password);
            if (isSameAsBefore) {
                return res.render('users/authSegurity/passwordSegurity', { 
                    error: 'Por seguridad, la nueva contraseña no puede ser igual a la anterior.',
                    user: req.session.user
                });
            }

            // C. Hashear y Guardar
            const newHash = await bcrypt.hash(newPassword, 10);
            await db.run('UPDATE usuarios SET password = ? WHERE id = ?', [newHash, userId]);

            // Éxito:
            return res.render('users/authSegurity/passwordSegurity', { success: '¡Contraseña actualizada correctamente!', user: req.session.user });

        } catch (error) {
            console.error(error);
            return res.status(500).render('users/authSegurity/passwordSegurity', { error: 'Error del servidor.', user: req.session.user });
        }
    }

    async emailSegurity(req: Request, res: Response) {
        const userId = req.session.user?.id;
        const { currentEmail, newEmail, confirmEmail } = req.body;

        const viewPath = 'users/authSegurity/emailSegurity';

        // 1. Validaciones básicas
        if (!currentEmail || !newEmail || !confirmEmail) {
            return res.render(viewPath, { 
                error: 'Todos los campos son obligatorios.', 
                user: req.session.user 
            });
        }

        if (newEmail !== confirmEmail) {
            return res.render(viewPath, { 
                error: 'Los nuevos correos electrónicos no coinciden.', 
                user: req.session.user 
            });
        }

        // 2. Validación de formato Regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            return res.render(viewPath, { 
                error: 'El formato del nuevo correo no es válido.',
                user: req.session.user
            });
        }

        const db = await initializeDB();

        try {
            // Obtenemos el correo actual de la BD
            const user = await db.get('SELECT email FROM usuarios WHERE id = ?', [userId]);

            if (!user) return res.redirect('/auth/logout');

            if (currentEmail !== user.email) {
                return res.render(viewPath, { 
                    error: 'El correo electrónico actual no coincide con nuestros registros.', 
                    user: req.session.user 
                });
            }

            // Verificar que el nuevo sea diferente al actual
            if (newEmail === user.email) {
                return res.render(viewPath, { 
                    error: 'El nuevo correo debe ser diferente al actual.',
                    user: req.session.user
                });
            }

            // Verificar que el nuevo correo NO esté en uso por otra persona
            const emailTaken = await db.get('SELECT id FROM usuarios WHERE email = ?', [newEmail]);
            
            if (emailTaken) {
                return res.render(viewPath, { 
                    error: 'Este correo electrónico ya está registrado en otra cuenta.',
                    user: req.session.user
                });
            }

            // Actualizar en Base de Datos
            await db.run('UPDATE usuarios SET email = ? WHERE id = ?', [newEmail, userId]);

            // Actualizamos el dato en la cookie para que se refleje sin reloguear
            if (req.session.user) {
                req.session.user.email = newEmail;
            }

            return res.render(viewPath, { 
                success: '¡Correo electrónico actualizado correctamente!', 
                user: req.session.user 
            });

        } catch (error) {
            console.error("Error al cambiar email:", error);
            return res.status(500).render(viewPath, { 
                error: 'Error interno del servidor.', 
                user: req.session.user 
            });
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

    async eliminarPerfil(req: Request, res: Response) {
        const password = req.body.password
        const id = req.session.user?.id;
        const db = await initializeDB();

        if(!id){
            return res.status(400).redirect('/session');
        }

        if (!password) {
            
            return res.status(400).render(`users/deleteProfile`, { 
                error: 'Debes ingresar tu contraseña para confirmar.',
                user: req.session.user 
            });
        }

        try {
            //Validar la contraseña antes de borrar la cuenta

            const user = await db.get(
                'SELECT password FROM usuarios WHERE id = ?',
                [id]
            );

            if (!user) {
                return res.status(404).send("Usuario no encontrado en la base de datos");
            }

            if (!await bcrypt.compare(password, user.password)) {
                return res.render(`users/deleteProfile`, {
                    error: 'La contraseña es incorrecta. Inténtalo de nuevo.',
                    user: req.session.user
                });
            }else{
                await db.run(
                    `DELETE FROM usuarios WHERE id = ?`,
                    [id]
                );
                req.session.destroy((err) => {
                    if (err) console.error("Error al cerrar sesión tras borrar cuenta", err);
                    
                    // Borramos la cookie del lado del cliente
                    res.clearCookie('connect.sid'); 
                    
                    // Redirigimos al inicio o login con un parámetro de éxito (opcional)
                    res.redirect('/session?deleted=true');
                });

            }
            
        } catch (error) {
            console.error("Ocurrió un error al eliminar perfil: ", error);
            res.status(500).send("Error interno del servidor");
        }
    }
};
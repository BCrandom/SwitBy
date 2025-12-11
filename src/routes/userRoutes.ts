import { Request, Response, Router } from 'express';
import { userThings } from "../controllers/userController";

const router = Router();
const userController = new userThings();

router.get('/profile/:id', (req: Request, res: Response) => { 
    userController.mostrarPerfil(req, res);
});

router.get('/profile/editar/:id', (req: Request, res: Response) => {
    const id = req.params.id;
    res.render('users/editProfile', { id });
});

router.post('/profile/editar/:id', (req: Request, res: Response) => {
    userController.editarPerfil(req, res);
});

export default router;
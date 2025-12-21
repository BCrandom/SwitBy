import { Request, Response, Router } from 'express';
import { userThings } from "../controllers/userController";

const router = Router();
const userController = new userThings();

router.get('/profile/:id', (req: Request, res: Response) => { 
    userController.mostrarPerfil(req, res);
});

router.get('/profile/segurity/:id', (req: Request, res: Response) => { 
    const id = req.params.id;
    res.render('users/segurityProfile', { user: req.session.user });
});

router.get('/profile/segurity/password/:id', (req: Request, res: Response) => { 
    const id = req.params.id;
    res.render('users/authSegurity/passwordSegurity', { user: req.session.user });
});

router.post('/profile/segurity/password/:id', (req: Request, res: Response) => { 
    userController.passwordSegurity(req, res);
});

router.get('/profile/segurity/email/:id', (req: Request, res: Response) => { 
    const id = req.params.id;
    res.render('users/authSegurity/emailSegurity', { user: req.session.user });
});

router.post('/profile/segurity/email/:id', (req: Request, res: Response) => { 
    userController.emailSegurity(req, res);
});

router.get('/profile/edit/:id', (req: Request, res: Response) => {
    const id = req.params.id;
    res.render('users/editProfile', { id, user: req.session.user });
});

router.post('/profile/edit/:id', (req: Request, res: Response) => {
    userController.editarPerfil(req, res);
});

router.get('/profile/delete/:id', (req: Request, res: Response) => {
    const id = req.params.id;
    res.render('users/deleteProfile', { id, user: req.session.user });
});

router.post('/profile/delete/:id', (req: Request, res: Response) => {
    userController.eliminarPerfil(req, res);
});

export default router;
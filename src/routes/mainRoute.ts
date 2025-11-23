import { Request, Response, Router } from 'express';
import { UserController } from '../controllers/mainController';

const router = Router();
const mainController = new UserController();

router.get("/main", (req: Request, res: Response) => mainController.getMain(req, res));

router.get("/createPost", (req: Request, res: Response) => mainController.getCreatePost(req, res));

router.post("/createPost", (req: Request, res: Response) => mainController.postCreatePost(req, res));

export default router;
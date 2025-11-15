import { Router } from 'express';
import * as controller from '../controllers/authController';

const router = Router();
router.post('/register', controller.register);
router.post('/login', controller.login);
router.get('/me', controller.me);

export default router;

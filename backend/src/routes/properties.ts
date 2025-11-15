import { Router } from 'express';
import * as controller from '../controllers/propertyController';
import { requireAuth } from '../middlewares/auth';

const router = Router();
router.get('/', controller.listProperties);
router.get('/:id', controller.getProperty);
router.post('/', requireAuth, controller.createProperty);
router.put('/:id', requireAuth, controller.updateProperty);
router.delete('/:id', requireAuth, controller.deleteProperty);

export default router;

import { Router } from 'express';
import { ImageController } from '../controllers/imageController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Protect all image generation routes
router.use(protect);

router.post('/generate-greeting', ImageController.generateGreeting);
router.get('/', ImageController.getUserImages);

export default router;

import { Router } from 'express';
import { ImageController } from '../controllers/imageController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Protect all image generation routes
router.use(protect);

router.post('/generate-greeting', ImageController.generateGreeting);

export default router;

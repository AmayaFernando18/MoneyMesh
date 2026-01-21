import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { getAllCategories, createCategory, deleteCategory } from '../controllers/categoryController';

const router = Router();

router.use(authenticateToken);

router.get('/', getAllCategories);
router.post('/', createCategory);
router.delete('/:id', deleteCategory);

export default router;

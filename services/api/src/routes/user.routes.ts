import { Router, type IRouter } from 'express';
import { authenticate, requireAdmin, requireSelf } from '../middleware/auth.js';
import {
  createUser,
  listUsers,
  getUser,
  updateUser,
  deleteUser,
} from '../controllers/user.controller.js';

const router: IRouter = Router();

router.post('/', authenticate, requireAdmin, createUser);
router.get('/', authenticate, requireAdmin, listUsers);
router.delete('/:id', authenticate, requireAdmin, deleteUser);

router.get('/:id', authenticate, requireSelf, getUser);
router.put('/:id', authenticate, requireSelf, updateUser);

export default router;

import { Router, type IRouter } from 'express';
import {
  acceptInvite,
  cancelInvite,
  createInvite,
  getInviteByToken,
  listUserInvites,
  rejectInvite,
} from '../controllers/familyInvite.controller.js';
import { authenticate } from '../middleware/auth.js';

const router: IRouter = Router();

router.post('/invites', authenticate, createInvite);
router.get('/invites', authenticate, listUserInvites);
router.get('/invites/:token', getInviteByToken);
router.post('/invites/:token/accept', authenticate, acceptInvite);
router.post('/invites/:token/reject', authenticate, rejectInvite);
router.post('/invites/:token/cancel', authenticate, cancelInvite);

export default router;

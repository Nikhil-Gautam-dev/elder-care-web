import { Router, type IRouter } from 'express';
import { sendOtp, verifyOtp } from '../controllers/auth.controller.js';

const router: IRouter = Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

export default router;

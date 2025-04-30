import express from 'express';
import { sendOtp, verifyLoginOtp } from '../middleware/sendOtp.js';

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/verify-login-otp', verifyLoginOtp);

export default router;
import { Router, type IRouter } from 'express';
import { login, me } from '../controllers/auth.controller.js';
import {
  createDriver,
  getDriver,
  listDrivers,
  updateDriver,
} from '../controllers/driver.controller.js';
import {
  cancelRide,
  createRide,
  fareEstimate,
  getRide,
  listRides,
  updateRideStatus,
} from '../controllers/ride.controller.js';
import { requirePartner, requirePartnerOrStaff, requireStaff } from '../middleware/auth.js';

const router: IRouter = Router();

router.post('/auth/login', login);
router.get('/auth/me', requireStaff, me);

router.post('/rides/fare-estimate', requirePartnerOrStaff, fareEstimate);
router.post('/rides', requirePartner, createRide);
router.get('/rides', requirePartnerOrStaff, listRides);
router.get('/rides/:id', requirePartnerOrStaff, getRide);
router.post('/rides/:id/cancel', requirePartnerOrStaff, cancelRide);
router.patch('/rides/:id/status', requireStaff, updateRideStatus);

router.get('/drivers', requirePartnerOrStaff, listDrivers);
router.get('/drivers/:id', requirePartnerOrStaff, getDriver);
router.post('/drivers', requireStaff, createDriver);
router.patch('/drivers/:id', requireStaff, updateDriver);

export default router;

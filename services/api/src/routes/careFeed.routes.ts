import { Router, type IRouter } from 'express';
import { listNotifications, listRides } from '../controllers/careFeed.controller.js';
import { authenticate } from '../middleware/auth.js';

export const rideRoutes: IRouter = Router();
rideRoutes.get('/', authenticate, listRides);

export const notificationRoutes: IRouter = Router();
notificationRoutes.get('/', authenticate, listNotifications);

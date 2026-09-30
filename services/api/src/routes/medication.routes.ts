import { Router, type IRouter } from 'express';
import {
  createMedication,
  listMedications,
  listPharmacyOrders,
  stopMedication,
  updateMedication,
} from '../controllers/medication.controller.js';
import { authenticate } from '../middleware/auth.js';

export const medicationRoutes: IRouter = Router();

medicationRoutes.get('/', authenticate, listMedications);
medicationRoutes.post('/', authenticate, createMedication);
medicationRoutes.patch('/:id', authenticate, updateMedication);
medicationRoutes.delete('/:id', authenticate, stopMedication);

export const pharmacyOrderRoutes: IRouter = Router();

pharmacyOrderRoutes.get('/', authenticate, listPharmacyOrders);

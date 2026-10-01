import { Router, type IRouter } from 'express';
import {
  createMedication,
  listDoses,
  listMedications,
  listPharmacyOrders,
  logDose,
  stopMedication,
  undoLastDose,
  updateMedication,
} from '../controllers/medication.controller.js';
import { authenticate } from '../middleware/auth.js';

export const medicationRoutes: IRouter = Router();

medicationRoutes.get('/', authenticate, listMedications);
medicationRoutes.post('/', authenticate, createMedication);
medicationRoutes.patch('/:id', authenticate, updateMedication);
medicationRoutes.delete('/:id', authenticate, stopMedication);
medicationRoutes.get('/:id/doses', authenticate, listDoses);
medicationRoutes.post('/:id/doses', authenticate, logDose);
medicationRoutes.delete('/:id/doses/last', authenticate, undoLastDose);

export const pharmacyOrderRoutes: IRouter = Router();

pharmacyOrderRoutes.get('/', authenticate, listPharmacyOrders);

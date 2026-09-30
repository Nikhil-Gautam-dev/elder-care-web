import { Router, type IRouter } from 'express';
import { login, me } from '../controllers/auth.controller.js';
import {
  createCatalogItem,
  getCatalogItem,
  searchCatalog,
  updateCatalogItem,
  updateStock,
} from '../controllers/catalog.controller.js';
import {
  cancelOrder,
  createOrder,
  getOrder,
  listOrders,
  updateOrderStatus,
} from '../controllers/order.controller.js';
import {
  requirePartner,
  requirePartnerOrPharmacist,
  requirePharmacist,
} from '../middleware/auth.js';

const router: IRouter = Router();

router.post('/auth/login', login);
router.get('/auth/me', requirePharmacist, me);

router.get('/catalog', requirePartnerOrPharmacist, searchCatalog);
router.get('/catalog/search', requirePartnerOrPharmacist, searchCatalog);
router.get('/catalog/:id', requirePartnerOrPharmacist, getCatalogItem);
router.post('/catalog', requirePharmacist, createCatalogItem);
router.patch('/catalog/:id', requirePharmacist, updateCatalogItem);
router.patch('/catalog/:id/stock', requirePharmacist, updateStock);

router.post('/orders', requirePartner, createOrder);
router.get('/orders', requirePartnerOrPharmacist, listOrders);
router.get('/orders/:id', requirePartnerOrPharmacist, getOrder);
router.post('/orders/:id/cancel', requirePartner, cancelOrder);
router.patch('/orders/:id/status', requirePharmacist, updateOrderStatus);

export default router;

import type { Request, Response } from 'express';
import { createError } from '../middleware/errorHandler.js';
import { getNotificationsCollection, getRidesCollection } from '../models/user.model.js';
import { accessTo, requireCaller, toObjectId } from './medication.controller.js';

/** Rides the assistant booked for an elder (status is last known; refreshed when the assistant is asked). */
export async function listRides(req: Request, res: Response): Promise<void> {
  const caller = requireCaller(req);
  const elderId = req.query['elderId']
    ? toObjectId(String(req.query['elderId']), 'elderId')
    : caller.id;
  if (!(await accessTo(caller, elderId)).canView) {
    throw createError("You don't have access to this person's rides", 403);
  }

  const docs = await getRidesCollection()
    .find({ elderId })
    .sort({ createdAt: -1 })
    .limit(20)
    .toArray();
  res.json({
    success: true,
    data: {
      items: docs.map((d) => ({ ...d, _id: d._id.toString(), elderId: d.elderId.toString() })),
    },
  });
}

/** The caller's own family notifications, newest first. */
export async function listNotifications(req: Request, res: Response): Promise<void> {
  const caller = requireCaller(req);
  const docs = await getNotificationsCollection()
    .find({ recipientId: caller.id })
    .sort({ createdAt: -1 })
    .limit(30)
    .toArray();
  res.json({
    success: true,
    data: {
      items: docs.map((d) => ({
        _id: d._id.toString(),
        senderName: d.senderName,
        aboutUserId: d.aboutUserId.toString(),
        message: d.message,
        read: d.read,
        createdAt: d.createdAt,
      })),
    },
  });
}

import { PropertyHistoryAction, PropertyStatus } from '@prisma/client';
import prisma from './prisma.js';

export async function logPropertyHistory(params: {
  propertyId: string;
  userId?: string;
  action: PropertyHistoryAction;
  fromStatus?: PropertyStatus | null;
  toStatus?: PropertyStatus | null;
  note?: string;
}) {
  await prisma.propertyHistory.create({
    data: {
      propertyId: params.propertyId,
      userId: params.userId,
      action: params.action,
      fromStatus: params.fromStatus ?? undefined,
      toStatus: params.toStatus ?? undefined,
      note: params.note,
    },
  });
}

/**
 * Thin audit-log wrapper around Prisma AuditLog model.
 * Never throws — errors are caught and logged internally.
 */

import { prisma } from './prisma';
import { logger } from './logger';

export interface AuditParams {
  action:     string;               // e.g. 'admin.login', 'booking.created'
  actor?:     string;               // 'admin' | userId
  targetId?:  string;               // bookingId, userId being affected
  ip?:        string;
  userAgent?: string;
  details?:   Record<string, unknown>;
}

export async function audit(params: AuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action:    params.action,
        actor:     params.actor    ?? null,
        targetId:  params.targetId ?? null,
        ip:        params.ip       ?? null,
        userAgent: params.userAgent ?? null,
        details:   params.details ? JSON.stringify(params.details) : null,
      },
    });
  } catch (err) {
    // Audit failure must NEVER crash the calling request
    logger.error('audit', 'Failed to write audit log', {
      action: params.action,
      error:  err instanceof Error ? err.message : String(err),
    });
  }
}

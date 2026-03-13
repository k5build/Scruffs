import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/adminAuth';
import { audit } from '@/lib/audit';
import { logger } from '@/lib/logger';

const OTP_TTL_HOURS  = 24;
const AUDIT_TTL_DAYS = 90;

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? 'unknown';

  try {
    const otpCutoff   = new Date(Date.now() - OTP_TTL_HOURS  * 60 * 60 * 1000);
    const auditCutoff = new Date(Date.now() - AUDIT_TTL_DAYS * 24 * 60 * 60 * 1000);

    const [deletedOtps, deletedAudit] = await Promise.all([
      prisma.otpCode.deleteMany({ where: { createdAt: { lt: otpCutoff } } }),
      prisma.auditLog.deleteMany({ where: { createdAt: { lt: auditCutoff } } }),
    ]);

    logger.info('cleanup', 'Data retention cleanup completed', {
      deletedOtps:   deletedOtps.count,
      deletedAudit:  deletedAudit.count,
    });

    await audit({
      action:   'admin.cleanup',
      actor:    'admin',
      ip,
      details:  {
        deletedOtps:  deletedOtps.count,
        deletedAudit: deletedAudit.count,
        otpCutoffHours:  OTP_TTL_HOURS,
        auditCutoffDays: AUDIT_TTL_DAYS,
      },
    });

    return NextResponse.json({
      success:      true,
      deletedOtps:  deletedOtps.count,
      deletedAudit: deletedAudit.count,
    });
  } catch (err) {
    logger.error('cleanup', 'Data retention cleanup failed', {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}

import { db, schema } from '../../db';

export async function logAdminAction(params: {
  adminId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
}) {
  try {
    await db.insert(schema.auditLogs).values({
      adminId: params.adminId || null,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId || null,
      metadata: params.metadata || null,
      ipAddress: params.ipAddress || null,
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
}

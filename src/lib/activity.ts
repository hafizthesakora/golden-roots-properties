import { connectDB } from './db';
import { ActivityLog } from '@/models';

interface LogActivityParams {
  workspaceId: string;
  userId: string;
  userName: string;
  action: string;
  entityType: 'task' | 'lead' | 'project' | 'member';
  entityId: string;
  entityName: string;
  details?: Record<string, unknown>;
}

export async function logActivity(params: LogActivityParams) {
  try {
    await connectDB();
    await ActivityLog.create({
      workspaceId: params.workspaceId,
      userId: params.userId,
      userName: params.userName,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      entityName: params.entityName,
      details: params.details ? JSON.stringify(params.details) : undefined,
    });
  } catch {
    // Activity logging should never break the main operation
  }
}

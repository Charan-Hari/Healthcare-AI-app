import { prisma } from "@/lib/db/prisma";
import { AuditAction } from "@prisma/client";

type AuditInput = {
  userId?: string | null;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
  requestId?: string;
};

export async function writeAuditLog(input: AuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: input.userId ?? null,
        action: input.action,
        resource: input.resource,
        resourceId: input.resourceId,
        metadata: {
          ...(input.metadata ?? {}),
          requestId: input.requestId ?? null,
        },
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
      },
    });
  } catch (error) {
    console.error("Audit log write failed", error);
  }
}

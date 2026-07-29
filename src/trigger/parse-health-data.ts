import { task } from "@trigger.dev/sdk/v3";
import { prisma } from "@/lib/db/prisma";
import { parseHealthDocument } from "@/lib/parsers/health-parser";
import { HealthDataStatus, AuditAction } from "@prisma/client";
import { writeAuditLog } from "@/lib/audit/log";

type Payload = {
  recordId: string;
  userId: string;
};

export const parseHealthDataTask = task({
  id: "parse-health-data",
  run: async (payload: Payload) => {
    const record = await prisma.healthDataRecord.findUnique({
      where: { id: payload.recordId },
      select: {
        id: true,
        userId: true,
        originalUrl: true,
        parsedJson: true,
        status: true,
      },
    });

    if (!record) {
      await writeAuditLog({
        userId: payload.userId,
        action: AuditAction.DATA_ACCESS,
        resource: "health_data_parse",
        resourceId: payload.recordId,
        metadata: { error: "Record not found" },
      });
      return { ok: false, error: "Record not found" };
    }

    if (record.userId !== payload.userId) {
      await writeAuditLog({
        userId: payload.userId,
        action: AuditAction.DATA_ACCESS,
        resource: "health_data_parse",
        resourceId: payload.recordId,
        metadata: { error: "User mismatch" },
      });
      return { ok: false, error: "Forbidden" };
    }

    try {
      await prisma.healthDataRecord.update({
        where: { id: record.id },
        data: { status: HealthDataStatus.PARSING, errorMessage: null },
      });

      const existingJson = (record.parsedJson ?? {}) as Record<string, unknown>;
      const result = await parseHealthDocument({
        originalUrl: record.originalUrl,
        sourceType: typeof existingJson.sourceType === "string" ? existingJson.sourceType : undefined,
        notes: typeof existingJson.notes === "string" ? existingJson.notes : null,
      });

      await prisma.healthDataRecord.update({
        where: { id: record.id },
        data: {
          status: HealthDataStatus.COMPLETED,
          parsedJson: {
            ...existingJson,
            parser: {
              summary: result.summary,
              extractedFields: result.extractedFields,
              confidence: result.confidence,
            },
          },
        },
      });

      await writeAuditLog({
        userId: payload.userId,
        action: AuditAction.DATA_ACCESS,
        resource: "health_data_parse",
        resourceId: record.id,
        metadata: { status: "COMPLETED" },
      });

      return { ok: true, recordId: record.id };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown parse error";

      await prisma.healthDataRecord.update({
        where: { id: record.id },
        data: {
          status: HealthDataStatus.FAILED,
          errorMessage: message,
        },
      });

      await writeAuditLog({
        userId: payload.userId,
        action: AuditAction.DATA_ACCESS,
        resource: "health_data_parse",
        resourceId: record.id,
        metadata: { status: "FAILED", message },
      });

      return { ok: false, error: message };
    }
  },
});

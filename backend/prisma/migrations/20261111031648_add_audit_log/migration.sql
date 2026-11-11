-- Add deletedAt columns to funcionarios and contratos
ALTER TABLE funcionarios ADD COLUMN deletedAt TIMESTAMP(3);
ALTER TABLE contratos ADD COLUMN deletedAt TIMESTAMP(3);

-- Create audit_logs table
CREATE TABLE audit_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    entityType TEXT NOT NULL,
    entityId TEXT NOT NULL,
    action TEXT NOT NULL,
    oldData JSONB,
    newData JSONB,
    userIp TEXT,
    userAgent TEXT,
    createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT audit_logs_pkey PRIMARY KEY (id)
);

-- Create indexes
CREATE INDEX audit_logs_entityType_entityId_idx ON audit_logs(entityType, entityId);
CREATE INDEX audit_logs_createdAt_idx ON audit_logs(createdAt);

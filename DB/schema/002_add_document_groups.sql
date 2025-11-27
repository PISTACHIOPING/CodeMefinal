-- Add document_groups table and group_id FK on documents
-- Safe guards to avoid duplicate creation if rerun.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'document_groups'
    ) THEN
        CREATE TABLE document_groups (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX idx_document_groups_user_id ON document_groups(user_id);
    END IF;
END
$$ LANGUAGE plpgsql;

-- Add group_id column on documents if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'documents' AND column_name = 'group_id'
    ) THEN
        ALTER TABLE documents
            ADD COLUMN group_id UUID REFERENCES document_groups(id) ON DELETE SET NULL;
        CREATE INDEX idx_documents_group_id ON documents(group_id);
    END IF;
END
$$ LANGUAGE plpgsql;

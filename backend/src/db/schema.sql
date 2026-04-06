-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Table for storing document chunks and their embeddings
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    embedding vector(1024), -- Dimension for BGE-M3
    metadata JSONB,
    fts_tokens tsvector,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for Vector Similarity Search (HNSW)
-- Using cosine distance (<=>) which is common for embeddings
CREATE INDEX IF NOT EXISTS documents_embedding_idx ON documents 
USING hnsw (embedding vector_cosine_ops);

-- Index for Full-Text Search
CREATE INDEX IF NOT EXISTS documents_fts_idx ON documents USING GIN (fts_tokens);

-- Trigger to automatically update fts_tokens when content is updated
-- This ensures keyword search is always in sync with content
CREATE OR REPLACE FUNCTION documents_fts_trigger() RETURNS trigger AS $$
begin
  new.fts_tokens := to_tsvector('english', new.content);
  return new;
end
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_documents_fts ON documents;
CREATE TRIGGER trg_documents_fts BEFORE INSERT OR UPDATE
ON documents FOR EACH ROW EXECUTE FUNCTION documents_fts_trigger();

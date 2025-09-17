-- Table: public.conversation_metricas

-- DROP TABLE IF EXISTS public.conversation_metricas;

CREATE TABLE IF NOT EXISTS public.conversation_metricas
(
    id integer NOT NULL DEFAULT nextval('conversation_metricas_id_seq'::regclass),
    messageid character varying(50) COLLATE pg_catalog."default",
    respuesta text COLLATE pg_catalog."default",
    metricas_cliente text COLLATE pg_catalog."default",
    interes_cliente text COLLATE pg_catalog."default",
    estado_habilitacion_notificacion boolean,
    etapa_embudo character varying(10) COLLATE pg_catalog."default",
    consulta_reformulada text COLLATE pg_catalog."default",
    confianza_reformulada character varying(10) COLLATE pg_catalog."default",
    asistente_informacion text COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT conversation_metricas_pkey PRIMARY KEY (id),
    CONSTRAINT conversation_metricas_messageid_fkey FOREIGN KEY (messageid)
        REFERENCES public.conversations_log (messageid) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

TABLESPACE pg_default;

-- Add column for embeddings storage
ALTER TABLE IF EXISTS public.conversation_metricas
    ADD COLUMN IF NOT EXISTS consulta_reformulada_embedding vector(1536);

-- Add index for vector similarity searches (optional but recommended)
CREATE INDEX IF NOT EXISTS consulta_reformulada_embedding_idx 
    ON public.conversation_metricas 
    USING ivfflat (consulta_reformulada_embedding vector_cosine_ops)
    WITH (lists = 100);

ALTER TABLE IF EXISTS public.conversation_metricas
    OWNER to postgres;
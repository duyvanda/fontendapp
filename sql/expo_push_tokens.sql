-- Migration script cho Database đang chạy:
-- ALTER TABLE public.expo_push_tokens DROP CONSTRAINT IF EXISTS expo_push_tokens_manv_platform_key;
-- ALTER TABLE public.expo_push_tokens DROP CONSTRAINT IF EXISTS expo_push_tokens_pkey;
-- ALTER TABLE public.expo_push_tokens ADD CONSTRAINT expo_push_tokens_pkey PRIMARY KEY (manv, token);

CREATE TABLE IF NOT EXISTS public.expo_push_tokens
(
    manv character varying(50) COLLATE pg_catalog."default" NOT NULL,
    token character varying(255) COLLATE pg_catalog."default" NOT NULL,
    platform character varying(20) COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    device_info jsonb,
    CONSTRAINT expo_push_tokens_pkey PRIMARY KEY (manv, token),
    CONSTRAINT expo_push_tokens_token_key UNIQUE (token)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.expo_push_tokens
    OWNER to subiteam;
-- Index: idx_expo_push_tokens_manv

-- DROP INDEX IF EXISTS public.idx_expo_push_tokens_manv;

CREATE INDEX IF NOT EXISTS idx_expo_push_tokens_manv
    ON public.expo_push_tokens USING btree
    (manv COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;
/*
  Script khởi tạo bảng và Stored Function kiểm tra phiên bản ứng dụng Mobile (iOS / Android)
  Được thiết kế chuẩn theo hướng dẫn D:\ai-docs\postgres\write_get_function.md

  URL get API:
  https://bi.meraplion.com/local/get_data/expo_check_app_version/?platform=android
*/

-- 1. DDL Bảng cấu hình phiên bản app
CREATE TABLE IF NOT EXISTS public.expo_app_version
(
    platform character varying(20) NOT NULL, -- 'android' hoặc 'ios'
    latest_version character varying(50) NOT NULL DEFAULT '1.0.1',
    is_force_update boolean NOT NULL DEFAULT false,
    update_url character varying(255),
    release_notes text,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT expo_app_version_pkey PRIMARY KEY (platform)
);

ALTER TABLE IF EXISTS public.expo_app_version OWNER to subiteam;

-- Bổ sung DROP COLUMN IF EXISTS để dọn dẹp sạch sẽ cột min_required_version cũ (nếu DB đã tồn tại từ trước)
ALTER TABLE IF EXISTS public.expo_app_version DROP COLUMN IF EXISTS min_required_version;

-- Chèn dữ liệu khởi tạo mặc định (bản 1.0.1)
INSERT INTO public.expo_app_version (platform, latest_version, is_force_update, update_url, release_notes)
VALUES 
  ('android', '1.0.1', false, 'https://play.google.com/store/apps/details?id=com.duyvanda.biportal', 'Phiên bản mới cập nhật hiệu năng và tính năng mới'),
  ('ios', '1.0.1', false, 'https://apps.apple.com/vn/app/bi-portal/id6790836391', 'Phiên bản mới cập nhật hiệu năng và tính năng mới')
ON CONFLICT (platform) DO UPDATE SET
  update_url = EXCLUDED.update_url;


-- 2. Stored Function expo_check_app_version(jsonb)
CREATE OR REPLACE FUNCTION public.expo_check_app_version(url_param jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    p_platform text := LOWER(COALESCE(url_param->>'platform', 'android'));
BEGIN
    RETURN (
        WITH rows_data AS (
            SELECT 
                platform,
                latest_version,
                is_force_update,
                COALESCE(update_url, '') AS update_url,
                COALESCE(release_notes, '') AS release_notes
            FROM public.expo_app_version
            WHERE platform = p_platform
            LIMIT 1
        )
        SELECT jsonb_build_object(
            'status', 'ok',
            'rows_data', COALESCE((SELECT jsonb_agg(f) FROM rows_data f), '[]'::jsonb)
        )
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'status', 'fail',
            'error_message', SQLERRM
        );
END;
$$;

ALTER FUNCTION public.expo_check_app_version(jsonb) OWNER TO subiteam;

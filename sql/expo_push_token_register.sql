-- FUNCTION: public.expo_push_token_register(jsonb)

-- DROP FUNCTION IF EXISTS public.expo_push_token_register(jsonb);

CREATE OR REPLACE FUNCTION public.expo_push_token_register(
	p_data jsonb)
    RETURNS jsonb
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
    v_row jsonb;
    v_id VARCHAR;
    v_token VARCHAR;
    v_platform VARCHAR;
    v_device_info JSONB;
BEGIN
    -- Chỉ lấy object đầu tiên trong mảng
    v_row := p_data->0;
    
    v_id := COALESCE(v_row->>'manv', v_row->>'id');
    v_token := v_row->>'token';
    v_platform := v_row->>'platform';
    v_device_info := COALESCE(v_row->'device_info', v_row);

    IF v_id IS NULL OR v_token IS NULL THEN
        RETURN jsonb_build_object('status', 'fail', 'error_message', 'Thiếu manv/id hoặc token');
    END IF;

    -- Xóa token cũ nếu nó đang được gắn cho user khác (đăng xuất/đổi tài khoản trên cùng 1 máy)
    DELETE FROM expo_push_tokens WHERE token = v_token AND manv != v_id;

    -- Upsert logic: Mỗi user (manv) chỉ có 1 token mới nhất. Cập nhật nếu user đã có token cũ.
    INSERT INTO expo_push_tokens (manv, token, platform, device_info, updated_at)
    VALUES (v_id, v_token, v_platform, v_device_info, CURRENT_TIMESTAMP)
    ON CONFLICT (manv) 
    DO UPDATE SET 
        token = EXCLUDED.token,
        platform = EXCLUDED.platform,
        device_info = EXCLUDED.device_info,
        updated_at = CURRENT_TIMESTAMP;

    RETURN jsonb_build_object('status', 'success', 'message', 'Token đã được lưu');
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('status', 'fail', 'error_message', SQLERRM);
END;
$BODY$;

ALTER FUNCTION public.expo_push_token_register(jsonb)
    OWNER TO subiteam;

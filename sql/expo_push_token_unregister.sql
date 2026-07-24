-- FUNCTION: public.expo_push_token_unregister(jsonb)

-- DROP FUNCTION IF EXISTS public.expo_push_token_unregister(jsonb);

CREATE OR REPLACE FUNCTION public.expo_push_token_unregister(
	p_data jsonb)
    RETURNS jsonb
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
    v_row jsonb;
    v_token VARCHAR;
BEGIN
    v_row := p_data->0;
    v_token := v_row->>'token';

    IF v_token IS NOT NULL THEN
        DELETE FROM expo_push_tokens WHERE token = v_token;
    END IF;

    RETURN jsonb_build_object('status', 'success', 'message', 'Token đã được xóa');
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('status', 'fail', 'error_message', SQLERRM);
END;
$BODY$;

ALTER FUNCTION public.expo_push_token_unregister(jsonb)
    OWNER TO subiteam;

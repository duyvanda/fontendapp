-- FUNCTION: public.get_report_phan_quyen_tong_hop(jsonb)

-- DROP FUNCTION IF EXISTS public.get_report_phan_quyen_tong_hop(jsonb);

CREATE OR REPLACE FUNCTION public.get_report_phan_quyen_tong_hop(
	url_param jsonb)
    RETURNS jsonb
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
/* Lấy danh sách phân quyền tổng hợp report theo mã nhân viên (manv)
   kèm thông tin yêu thích, tags từ report_user_prefs và thông tin nhân sự từ s.d_hr_dsns
   Đồng thời bổ sung danh sách câu hỏi gợi ý vào trong user_hr_info.
*/
DECLARE
    p_manv text := url_param->>'manv';
    v_user_hr_info jsonb;
    v_cloud_questions jsonb;
	p_is_app text := url_param->>'is_app'; -- Lấy tham số is_app từ frontend gửi lên
BEGIN
    -- 1. Khởi tạo danh sách 8 câu hỏi gợi ý cho Cloud Assist
    v_cloud_questions := '[
        {"stt": 1, "question": "Xuất EXCEL các đơn treo"},
        {"stt": 2, "question": "Tôi gửi file EXCEL bạn điền hộ sales có VAT và chưa VAT nhe"},
        {"stt": 3, "question": "Dự báo AI sản lượng osla trong 6 tháng tới"},
        {"stt": 4, "question": "Cho tôi tồn kho realtime của mã SP: OH031"},
        {"stt": 5, "question": "Tình hình bán hàng MTD với cùng kỳ theo kênh"},
        {"stt": 6, "question": "Khách hàng nào 3 tháng rồi chưa mua lại hàng"},
        {"stt": 7, "question": "Tháng này khách hàng nào hết hạn GPP"},
        {"stt": 8, "question": "Ai có tiến độ KPI doanh số cao nhất tháng này"}
    ]'::jsonb;

    -- 2. Lấy thông tin nhân sự từ bảng s.d_hr_dsns
    SELECT jsonb_build_object(
        'status', 'ok',
        'manv', msnvcsmmoi,
		'hovatenfullname', hovatenfullname,
        'chucdanhengtitle', chucdanhengtitle,
        'chucdanhengtitlesum', chucdanhengtitlesum,
        'phongdeptsummary', phongdeptsummary,
        'supervisor', qltt,
        'director', managerassistantassociateasm,
        'show_cloud_assist', (
            msnvcsmmoi IN ('MR2523', 'MR3953','MR1077', 'MR2568','MR1682', 'MR2385', 'AM0000', 'DEMO_APPLE') 
            OR p_is_app = '1' -- Auto mở cloud assist nếu is_app = '1'
        )		--OR phongdeptsummary = 'IT'
    ) INTO v_user_hr_info
    FROM s.d_hr_dsns
    WHERE msnvcsmmoi = p_manv;

    -- Nếu không tìm thấy thông tin nhân sự, khởi tạo object fail cơ bản (hoặc mock cho tài khoản AM0000, DEMO_APPLE)
    IF v_user_hr_info IS NULL THEN
        IF p_manv IN ('AM0000', 'DEMO_APPLE') THEN
            v_user_hr_info := jsonb_build_object(
                'status', 'ok',
                'manv', p_manv,
                'hovatenfullname', 'TESTER',
                'chucdanhengtitle', 'TESTER',
                'chucdanhengtitlesum', 'TESTER',
                'phongdeptsummary', 'TESTER',
                'supervisor', 'TESTER',
                'director', 'TESTER',
                'show_cloud_assist', true
            );
        ELSE
            v_user_hr_info := jsonb_build_object(
                'status', 'fail',
                'manv', p_manv
            );
        END IF;
    END IF;

    -- Gộp danh sách câu hỏi gợi ý vào object v_user_hr_info
    v_user_hr_info := v_user_hr_info || jsonb_build_object('cloud_assist_questions', v_cloud_questions);

    -- 3. Trả về kết quả phân quyền báo cáo cùng thông tin nhân sự (đã bao gồm câu hỏi)
    RETURN (
        WITH rows_data AS (
            SELECT 
                r.id,
                r.tenreport,
                r.id_mb,
                r.link_report,
                r.manv,
                r.type,
                r.vw,
                r.param,
                r.param_mb,
                r.stt,
                COALESCE(p.yeu_thich, 0) AS yeu_thich,
                COALESCE(p.tags, '[]'::jsonb) AS tags
                
            FROM public.report_phan_quyen_tong_hop r
            LEFT JOIN public.report_user_prefs p 
                ON r.manv = p.manv AND r.stt = p.report_id and p.manv = p_manv
            WHERE r.manv = p_manv 
        )
        SELECT jsonb_build_object(
            'status', 'ok',
            'user_hr_info', v_user_hr_info,
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
$BODY$;

ALTER FUNCTION public.get_report_phan_quyen_tong_hop(jsonb)
    OWNER TO subiteam;

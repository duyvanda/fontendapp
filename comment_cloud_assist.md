Để tạm tắt chức năng Trợ lý ảo BIRA (thường là để tránh lỗi thư viện Camera trên trình duyệt Web), bạn chỉ cần comment thẻ <CloudAssist ... /> và dòng import ở 2 file sau đây:

1. Trong file src/app/(tabs)/_layout.tsx:

Ở gần đầu file: Comment dòng import CloudAssist from '@/components/CloudAssist';
Ở gần cuối file: Comment dòng <CloudAssist visible={show_bira} onClose={() => set_show_bira(false)} />
2. Trong file src/components/CustomHeader.tsx:

Ở gần đầu file: Comment dòng import CloudAssist from '@/components/CloudAssist';
Ở gần cuối file: Comment dòng <CloudAssist visible={show_bira} onClose={() => set_show_bira(false)} />
Nếu bạn muốn mình comment tự động giúp bạn luôn thì cứ nhắn nhé!
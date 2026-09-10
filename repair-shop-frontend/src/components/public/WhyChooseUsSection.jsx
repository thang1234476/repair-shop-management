import React from 'react';
import {
  FileProtectOutlined,
  EyeOutlined,
  TeamOutlined,
  BellOutlined
} from '@ant-design/icons';

const REASONS = [
  {
    icon: <FileProtectOutlined />,
    title: 'Báo Giá Minh Bạch',
    desc: 'Kiểm tra lỗi chi tiết, báo giá rõ ràng gồm chi phí linh kiện và công thợ trước khi làm. Khách hàng đồng ý mới tiến hành sửa.',
  },
  {
    icon: <EyeOutlined />,
    title: 'Theo Dõi Tiến Độ Trực Tuyến',
    desc: 'Không cần gọi điện thoại hỏi thăm. Chỉ cần nhập mã phiếu để xem thiết bị đang ở giai đoạn nào: kiểm tra, chờ linh kiện hay đã xong.',
  },
  {
    icon: <TeamOutlined />,
    title: 'Kỹ Thuật Viên Chuyên Nghiệp',
    desc: 'Đội ngũ kỹ thuật viên được đào tạo bài bản, tay nghề cao với trang thiết bị đo đạc vi mạch hiện đại và linh kiện nhập khẩu chính hãng.',
  },
  {
    icon: <BellOutlined />,
    title: 'Thông Báo Trạng Thái Realtime',
    desc: 'Nhận thông báo ngay lập tức qua hệ thống khi có kết quả chẩn đoán, báo giá mới hoặc khi thiết bị đã được sửa chữa hoàn tất.',
  },
];

export default function WhyChooseUsSection() {
  return (
    <section className="pub-section" id="why-us">
      <div className="pub-container">
        <div className="pub-section-header">
          <span className="pub-section-badge">UY TÍN & TRÁCH NHIỆM</span>
          <h2 className="pub-section-title">Tại Sao Nên Chọn RepairShop?</h2>
          <p className="pub-section-desc">
            Chúng tôi xây dựng quy trình sửa chữa theo chuẩn minh bạch, loại bỏ hoàn toàn nỗi lo tráo đổi linh kiện hay phát sinh chi phí vô lý.
          </p>
        </div>

        <div className="pub-why-grid">
          {REASONS.map((item, idx) => (
            <div key={idx} className="pub-why-card">
              <div className="pub-why-icon">
                {item.icon}
              </div>
              <h3 className="pub-why-title">{item.title}</h3>
              <p className="pub-why-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

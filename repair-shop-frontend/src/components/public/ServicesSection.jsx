import React from 'react';
import {
  LaptopOutlined,
  DesktopOutlined,
  MobileOutlined,
  ClearOutlined,
  RocketOutlined,
  SearchOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';

const SERVICES = [
  {
    icon: <LaptopOutlined />,
    title: 'Sửa Chữa Laptop',
    desc: 'Xử lý lỗi mất nguồn, màn hình sọc/vỡ, bàn phím liệt, lỗi bản lề, đóng chip VGA chuyên sâu cho Dell, Asus, HP, Lenovo, MacBook...',
  },
  {
    icon: <DesktopOutlined />,
    title: 'Sửa Chữa PC & Máy Bàn',
    desc: 'Khắc phục sự cố không lên hình, lỗi mainboard, nguồn sụt áp, card đồ họa, tối ưu luồng gió và lắp ráp máy trạm, PC Gaming.',
  },
  {
    icon: <MobileOutlined />,
    title: 'Sửa Chữa Điện Thoại',
    desc: 'Thay màn hình, ép kính, thay pin dung lượng cao, xử lý IC sạc, camera, loa trong/ngoài cho iPhone, Samsung, Xiaomi, Oppo...',
  },
  {
    icon: <ClearOutlined />,
    title: 'Vệ Sinh & Bảo Dưỡng',
    desc: 'Làm sạch bụi bẩn chuyên sâu toàn diện, thay keo tản nhiệt gốm/kim loại lỏng cao cấp giúp giảm 15-20°C nhiệt độ thiết bị.',
  },
  {
    icon: <RocketOutlined />,
    title: 'Nâng Cấp Phần Cứng',
    desc: 'Tư vấn nâng cấp RAM, ổ cứng SSD NVMe tốc độ cao, CPU, card đồ họa giúp tăng tốc máy tính hoạt động mượt mà vượt bậc.',
  },
  {
    icon: <SearchOutlined />,
    title: 'Kiểm Tra & Chẩn Đoán',
    desc: 'Đo đạc kiểm tra vi mạch, bắt đúng bệnh và chẩn đoán toàn diện phần cứng hoàn toàn miễn phí trước khi khách hàng quyết định.',
  },
];

export default function ServicesSection({ onOpenBooking }) {
  return (
    <section className="pub-section pub-section-alt" id="services">
      <div className="pub-container">
        <div className="pub-section-header">
          <span className="pub-section-badge">DỊCH VỤ CỦA CHÚNG TÔI</span>
          <h2 className="pub-section-title">Giải Pháp Toàn Diện Cho Thiết Bị Của Bạn</h2>
          <p className="pub-section-desc">
            Với trang thiết bị kỹ thuật hiện đại cùng đội ngũ kỹ thuật viên giàu kinh nghiệm, chúng tôi cam kết mang lại sự an tâm tuyệt đối.
          </p>
        </div>

        <div className="pub-services-grid">
          {SERVICES.map((item, idx) => (
            <div key={idx} className="pub-service-card">
              <div className="pub-service-icon">
                {item.icon}
              </div>
              <h3 className="pub-service-title">{item.title}</h3>
              <p className="pub-service-desc">{item.desc}</p>
              <div
                className="pub-service-link"
                onClick={onOpenBooking}
              >
                Đặt dịch vụ ngay <ArrowRightOutlined style={{ fontSize: 12 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

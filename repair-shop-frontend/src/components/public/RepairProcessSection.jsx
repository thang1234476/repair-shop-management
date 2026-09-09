import React from 'react';
import {
  InboxOutlined,
  SearchOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ToolOutlined,
  SmileOutlined,
  GiftOutlined
} from '@ant-design/icons';

const PROCESS_STEPS = [
  {
    step: '01',
    name: 'Tiếp Nhận',
    desc: 'Lập phiếu, ghi nhận hiện trạng & serial',
    icon: <InboxOutlined />,
  },
  {
    step: '02',
    name: 'Kiểm Tra',
    desc: 'Đo đạc vi mạch & chẩn đoán lỗi',
    icon: <SearchOutlined />,
  },
  {
    step: '03',
    name: 'Báo Giá',
    desc: 'Thông báo chi phí & thời gian sửa',
    icon: <DollarOutlined />,
  },
  {
    step: '04',
    name: 'Xác Nhận',
    desc: 'Khách hàng duyệt giá trực tuyến',
    icon: <CheckCircleOutlined />,
  },
  {
    step: '05',
    name: 'Sửa Chữa',
    desc: 'Tiến hành thay thế linh kiện',
    icon: <ToolOutlined />,
  },
  {
    step: '06',
    name: 'Hoàn Thành',
    desc: 'KCS test kiểm thử chức năng',
    icon: <SmileOutlined />,
  },
  {
    step: '07',
    name: 'Bàn Giao',
    desc: 'Giao máy kèm tem bảo hành',
    icon: <GiftOutlined />,
  },
];

export default function RepairProcessSection() {
  return (
    <section className="pub-section pub-section-alt" id="process">
      <div className="pub-container">
        <div className="pub-section-header">
          <span className="pub-section-badge">QUY TRÌNH CHUẨN HÓA</span>
          <h2 className="pub-section-title">Quy Trình Sửa Chữa 7 Bước Minh Bạch</h2>
          <p className="pub-section-desc">
            Khách hàng luôn nắm rõ từng giai đoạn xử lý thiết bị của mình mà không cần lo lắng hay chờ đợi mơ hồ.
          </p>
        </div>

        <div className="pub-process-grid">
          {PROCESS_STEPS.map((item, idx) => (
            <div key={idx} className="pub-process-step">
              <span className="pub-step-num">BƯỚC {item.step}</span>
              <div className="pub-step-icon">
                {item.icon}
              </div>
              <h4 className="pub-step-name">{item.name}</h4>
              <p className="pub-step-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

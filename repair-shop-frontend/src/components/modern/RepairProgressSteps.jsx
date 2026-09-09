import React from 'react';
import { Steps, Tooltip } from 'antd';
import {
  InboxOutlined,
  SearchOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ToolOutlined,
  SmileOutlined,
  GiftOutlined,
} from '@ant-design/icons';

const STEPS = [
  { key: 'RECEIVED',   label: 'Tiếp nhận',       sub: 'Đã tiếp nhận thiết bị',    icon: <InboxOutlined /> },
  { key: 'DIAGNOSING', label: 'Kiểm tra',         sub: 'Đang chẩn đoán lỗi',       icon: <SearchOutlined /> },
  { key: 'QUOTED',     label: 'Báo giá',          sub: 'Đã có báo giá sửa chữa',   icon: <DollarOutlined /> },
  { key: 'APPROVED',   label: 'Đã xác nhận',      sub: 'Khách hàng đồng ý sửa',    icon: <CheckCircleOutlined /> },
  { key: 'REPAIRING',  label: 'Đang sửa',         sub: 'Kỹ thuật viên đang sửa',   icon: <ToolOutlined /> },
  { key: 'COMPLETED',  label: 'Đã sửa xong',      sub: 'Thiết bị đã hoàn tất',     icon: <SmileOutlined /> },
  { key: 'DELIVERED',  label: 'Đã bàn giao',      sub: 'Đã trả thiết bị cho khách', icon: <GiftOutlined /> },
];

const STATUS_ORDER = {
  RECEIVED: 0, DIAGNOSING: 1, QUOTED: 2, APPROVED: 3,
  REPAIRING: 4, COMPLETED: 5, DELIVERED: 6,
};

/**
 * RepairProgressSteps — Hiển thị tiến trình sửa chữa theo dạng Steps
 * @param {string} status - Trạng thái hiện tại (enum từ backend)
 * @param {boolean} compact - Thu gọn (dùng trong TicketCard)
 * @param {boolean} vertical - Hiển thị vertical (dùng trong mobile)
 */
export default function RepairProgressSteps({ status, compact = false, vertical = false }) {
  const currentIndex = STATUS_ORDER[status] ?? 0;

  const items = STEPS.map((step, idx) => {
    let stepStatus = 'wait';
    if (idx < currentIndex) stepStatus = 'finish';
    else if (idx === currentIndex) stepStatus = 'process';

    return {
      key: step.key,
      title: compact ? undefined : step.label,
      description: compact || vertical ? undefined : (idx === currentIndex ? step.sub : undefined),
      icon: compact ? (
        <Tooltip title={step.label}>
          <span style={{
            fontSize: 14,
            color: idx < currentIndex ? '#10b981' : idx === currentIndex ? '#4f46e5' : '#d1d5db',
          }}>
            {step.icon}
          </span>
        </Tooltip>
      ) : step.icon,
      status: stepStatus,
    };
  });

  if (compact) {
    return (
      <Steps
        size="small"
        current={currentIndex}
        items={items}
        style={{ marginTop: 12 }}
      />
    );
  }

  return (
    <div className="mc-progress-steps">
      <Steps
        direction={vertical ? 'vertical' : 'horizontal'}
        current={currentIndex}
        responsive={false}
        items={STEPS.map((step, idx) => ({
          key: step.key,
          title: <span style={{ fontSize: vertical ? 14 : 13, fontWeight: idx === currentIndex ? 600 : 400 }}>{step.label}</span>,
          description: !compact && idx === currentIndex
            ? <span style={{ fontSize: 12, color: '#6b7280' }}>{step.sub}</span>
            : undefined,
          icon: (
            <span style={{
              color: idx < currentIndex ? '#10b981' : idx === currentIndex ? '#4f46e5' : '#9ca3af',
              fontSize: 16,
            }}>
              {step.icon}
            </span>
          ),
          status: idx < currentIndex ? 'finish' : idx === currentIndex ? 'process' : 'wait',
        }))}
        style={{ '--steps-icon-size': '32px' }}
      />
    </div>
  );
}

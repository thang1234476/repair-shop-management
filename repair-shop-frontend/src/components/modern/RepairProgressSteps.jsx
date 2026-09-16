import React from 'react';
import { Steps, Tooltip, Alert, Tag } from 'antd';
import {
  InboxOutlined,
  SearchOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ToolOutlined,
  SmileOutlined,
  GiftOutlined,
  CloseCircleOutlined,
  StopOutlined,
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
  if (status === 'CANCELLED' || status === 'REJECTED') {
    const isCancelled = status === 'CANCELLED';
    const title = isCancelled ? 'Phiếu đã hủy' : 'Đã từ chối báo giá';
    const desc = isCancelled
      ? 'Phiếu sửa chữa này đã bị hủy. Tiến trình xử lý đã dừng lại.'
      : 'Báo giá sửa chữa đã bị từ chối. Vui lòng liên hệ trung tâm để được hỗ trợ lại.';

    if (compact) {
      return (
        <div style={{
          marginTop: 10,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 10px',
          borderRadius: 6,
          backgroundColor: isCancelled ? '#fef2f2' : '#fffbeb',
          border: `1px solid ${isCancelled ? '#fecaca' : '#fde68a'}`,
          color: isCancelled ? '#dc2626' : '#d97706',
          fontSize: 12,
          fontWeight: 600,
        }}>
          {isCancelled ? <CloseCircleOutlined /> : <StopOutlined />}
          <span>{title}</span>
        </div>
      );
    }

    return (
      <div className="mc-progress-steps" style={{ margin: '8px 0' }}>
        <Alert
          type={isCancelled ? 'error' : 'warning'}
          showIcon
          icon={isCancelled ? <CloseCircleOutlined /> : <StopOutlined />}
          message={<span style={{ fontWeight: 600 }}>{title}</span>}
          description={desc}
          style={{ borderRadius: 8 }}
        />
      </div>
    );
  }

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

import React, { useState } from 'react';
import { Modal, Input, Button, message as antMessage, Spin } from 'antd';
import { CheckOutlined, CloseOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { ticketApi } from '../../api/ticketApi';
import { formatCurrency } from '../../utils/helpers';

const { confirm } = Modal;

/**
 * QuoteCard — Hiển thị báo giá và nút xác nhận/từ chối
 * @param {object} quote - Dữ liệu báo giá từ API
 * @param {function} onAction - Callback sau khi accept/reject
 */
export default function QuoteCard({ quote, onAction }) {
  const [loading, setLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  if (!quote) return null;

  const isPending = quote.status === 'PENDING';
  const isAccepted = quote.status === 'ACCEPTED';
  const isRejected = quote.status === 'REJECTED';

  const handleAccept = () => {
    confirm({
      title: 'Xác nhận báo giá?',
      icon: <ExclamationCircleOutlined style={{ color: '#4f46e5' }} />,
      content: (
        <div>
          <p>Bạn đồng ý sửa chữa thiết bị với chi phí:</p>
          <p style={{ fontSize: 24, fontWeight: 800, color: '#4f46e5' }}>
            {formatCurrency(quote.totalAmount)}
          </p>
        </div>
      ),
      okText: 'Đồng ý sửa chữa',
      cancelText: 'Hủy',
      okButtonProps: { style: { background: '#4f46e5', borderColor: '#4f46e5' } },
      async onOk() {
        setLoading(true);
        try {
          await ticketApi.acceptQuote(quote.id, { notes: 'Khách hàng đồng ý' });
          antMessage.success('✅ Đã xác nhận báo giá!');
          onAction?.();
        } catch {
          antMessage.error('Lỗi khi xác nhận báo giá');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      antMessage.warning('Vui lòng nhập lý do từ chối');
      return;
    }
    setLoading(true);
    try {
      await ticketApi.rejectQuote(quote.id, { reason: rejectReason });
      antMessage.success('Đã từ chối báo giá');
      setShowRejectInput(false);
      onAction?.();
    } catch {
      antMessage.error('Lỗi khi từ chối báo giá');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <div className={`mc-quote-card ${!isPending ? 'mc-quote-card--resolved' : ''}`}>
        {/* Header */}
        <div className="mc-flex-between mc-mb-16">
          <div>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Chi phí sửa chữa dự kiến</div>
            <div className="mc-quote-total">{formatCurrency(quote.totalAmount)}</div>
          </div>
          {isAccepted && (
            <span style={{
              background: '#d1fae5', color: '#047857',
              padding: '6px 14px', borderRadius: 100,
              fontSize: 13, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <CheckOutlined /> Đã xác nhận
            </span>
          )}
          {isRejected && (
            <span style={{
              background: '#fee2e2', color: '#dc2626',
              padding: '6px 14px', borderRadius: 100,
              fontSize: 13, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <CloseOutlined /> Đã từ chối
            </span>
          )}
          {isPending && (
            <span style={{
              background: '#fef3c7', color: '#92400e',
              padding: '6px 14px', borderRadius: 100,
              fontSize: 13, fontWeight: 600,
            }}>
              Chờ xác nhận
            </span>
          )}
        </div>

        {/* Breakdown */}
        <div className="mc-quote-breakdown">
          {quote.laborCost != null && (
            <div className="mc-quote-row">
              <span>Công sửa chữa</span>
              <strong>{formatCurrency(quote.laborCost)}</strong>
            </div>
          )}
          {quote.partsCost != null && (
            <div className="mc-quote-row">
              <span>Chi phí linh kiện</span>
              <strong>{formatCurrency(quote.partsCost)}</strong>
            </div>
          )}
          <div className="mc-quote-row" style={{ paddingTop: 8, borderTop: '1px solid #e5e7eb', marginTop: 4 }}>
            <span style={{ fontWeight: 600, color: '#111827' }}>Tổng cộng</span>
            <strong style={{ color: '#4f46e5', fontSize: 16 }}>{formatCurrency(quote.totalAmount)}</strong>
          </div>
        </div>

        {/* Notes */}
        {quote.notes && (
          <div style={{
            marginTop: 16, padding: '10px 14px',
            background: '#f9fafb', borderRadius: 8,
            fontSize: 13, color: '#6b7280',
            borderLeft: '3px solid #e5e7eb',
          }}>
            <strong style={{ color: '#374151' }}>Ghi chú:</strong> {quote.notes}
          </div>
        )}

        {/* Actions (chỉ khi PENDING) */}
        {isPending && (
          <div style={{ marginTop: 20 }}>
            {!showRejectInput ? (
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button className="mc-btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleAccept}>
                  <CheckOutlined /> Đồng ý sửa chữa
                </button>
                <button className="mc-btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowRejectInput(true)}>
                  <CloseOutlined /> Từ chối
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Lý do từ chối:</div>
                <Input.TextArea
                  rows={3}
                  placeholder="Nhập lý do từ chối báo giá..."
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  style={{ borderRadius: 8 }}
                />
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="mc-btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={handleReject}>
                    Xác nhận từ chối
                  </button>
                  <button className="mc-btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowRejectInput(false)}>
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Spin>
  );
}

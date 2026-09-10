import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Spin, message, Button } from 'antd';
import {
  SearchOutlined,
  QrcodeOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  LaptopOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { ticketApi } from '../../api/ticketApi';
import { formatDate } from '../../utils/helpers';

const STATUS_MAP = {
  RECEIVED: { label: 'Đã tiếp nhận thiết bị', color: '#1d4ed8', bg: '#dbeafe' },
  DIAGNOSING: { label: 'Đang kiểm tra lỗi', color: '#b45309', bg: '#fef3c7' },
  QUOTED: { label: 'Đã có báo giá chi tiết', color: '#6d28d9', bg: '#ede9fe' },
  APPROVED: { label: 'Khách hàng đã duyệt giá', color: '#065f46', bg: '#d1fae5' },
  REPAIRING: { label: 'Kỹ thuật viên đang sửa chữa', color: '#1e40af', bg: '#dbeafe' },
  COMPLETED: { label: 'Đã sửa chữa hoàn tất', color: '#047857', bg: '#d1fae5' },
  DELIVERED: { label: 'Đã bàn giao cho khách', color: '#065f46', bg: '#d1fae5' },
  CANCELLED: { label: 'Đã hủy phiếu', color: '#4b5563', bg: '#f3f4f6' },
};

export default function TrackRepairSection() {
  const navigate = useNavigate();
  const [ticketCode, setTicketCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [ticketResult, setTicketResult] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleLookup = async (e) => {
    if (e) e.preventDefault();
    if (!ticketCode.trim()) {
      message.warning('Vui lòng nhập mã phiếu sửa chữa');
      return;
    }

    setLoading(true);
    try {
      const res = await ticketApi.lookupTicket(ticketCode.trim());
      if (res?.data?.data) {
        setTicketResult(res.data.data);
        setModalOpen(true);
      } else {
        message.error('Không tìm thấy thông tin phiếu sửa chữa');
      }
    } catch (err) {
      message.error(err.response?.data?.message || 'Mã phiếu không tồn tại hoặc đã nhập sai');
    } finally {
      setLoading(false);
    }
  };

  const statusInfo = ticketResult ? (STATUS_MAP[ticketResult.status] || { label: ticketResult.status, color: '#334155', bg: '#f1f5f9' }) : null;

  return (
    <section className="pub-section" id="track-ticket">
      <div className="pub-container">
        <div className="pub-track-box">
          {/* Left Text */}
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.15)', padding: '4px 12px',
              borderRadius: 99, fontSize: 13, fontWeight: 600, color: '#a5b4fc', marginBottom: 16
            }}>
              <QrcodeOutlined /> TRA CỨU TIẾN ĐỘ TRỰC TUYẾN
            </div>
            <h3 className="pub-track-title">
              Bạn muốn biết thiết bị đang được sửa đến đâu?
            </h3>
            <p className="pub-track-sub">
              Nhập mã phiếu in trên phiếu biên nhận (VD: <span style={{ color: '#ffffff', fontWeight: 600 }}>TK-2024-001</span>) hoặc quét mã QR để tra cứu tức thì trạng thái xử lý hiện tại.
            </p>
          </div>

          {/* Right Input Form */}
          <div>
            <form onSubmit={handleLookup} className="pub-track-form">
              <input
                type="text"
                className="pub-track-input"
                placeholder="Nhập mã phiếu sửa chữa (VD: TK-2024-004)..."
                value={ticketCode}
                onChange={(e) => setTicketCode(e.target.value)}
              />
              <button
                type="submit"
                className="pub-btn pub-btn-primary"
                disabled={loading}
                style={{ padding: '12px 24px', flexShrink: 0 }}
              >
                {loading ? <Spin size="small" /> : <SearchOutlined />} Tra Cứu
              </button>
            </form>
            <div style={{ marginTop: 12, fontSize: 13, color: '#94a3b8', display: 'flex', gap: 16 }}>
              <span>💡 Dành cho cả khách hàng chưa đăng nhập</span>
              <span>🔒 Bảo mật thông tin</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Lookup Result Modal */}
      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={540}
        centered
        style={{ borderRadius: 16 }}
      >
        {ticketResult && (
          <div style={{ padding: '8px 4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <span style={{ fontSize: 12, color: '#64748b' }}>Mã phiếu sửa chữa</span>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#4f46e5', letterSpacing: 1 }}>
                  {ticketResult.ticketCode}
                </div>
              </div>
              <span style={{
                background: statusInfo.bg,
                color: statusInfo.color,
                padding: '6px 14px',
                borderRadius: 999,
                fontWeight: 700,
                fontSize: 13
              }}>
                {statusInfo.label}
              </span>
            </div>

            <div style={{
              background: '#f8fafc',
              borderRadius: 12,
              padding: 20,
              border: '1px solid #e2e8f0',
              marginBottom: 20
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: '#eef2ff', color: '#4f46e5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
                }}>
                  <LaptopOutlined />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>
                    {ticketResult.device?.brand} {ticketResult.device?.model}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    Loại máy: {ticketResult.device?.deviceType || 'Điện tử'}
                  </div>
                </div>
              </div>

              <div style={{ height: 1, background: '#e2e8f0', margin: '12px 0' }} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
                <div>
                  <span style={{ color: '#64748b' }}>Ngày tiếp nhận:</span>
                  <div style={{ fontWeight: 600, color: '#1e293b', marginTop: 2 }}>
                    {formatDate(ticketResult.createdAt)}
                  </div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Tình trạng báo lỗi:</span>
                  <div style={{ fontWeight: 600, color: '#1e293b', marginTop: 2 }}>
                    {ticketResult.issueDescription || 'Không có ghi chú'}
                  </div>
                </div>
              </div>

              {ticketResult.diagnosisNotes && (
                <div style={{ marginTop: 14, padding: 10, background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0', fontSize: 13, color: '#166534' }}>
                  <strong>Kết quả kiểm tra:</strong> {ticketResult.diagnosisNotes}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <Button
                size="large"
                style={{ flex: 1, borderRadius: 10 }}
                onClick={() => setModalOpen(false)}
              >
                Đóng
              </Button>
              <Button
                type="primary"
                size="large"
                style={{ flex: 1, borderRadius: 10, background: '#4f46e5', borderColor: '#4f46e5' }}
                onClick={() => {
                  setModalOpen(false);
                  navigate(`/customer-new/tickets/${ticketResult.id}`);
                }}
              >
                Chi Tiết Phiếu <ArrowRightOutlined />
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}

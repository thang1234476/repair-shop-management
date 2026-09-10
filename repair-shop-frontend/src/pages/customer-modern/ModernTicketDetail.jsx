import React, { useState, useEffect } from 'react';
import { Spin, message, Timeline as AntTimeline, Divider } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftOutlined, LaptopOutlined, ToolOutlined,
  FileTextOutlined, QrcodeOutlined, ClockCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { ticketApi } from '../../api/ticketApi';
import { DeviceIcon } from '../../components/modern/TicketCard';
import RepairProgressSteps from '../../components/modern/RepairProgressSteps';
import QuoteCard from '../../components/modern/QuoteCard';
import { formatDate } from '../../utils/helpers';
import { QRCodeSVG } from 'qrcode.react';

const STATUS_LABELS = {
  RECEIVED:   'Đã tiếp nhận',
  DIAGNOSING: 'Đang kiểm tra',
  QUOTED:     'Đã có báo giá',
  APPROVED:   'Đã xác nhận',
  REPAIRING:  'Đang sửa chữa',
  COMPLETED:  'Đã sửa xong',
  DELIVERED:  'Đã bàn giao',
  CANCELLED:  'Đã hủy',
};

function SectionCard({ icon, title, children }) {
  return (
    <div className="mc-card mc-mb-16">
      <div className="mc-card-title">
        <span style={{
          width: 32, height: 32, borderRadius: 8,
          background: '#eef2ff', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          color: '#4f46e5', fontSize: 15, flexShrink: 0,
        }}>
          {icon}
        </span>
        {title}
      </div>
      {children}
    </div>
  );
}

export default function ModernTicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [quote, setQuote] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchAll();
  }, [id]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [ticketRes, quoteRes, timelineRes] = await Promise.all([
        ticketApi.getMyTicket(id),
        ticketApi.getTicketQuote(id).catch(() => ({ data: { data: null } })),
        ticketApi.getTicketTimeline(id).catch(() => ({ data: { data: [] } })),
      ]);
      setTicket(ticketRes.data.data);
      setQuote(quoteRes.data.data);
      setTimeline(timelineRes.data.data || []);
    } catch {
      message.error('Lỗi khi tải chi tiết phiếu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="mc-card" style={{ textAlign: 'center', padding: 64 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
        <p style={{ fontSize: 16, color: '#6b7280' }}>Không tìm thấy phiếu sửa chữa</p>
        <button className="mc-btn-secondary" onClick={() => navigate('/customer-new/tickets')}>
          <ArrowLeftOutlined /> Quay lại
        </button>
      </div>
    );
  }

  const statusLabel = STATUS_LABELS[ticket.status] || ticket.status;
  const isPendingQuote = ticket.status === 'QUOTED' && quote?.status === 'PENDING';

  // Build timeline items for Ant Timeline
  const timelineItems = timeline.length > 0
    ? timeline.map(item => ({
        dot: <ClockCircleOutlined style={{ fontSize: 14 }} />,
        color: 'blue',
        children: (
          <div>
            <div style={{ fontWeight: 500, fontSize: 14, color: '#111827' }}>{item.description || item.action}</div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{formatDate(item.createdAt || item.timestamp)}</div>
            {item.note && <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{item.note}</div>}
          </div>
        ),
      }))
    : [
        {
          dot: <ClockCircleOutlined style={{ fontSize: 14 }} />,
          color: 'blue',
          children: (
            <div>
              <div style={{ fontWeight: 500, fontSize: 14, color: '#111827' }}>Phiếu sửa chữa được tạo</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{formatDate(ticket.createdAt)}</div>
            </div>
          ),
        },
      ];

  return (
    <div>
      {/* ── Back Button + Header ── */}
      <div className="mc-mb-24">
        <button
          className="mc-btn-secondary mc-mb-16"
          style={{ fontSize: 13, padding: '6px 14px' }}
          onClick={() => navigate('/customer-new/tickets')}
        >
          <ArrowLeftOutlined /> Quay lại
        </button>

        <div className="mc-flex-between" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 6, letterSpacing: '-0.3px' }}>
              Phiếu sửa chữa
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{
                fontFamily: 'monospace', fontSize: 15, fontWeight: 700,
                color: '#4f46e5', background: '#eef2ff',
                padding: '3px 12px', borderRadius: 8, letterSpacing: 1,
              }}>
                {ticket.ticketCode}
              </span>
              <span className={`mc-status-badge mc-status-${ticket.status}`}>
                {statusLabel}
              </span>
            </div>
          </div>

          {isPendingQuote && (
            <div style={{
              background: '#fef3c7', border: '1px solid #fcd34d',
              borderRadius: 10, padding: '10px 16px',
              fontSize: 13, color: '#92400e', fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              ⚠️ Bạn cần xác nhận báo giá để tiến hành sửa chữa
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>
        {/* ── Left Column ── */}
        <div>
          {/* 1. Thông tin thiết bị */}
          <SectionCard icon={<LaptopOutlined />} title="Thông tin thiết bị">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 12,
                background: '#eef2ff', display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <DeviceIcon deviceType={ticket.device?.deviceType} size={28} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18, color: '#111827' }}>
                  {ticket.device?.brand} {ticket.device?.model}
                </div>
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
                  {ticket.device?.deviceType}
                  {ticket.device?.serialNumber && ` · Serial: ${ticket.device.serialNumber}`}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* 2. Vấn đề khách báo */}
          <SectionCard icon={<InfoCircleOutlined />} title="Vấn đề báo cáo">
            <div style={{
              background: '#f9fafb', borderRadius: 10,
              padding: '14px 16px', fontSize: 15,
              color: '#374151', lineHeight: 1.7,
              borderLeft: '4px solid #c7d2fe',
            }}>
              "{ticket.issueDescription || 'Không có mô tả'}"
            </div>
          </SectionCard>

          {/* 3. Tiến trình sửa chữa */}
          <SectionCard icon={<ToolOutlined />} title="Tiến trình sửa chữa">
            <RepairProgressSteps status={ticket.status} />
          </SectionCard>

          {/* 4. Kết quả kiểm tra */}
          {ticket.diagnosisNotes && (
            <SectionCard icon={<FileTextOutlined />} title="Kết quả kiểm tra">
              <div style={{
                background: '#f0fdf4', borderRadius: 10,
                padding: '14px 16px', fontSize: 14,
                color: '#166534', lineHeight: 1.7,
                border: '1px solid #bbf7d0',
              }}>
                {ticket.diagnosisNotes}
              </div>
            </SectionCard>
          )}

          {/* 5. Lịch sử hoạt động */}
          <SectionCard icon={<ClockCircleOutlined />} title="Lịch sử hoạt động">
            <AntTimeline items={timelineItems} style={{ marginTop: 8 }} />
          </SectionCard>
        </div>

        {/* ── Right Column ── */}
        <div style={{ position: 'sticky', top: 84 }}>
          {/* 6. Báo giá */}
          {quote && (
            <div className="mc-mb-16">
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 10 }}>
                💰 Báo giá sửa chữa
              </div>
              <QuoteCard quote={quote} onAction={fetchAll} />
            </div>
          )}

          {/* 7. QR Code */}
          <SectionCard icon={<QrcodeOutlined />} title="Tra cứu phiếu">
            <div className="mc-qr-section">
              <QRCodeSVG
                value={ticket.ticketCode}
                size={120}
                fgColor="#111827"
                style={{ borderRadius: 4 }}
              />
              <div className="mc-ticket-code-badge">{ticket.ticketCode}</div>
              <div className="mc-qr-label">
                Quét mã QR này để tra cứu<br />tình trạng phiếu sửa chữa
              </div>
            </div>
          </SectionCard>

          {/* Ngày tạo */}
          <div style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', marginTop: 8 }}>
            Tạo lúc: {formatDate(ticket.createdAt)}
          </div>
        </div>
      </div>

      {/* Mobile: Right column moves below on small screens */}
      <style>{`
        @media (max-width: 768px) {
          .ticket-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

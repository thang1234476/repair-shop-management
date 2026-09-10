import React, { useState, useEffect } from 'react';
import { Spin, Input, message, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { ticketApi } from '../../api/ticketApi';
import TicketCard from '../../components/modern/TicketCard';

const BASE = '/customer-new';

const FILTER_TABS = [
  { key: 'ALL',     label: 'Tất cả' },
  { key: 'ACTIVE',  label: 'Đang xử lý' },
  { key: 'QUOTED',  label: 'Chờ xác nhận' },
  { key: 'DONE',    label: 'Đã hoàn thành' },
];

const ACTIVE_STATUSES  = ['RECEIVED', 'DIAGNOSING', 'APPROVED', 'REPAIRING'];
const DONE_STATUSES    = ['COMPLETED', 'DELIVERED'];

function filterTickets(tickets, tab) {
  switch (tab) {
    case 'ACTIVE':  return tickets.filter(t => ACTIVE_STATUSES.includes(t.status));
    case 'QUOTED':  return tickets.filter(t => t.status === 'QUOTED');
    case 'DONE':    return tickets.filter(t => DONE_STATUSES.includes(t.status));
    default:        return tickets;
  }
}

export default function ModernTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await ticketApi.getMyTickets({ size: 50, sort: 'createdAt,desc' });
      setTickets(res.data.data.content || []);
    } catch {
      message.error('Lỗi khi tải danh sách phiếu');
    } finally {
      setLoading(false);
    }
  };

  // Filter by tab
  const tabFiltered = filterTickets(tickets, activeTab);

  // Filter by search
  const displayed = search.trim()
    ? tabFiltered.filter(t =>
        t.ticketCode?.toLowerCase().includes(search.toLowerCase()) ||
        t.device?.brand?.toLowerCase().includes(search.toLowerCase()) ||
        t.device?.model?.toLowerCase().includes(search.toLowerCase()) ||
        t.issueDescription?.toLowerCase().includes(search.toLowerCase())
      )
    : tabFiltered;

  // Tab counts
  const counts = {
    ALL:    tickets.length,
    ACTIVE: filterTickets(tickets, 'ACTIVE').length,
    QUOTED: filterTickets(tickets, 'QUOTED').length,
    DONE:   filterTickets(tickets, 'DONE').length,
  };

  return (
    <div>
      {/* ── Header ── */}
      <div className="mc-mb-24">
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 4 }}>
          Phiếu sửa chữa
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
          Theo dõi toàn bộ lịch sử sửa chữa thiết bị của bạn
        </p>
      </div>

      {/* ── Search + Filters ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div className="mc-filter-tabs">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.key}
              className={`mc-filter-tab${activeTab === tab.key ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              {counts[tab.key] > 0 && (
                <span style={{
                  marginLeft: 6,
                  background: activeTab === tab.key ? 'rgba(255,255,255,0.3)' : '#e5e7eb',
                  color: activeTab === tab.key ? 'white' : '#374151',
                  padding: '0 6px', borderRadius: 100,
                  fontSize: 11, fontWeight: 600,
                }}>
                  {counts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        <Input
          placeholder="Tìm theo mã phiếu, thiết bị..."
          prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
          value={search}
          onChange={e => setSearch(e.target.value)}
          allowClear
          style={{ width: 260, borderRadius: 10 }}
        />
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <Spin size="large" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="mc-card">
          <div className="mc-empty">
            <div className="mc-empty-icon">📋</div>
            <div className="mc-empty-title">
              {search ? 'Không tìm thấy kết quả' : 'Chưa có phiếu sửa chữa'}
            </div>
            <div className="mc-empty-desc">
              {search
                ? `Không có phiếu nào khớp với "${search}"`
                : activeTab === 'QUOTED'
                  ? 'Hiện tại không có phiếu nào chờ xác nhận báo giá'
                  : 'Khi bạn mang thiết bị đến cửa hàng, phiếu sửa chữa sẽ xuất hiện tại đây'}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {displayed.map(ticket => (
            <TicketCard key={ticket.id} ticket={ticket} basePath={BASE} />
          ))}
        </div>
      )}
    </div>
  );
}

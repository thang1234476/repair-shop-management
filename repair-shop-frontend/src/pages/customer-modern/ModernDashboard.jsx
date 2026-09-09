import React, { useState, useEffect } from 'react';
import { Spin, Empty, Input, Button, message } from 'antd';
import { SearchOutlined, FileTextOutlined, ArrowRightOutlined, WifiOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { ticketApi } from '../../api/ticketApi';
import { customerApi } from '../../api/customerApi';
import TicketCard from '../../components/modern/TicketCard';
import DeviceCard from '../../components/modern/DeviceCard';
import ActionAlert from '../../components/modern/ActionAlert';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/helpers';

const BASE = '/customer-new';

export default function ModernDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTickets, setActiveTickets] = useState([]);
  const [doneTickets, setDoneTickets] = useState([]);
  const [devices, setDevices] = useState([]);
  const [pendingQuote, setPendingQuote] = useState(null); // { id, ticketCode }
  const [searchCode, setSearchCode] = useState('');
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [ticketsRes, devicesRes] = await Promise.all([
        ticketApi.getMyTickets({ size: 20, sort: 'createdAt,desc' }),
        customerApi.getMyDevices().catch(() => ({ data: { data: [] } })),
      ]);

      const allTickets = ticketsRes.data.data.content || [];
      const active = allTickets.filter(t => !['COMPLETED', 'DELIVERED', 'CANCELLED'].includes(t.status));
      const done = allTickets.filter(t => ['COMPLETED', 'DELIVERED'].includes(t.status)).slice(0, 3);

      setActiveTickets(active);
      setDoneTickets(done);
      setDevices(devicesRes.data.data || []);

      // Check for pending quote
      const quotedTicket = active.find(t => t.status === 'QUOTED');
      if (quotedTicket) {
        setPendingQuote({ id: quotedTicket.id, ticketCode: quotedTicket.ticketCode });
      }
    } catch (err) {
      message.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchCode.trim()) return;
    setSearching(true);
    try {
      const res = await ticketApi.lookupTicket(searchCode.trim());
      navigate(`${BASE}/tickets/${res.data.data.id}`);
    } catch {
      message.error('Không tìm thấy phiếu sửa chữa với mã này');
    } finally {
      setSearching(false);
    }
  };

  const firstName = user?.fullName?.split(' ').pop() || user?.fullName || 'bạn';

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  const hasNoTickets = activeTickets.length === 0 && doneTickets.length === 0;

  return (
    <div>
      {/* ── Greeting ── */}
      <div className="mc-mb-32">
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111827', marginBottom: 6, letterSpacing: '-0.5px' }}>
          Xin chào, {firstName} 👋
        </h1>
        <p style={{ fontSize: 16, color: '#6b7280', margin: 0 }}>
          {hasNoTickets
            ? 'Chào mừng bạn đến với RepairShop!'
            : 'Đây là tình trạng các thiết bị của bạn.'}
        </p>
      </div>

      {/* ── Action Alert (báo giá chờ xác nhận) ── */}
      {pendingQuote && (
        <ActionAlert
          ticketId={pendingQuote.id}
          ticketCode={pendingQuote.ticketCode}
          basePath={BASE}
        />
      )}

      {/* ── Empty State ── */}
      {hasNoTickets ? (
        <div className="mc-card" style={{ textAlign: 'center', padding: '64px 24px' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🔧</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
            Bạn chưa có phiếu sửa chữa nào
          </h3>
          <p style={{ fontSize: 14, color: '#6b7280', maxWidth: 360, margin: '0 auto 24px', lineHeight: 1.7 }}>
            Đưa thiết bị đến RepairShop và chúng tôi sẽ giúp bạn theo dõi toàn bộ quá trình sửa chữa ngay tại đây.
          </p>
          {/* Quick lookup */}
          <div style={{ display: 'flex', gap: 8, maxWidth: 400, margin: '0 auto' }}>
            <Input
              placeholder="Nhập mã phiếu để tra cứu..."
              value={searchCode}
              onChange={e => setSearchCode(e.target.value)}
              onPressEnter={handleSearch}
              prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
              size="large"
              style={{ borderRadius: 10 }}
            />
            <Button type="primary" size="large" loading={searching} onClick={handleSearch} style={{ borderRadius: 10, background: '#4f46e5', borderColor: '#4f46e5' }}>
              Tra cứu
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* ── Phiếu đang xử lý ── */}
          {activeTickets.length > 0 && (
            <section className="mc-mb-32">
              <div className="mc-flex-between mc-mb-16">
                <h2 className="mc-section-title" style={{ margin: 0 }}>
                  Phiếu đang xử lý
                  <span style={{
                    marginLeft: 8, fontSize: 13, fontWeight: 600,
                    background: '#eef2ff', color: '#4f46e5',
                    padding: '2px 10px', borderRadius: 100,
                  }}>
                    {activeTickets.length}
                  </span>
                </h2>
                <button
                  className="mc-btn-secondary"
                  style={{ fontSize: 13, padding: '6px 14px' }}
                  onClick={() => navigate(`${BASE}/tickets`)}
                >
                  Xem tất cả <ArrowRightOutlined style={{ fontSize: 11 }} />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {activeTickets.slice(0, 3).map(ticket => (
                  <TicketCard key={ticket.id} ticket={ticket} basePath={BASE} />
                ))}
              </div>
            </section>
          )}

          {/* ── Tra cứu nhanh ── */}
          <section className="mc-card mc-mb-32">
            <div className="mc-card-title">
              <SearchOutlined style={{ color: '#4f46e5' }} />
              Tra cứu phiếu sửa chữa
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Input
                placeholder="Nhập mã phiếu..."
                value={searchCode}
                onChange={e => setSearchCode(e.target.value)}
                onPressEnter={handleSearch}
                prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
                style={{ flex: 1, minWidth: 200, borderRadius: 10 }}
              />
              <Button
                type="primary"
                loading={searching}
                onClick={handleSearch}
                icon={<SearchOutlined />}
                style={{ background: '#4f46e5', borderColor: '#4f46e5', borderRadius: 10 }}
              >
                Tra cứu
              </Button>
            </div>
          </section>

          {/* ── Thiết bị của tôi ── */}
          {devices.length > 0 && (
            <section className="mc-mb-32">
              <div className="mc-flex-between mc-mb-16">
                <h2 className="mc-section-title" style={{ margin: 0 }}>Thiết bị của tôi</h2>
                <button
                  className="mc-btn-secondary"
                  style={{ fontSize: 13, padding: '6px 14px' }}
                  onClick={() => navigate(`${BASE}/devices`)}
                >
                  Xem tất cả <ArrowRightOutlined style={{ fontSize: 11 }} />
                </button>
              </div>
              <div className="mc-grid-3">
                {devices.slice(0, 3).map(device => (
                  <DeviceCard key={device.id} device={device} basePath={BASE} />
                ))}
              </div>
            </section>
          )}

          {/* ── Lịch sử sửa chữa ── */}
          {doneTickets.length > 0 && (
            <section className="mc-mb-32">
              <div className="mc-flex-between mc-mb-16">
                <h2 className="mc-section-title" style={{ margin: 0 }}>Lịch sử sửa chữa</h2>
                <button
                  className="mc-btn-secondary"
                  style={{ fontSize: 13, padding: '6px 14px' }}
                  onClick={() => navigate(`${BASE}/tickets`)}
                >
                  Xem tất cả <ArrowRightOutlined style={{ fontSize: 11 }} />
                </button>
              </div>
              <div className="mc-card" style={{ padding: 0, overflow: 'hidden' }}>
                {doneTickets.map((ticket, idx) => (
                  <div
                    key={ticket.id}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '14px 20px', cursor: 'pointer',
                      borderBottom: idx < doneTickets.length - 1 ? '1px solid #f3f4f6' : 'none',
                      transition: 'background 0.15s',
                    }}
                    onClick={() => navigate(`${BASE}/tickets/${ticket.id}`)}
                    onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#6b7280' }}>
                        <FileTextOutlined />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>
                          {ticket.device?.brand} {ticket.device?.model}
                        </div>
                        <div style={{ fontSize: 12, color: '#9ca3af' }}>{ticket.ticketCode} · {formatDate(ticket.createdAt)}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className={`mc-status-badge mc-status-${ticket.status}`} style={{ fontSize: 11 }}>
                        {ticket.status === 'DELIVERED' ? 'Đã bàn giao' : 'Đã sửa xong'}
                      </span>
                      <ArrowRightOutlined style={{ color: '#9ca3af', fontSize: 12 }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

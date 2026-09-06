import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Steps, Button, message, Spin, Space } from 'antd';
import { useParams } from 'react-router-dom';
import { ticketApi } from '../../api/ticketApi';
import { TicketStatusBadge } from '../../components/StatusBadge';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { QRCodeSVG } from 'qrcode.react';

const { Step } = Steps;

export default function CustomerTicketDetail() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const [ticketRes, quoteRes] = await Promise.all([
        ticketApi.getMyTicket(id),
        ticketApi.getTicketQuote(id).catch(() => ({ data: { data: null } }))
      ]);
      setTicket(ticketRes.data.data);
      setQuote(quoteRes.data.data);
    } catch (error) {
      message.error('Lỗi khi tải chi tiết phiếu');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptQuote = async () => {
    try {
      await ticketApi.acceptQuote(quote.id, { notes: 'Đồng ý' });
      message.success('Đã xác nhận báo giá');
      fetchDetail();
    } catch (error) {
      message.error('Lỗi khi xác nhận báo giá');
    }
  };

  const handleRejectQuote = async () => {
    try {
      await ticketApi.rejectQuote(quote.id, { reason: 'Không đồng ý' });
      message.success('Đã từ chối báo giá');
      fetchDetail();
    } catch (error) {
      message.error('Lỗi khi từ chối báo giá');
    }
  };

  if (loading) return <Spin size="large" />;
  if (!ticket) return <div>Không tìm thấy phiếu</div>;

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Chi tiết phiếu sửa chữa: {ticket.ticketCode}</h2>
      <Card className="glass-card" style={{ marginBottom: 24 }}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Mã phiếu">{ticket.ticketCode}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái"><TicketStatusBadge status={ticket.status} /></Descriptions.Item>
          <Descriptions.Item label="Thiết bị">{ticket.device?.brand} {ticket.device?.model}</Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">{formatDate(ticket.createdAt)}</Descriptions.Item>
          <Descriptions.Item label="Mô tả lỗi" span={2}>{ticket.issueDescription}</Descriptions.Item>
          {ticket.diagnosisNotes && <Descriptions.Item label="Ghi chú chẩn đoán" span={2}>{ticket.diagnosisNotes}</Descriptions.Item>}
        </Descriptions>
      </Card>
      
      {quote && quote.status === 'PENDING' && (
        <Card title="Báo giá" className="glass-card" style={{ marginBottom: 24, borderColor: 'orange' }}>
          <p><strong>Tổng tiền:</strong> <span style={{ color: 'red', fontSize: '1.2rem', fontWeight: 'bold' }}>{formatCurrency(quote.totalAmount)}</span></p>
          <Space>
            <Button type="primary" onClick={handleAcceptQuote}>Đồng ý sửa</Button>
            <Button danger onClick={handleRejectQuote}>Từ chối</Button>
          </Space>
        </Card>
      )}

      <Card title="Mã QR" className="glass-card">
        <QRCodeSVG value={ticket.ticketCode} size={128} />
      </Card>
    </div>
  );
}

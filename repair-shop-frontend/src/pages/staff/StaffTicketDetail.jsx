import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Button, message, Spin, Select, Form, Input, Divider } from 'antd';
import { useParams } from 'react-router-dom';
import { ticketApi } from '../../api/ticketApi';
import { invoiceApi } from '../../api/invoiceApi';
import { TicketStatusBadge } from '../../components/StatusBadge';
import { formatDate } from '../../utils/helpers';
import { QRCodeSVG } from 'qrcode.react';

const { Option } = Select;

export default function StaffTicketDetail() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const res = await ticketApi.getTicketAdmin(id);
      setTicket(res.data.data);
    } catch (error) {
      message.error('Lỗi tải phiếu');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status) => {
    try {
      await ticketApi.updateTicketStatus(id, { status, notes: 'Cập nhật từ nhân viên' });
      message.success('Cập nhật trạng thái thành công');
      fetchDetail();
    } catch (error) {
      message.error('Lỗi cập nhật');
    }
  };

  const createInvoice = async () => {
    try {
      await invoiceApi.createInvoice({ ticketId: id, taxRate: 10, discount: 0 });
      message.success('Đã tạo hóa đơn');
      fetchDetail();
    } catch (error) {
      message.error('Lỗi tạo hóa đơn');
    }
  };

  if (loading) return <Spin size="large" />;
  if (!ticket) return <div>Không tìm thấy phiếu</div>;

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Quản lý phiếu: {ticket.ticketCode}</h2>
      <Card className="glass-card" style={{ marginBottom: 24 }}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Trạng thái"><TicketStatusBadge status={ticket.status} /></Descriptions.Item>
          <Descriptions.Item label="Khách hàng">{ticket.customer?.fullName} ({ticket.customer?.phone})</Descriptions.Item>
          <Descriptions.Item label="Thiết bị">{ticket.device?.brand} {ticket.device?.model}</Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">{formatDate(ticket.createdAt)}</Descriptions.Item>
          <Descriptions.Item label="Mô tả lỗi" span={2}>{ticket.issueDescription}</Descriptions.Item>
        </Descriptions>
        
        <Divider />
        <h3>Thao tác nhanh</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button onClick={() => updateStatus('DIAGNOSING')}>Bắt đầu chẩn đoán</Button>
          <Button onClick={() => updateStatus('REPAIRING')}>Bắt đầu sửa</Button>
          <Button type="primary" onClick={() => updateStatus('COMPLETED')}>Hoàn thành sửa chữa</Button>
          <Button type="primary" success="true" onClick={() => updateStatus('DELIVERED')}>Bàn giao khách</Button>
        </div>
      </Card>
      
      {ticket.status === 'COMPLETED' && (
        <Card title="Hóa đơn" className="glass-card" style={{ marginBottom: 24 }}>
          <Button type="primary" onClick={createInvoice}>Tạo hóa đơn cho phiếu này</Button>
        </Card>
      )}

      <Card title="Mã QR" className="glass-card">
        <QRCodeSVG value={ticket.ticketCode} size={128} />
      </Card>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Row, Col, Card, message } from 'antd';
import { dashboardApi } from '../../api/dashboardApi';
import { formatCurrency } from '../../utils/helpers';

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    dashboardApi.getSummary().then(res => setSummary(res.data.data)).catch(() => message.error('Lỗi tải dữ liệu'));
  }, []);

  if (!summary) return <div>Đang tải...</div>;

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Dashboard Quản trị</h2>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}><div className="stat-card"><h3>Tổng Phiếu</h3><p style={{fontSize: 24, fontWeight: 'bold'}}>{summary.totalTickets}</p></div></Col>
        <Col span={6}><div className="stat-card"><h3>Doanh thu tháng</h3><p style={{fontSize: 24, fontWeight: 'bold', color: 'green'}}>{formatCurrency(summary.monthlyRevenue)}</p></div></Col>
        <Col span={6}><div className="stat-card"><h3>Khách hàng</h3><p style={{fontSize: 24, fontWeight: 'bold'}}>{summary.totalCustomers}</p></div></Col>
        <Col span={6}><div className="stat-card"><h3>Nhân viên</h3><p style={{fontSize: 24, fontWeight: 'bold'}}>{summary.totalStaff}</p></div></Col>
      </Row>
      <Card className="glass-card">
        <h3>Báo cáo doanh thu (Chart Placeholder)</h3>
        <div style={{ height: 300, background: 'rgba(255,255,255,0.05)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Biểu đồ doanh thu
        </div>
      </Card>
    </div>
  );
}

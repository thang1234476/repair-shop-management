import React, { useState, useEffect } from 'react';
import { Card, Statistic, Typography, Spin, Alert, Row, Col, Space, Select, Table, Tag, Skeleton, Divider } from 'antd';
import { DollarCircleOutlined, SyncOutlined, LineChartOutlined, FileTextOutlined, PieChartOutlined, AppstoreOutlined, DatabaseOutlined, DashboardOutlined } from '@ant-design/icons';
import { dashboardApi } from '../../api/dashboardApi';
import { ticketApi } from '../../api/ticketApi';
import { inventoryApi } from '../../api/inventoryApi';
import { formatCurrency } from '../../utils/helpers';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

export default function AdminDashboard() {
  // STATE: Summary (Module 1, 3)
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [errorSummary, setErrorSummary] = useState(null);

  // STATE: Revenue Chart (Module 2)
  const [revenueData, setRevenueData] = useState([]);
  const [loadingRevenue, setLoadingRevenue] = useState(true);
  const [errorRevenue, setErrorRevenue] = useState(null);
  const [revenueFilter, setRevenueFilter] = useState('7days');

  // STATE: Tickets by Status (Module 4)
  const [statusData, setStatusData] = useState([]);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [errorStatus, setErrorStatus] = useState(null);

  // STATE: Inventory (Module 5)
  const [inventoryData, setInventoryData] = useState([]);
  const [totalPartTypes, setTotalPartTypes] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [errorInventory, setErrorInventory] = useState(null);

  useEffect(() => {
    fetchSummary();
    fetchTicketsByStatus();
    fetchInventory();
  }, []);

  useEffect(() => {
    fetchRevenueData(revenueFilter);
  }, [revenueFilter]);

  const fetchSummary = async () => {
    try {
      setLoadingSummary(true);
      setErrorSummary(null);
      const res = await dashboardApi.getSummary();
      setSummary(res.data.data);
    } catch (err) {
      setErrorSummary('Không thể kết nối đến máy chủ.');
    } finally {
      setLoadingSummary(false);
    }
  };

  const fetchRevenueData = async (filter) => {
    try {
      setLoadingRevenue(true);
      setErrorRevenue(null);
      let fromDate, toDate = dayjs().endOf('day');
      if (filter === '7days') fromDate = dayjs().subtract(6, 'day').startOf('day');
      else if (filter === '30days') fromDate = dayjs().subtract(29, 'day').startOf('day');
      else if (filter === 'thisMonth') fromDate = dayjs().startOf('month');

      const res = await dashboardApi.getRevenue({
        from: fromDate.toISOString(),
        to: toDate.toISOString()
      });
      const data = res.data.data || [];
      const formattedData = data.map(item => ({
        ...item,
        dateFormatted: item.date ? dayjs(item.date).format('DD/MM') : 'Unknown',
        revenue: Number(item.revenue || item.amount || item.total || 0)
      })).sort((a, b) => {
        if (!a.date || !b.date) return 0;
        return dayjs(a.date).valueOf() - dayjs(b.date).valueOf();
      });
      setRevenueData(formattedData);
    } catch (err) {
      setErrorRevenue('Lỗi tải dữ liệu biểu đồ.');
    } finally {
      setLoadingRevenue(false);
    }
  };

  const fetchTicketsByStatus = async () => {
    try {
      setLoadingStatus(true);
      setErrorStatus(null);
      const res = await ticketApi.getAllTickets({ size: 1000 });
      const tickets = res.data.data.content || [];
      const counts = {};
      tickets.forEach(t => {
        const s = t.status || 'UNKNOWN';
        counts[s] = (counts[s] || 0) + 1;
      });
      const chartData = Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
      setStatusData(chartData);
    } catch (err) {
      setErrorStatus('Lỗi tải trạng thái phiếu.');
    } finally {
      setLoadingStatus(false);
    }
  };

  const fetchInventory = async () => {
    try {
      setLoadingInventory(true);
      setErrorInventory(null);
      const res = await inventoryApi.getAdminInventory({ page: 0, size: 1000 });
      const parts = res.data.data.content || [];
      setTotalPartTypes(res.data.data.totalElements || parts.length);
      setTotalQuantity(parts.reduce((sum, item) => sum + (item.quantityInStock || 0), 0));
      setInventoryData(parts);
    } catch (err) {
      setErrorInventory('Lỗi tải dữ liệu tồn kho.');
    } finally {
      setLoadingInventory(false);
    }
  };

  const totalRevenue = summary?.totalRevenue ?? 0;

  const STATUS_COLORS = {
    RECEIVED: '#3b82f6',
    DIAGNOSING: '#8b5cf6',
    QUOTED: '#f59e0b',
    APPROVED: '#10b981',
    REPAIRING: '#f97316',
    COMPLETED: '#06b6d4',
    DELIVERED: '#22c55e',
    CANCELLED: '#ef4444',
    REJECTED: '#f43f5e',
    UNKNOWN: '#94a3b8'
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#1a1a2e', border: `1px solid ${payload[0].payload.fill}`, padding: '12px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
          <p style={{ color: '#a0aec0', margin: 0, marginBottom: 4, fontSize: '12px', textTransform: 'uppercase' }}>Trạng thái</p>
          <p style={{ color: '#fff', margin: 0, marginBottom: 8, fontSize: '14px', fontWeight: 500 }}>{payload[0].name}</p>
          <p style={{ color: payload[0].payload.fill, margin: 0, fontWeight: 'bold', fontSize: '16px' }}>
            {payload[0].value} phiếu
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLineTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#1a1a2e', border: '1px solid #7c3aed', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
          <p style={{ color: '#a0aec0', margin: 0, marginBottom: 8, fontSize: '13px' }}>Ngày: {label}</p>
          <p style={{ color: '#10b981', margin: 0, fontWeight: 'bold', fontSize: '16px' }}>
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderStatCard = (title, value, icon, color, loading, error, isCurrency = false) => (
    <Card 
      bordered={false} 
      style={{ 
        background: 'linear-gradient(145deg, #16213e 0%, #1a1a2e 100%)',
        borderLeft: `4px solid ${color}`,
        boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
        borderRadius: 12,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        transition: 'transform 0.2s',
      }}
      bodyStyle={{ padding: '24px' }}
      hoverable
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 1 }} title={{ width: 100 }} />
      ) : error ? (
        <Alert message="Lỗi tải dữ liệu" type="error" showIcon style={{ background: 'transparent', border: 'none', padding: 0 }} />
      ) : (
        <Statistic
          title={
            <Space align="center" style={{ marginBottom: 8 }}>
              {React.cloneElement(icon, { style: { color, fontSize: 20 } })}
              <Text style={{ color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>
                {title}
              </Text>
            </Space>
          }
          value={value}
          formatter={(val) => (
            <span style={{ color, fontWeight: 700, fontSize: '28px' }}>
              {isCurrency ? formatCurrency(val) : new Intl.NumberFormat('vi-VN').format(val)}
            </span>
          )}
        />
      )}
    </Card>
  );

  return (
    <div style={{ padding: '0 12px 24px 12px', maxWidth: 1600, margin: '0 auto' }}>
      <Space align="center" style={{ marginBottom: 32 }}>
        <DashboardOutlined style={{ fontSize: 28, color: '#7c3aed' }} />
        <Title level={3} style={{ margin: 0, color: '#fff', fontWeight: 600 }}>Tổng quan hệ thống</Title>
      </Space>

      {/* HIERARCHY 1: STATISTICS */}
      <Title level={5} style={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
        Thống kê chung
      </Title>
      <Row gutter={[24, 24]} style={{ marginBottom: 40 }}>
        <Col xs={24} sm={12} lg={6}>
          {renderStatCard('Tổng doanh thu', totalRevenue, <DollarCircleOutlined />, '#10b981', loadingSummary, errorSummary, true)}
        </Col>
        <Col xs={24} sm={12} lg={6}>
          {renderStatCard('Phiếu sửa chữa', summary?.totalTickets ?? 0, <FileTextOutlined />, '#3b82f6', loadingSummary, errorSummary)}
        </Col>
        <Col xs={24} sm={12} lg={6}>
          {renderStatCard('Loại linh kiện', totalPartTypes, <AppstoreOutlined />, '#f59e0b', loadingInventory, errorInventory)}
        </Col>
        <Col xs={24} sm={12} lg={6}>
          {renderStatCard('Tồn kho', totalQuantity, <DatabaseOutlined />, '#ec4899', loadingInventory, errorInventory)}
        </Col>
      </Row>

      {/* HIERARCHY 2: REVENUE */}
      <Title level={5} style={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
        Biểu đồ doanh thu
      </Title>
      <Row gutter={[24, 24]} style={{ marginBottom: 40 }}>
        <Col span={24}>
          <Card
            bordered={false}
            style={{ background: '#16213e', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', borderRadius: 12 }}
            bodyStyle={{ padding: '32px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
              <Space>
                <LineChartOutlined style={{ color: '#7c3aed', fontSize: 22, background: 'rgba(124,58,237,0.1)', padding: 8, borderRadius: 8 }} />
                <Title level={4} style={{ margin: 0, color: '#fff', fontWeight: 600 }}>Doanh thu theo thời gian</Title>
              </Space>
              <Select 
                value={revenueFilter} 
                onChange={(val) => setRevenueFilter(val)}
                style={{ width: 160 }}
                dropdownStyle={{ background: '#1a1a2e', color: '#fff' }}
                size="large"
              >
                <Option value="7days">7 ngày qua</Option>
                <Option value="30days">30 ngày qua</Option>
                <Option value="thisMonth">Tháng này</Option>
              </Select>
            </div>

            {loadingRevenue ? (
              <Skeleton active paragraph={{ rows: 8 }} />
            ) : errorRevenue ? (
              <Alert message={errorRevenue} type="error" showIcon style={{ background: 'transparent', border: '1px solid #ef4444' }} />
            ) : revenueData.length === 0 ? (
              <div style={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.1)', borderRadius: 8 }}>
                <Text style={{ color: '#64748b', fontSize: '15px' }}>Chưa có dữ liệu doanh thu</Text>
              </div>
            ) : (
              <div style={{ height: 350, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} opacity={0.5} />
                    <XAxis dataKey="dateFormatted" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 13 }} tickLine={false} axisLine={false} dy={16} />
                    <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 13 }} tickLine={false} axisLine={false} tickFormatter={(value) => value === 0 ? '0' : `${value / 1000}k`} dx={-16} />
                    <RechartsTooltip content={<CustomLineTooltip />} cursor={{ stroke: '#4a5568', strokeWidth: 1, strokeDasharray: '3 3' }} />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#10b981" 
                      strokeWidth={4}
                      dot={{ r: 5, fill: '#16213e', stroke: '#10b981', strokeWidth: 3 }}
                      activeDot={{ r: 8, fill: '#10b981', stroke: '#fff', strokeWidth: 3, boxShadow: '0 0 10px #10b981' }}
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* HIERARCHY 3: OPERATIONS */}
      <Title level={5} style={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
        Hoạt động & Kho
      </Title>
      <Row gutter={[24, 24]}>
        {/* PIE CHART */}
        <Col xs={24} lg={8}>
          <Card
            bordered={false}
            style={{ background: '#16213e', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', borderRadius: 12, height: '100%', display: 'flex', flexDirection: 'column' }}
            bodyStyle={{ padding: '32px', flex: 1 }}
          >
            <Space style={{ marginBottom: 32 }}>
              <PieChartOutlined style={{ color: '#ec4899', fontSize: 22, background: 'rgba(236,72,153,0.1)', padding: 8, borderRadius: 8 }} />
              <Title level={4} style={{ margin: 0, color: '#fff', fontWeight: 600 }}>Tỷ lệ trạng thái</Title>
            </Space>

            {loadingStatus ? (
              <div style={{ padding: 40 }}><Skeleton.Avatar active size={200} shape="circle" style={{ display: 'block', margin: '0 auto' }} /></div>
            ) : errorStatus ? (
              <Alert message={errorStatus} type="error" showIcon style={{ background: 'transparent', border: '1px solid #ef4444' }} />
            ) : statusData.length === 0 ? (
              <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#64748b' }}>Chưa có dữ liệu</Text>
              </div>
            ) : (
              <div style={{ height: 320, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={6}
                      dataKey="value"
                      stroke="none"
                      animationDuration={1000}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || STATUS_COLORS.UNKNOWN} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomPieTooltip />} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={40}
                      iconType="circle"
                      formatter={(value) => <span style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 500 }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </Col>

        {/* INVENTORY TABLE */}
        <Col xs={24} lg={16}>
          <Card
            bordered={false}
            style={{ background: '#16213e', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', borderRadius: 12, height: '100%' }}
            bodyStyle={{ padding: '32px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Space>
                <DatabaseOutlined style={{ color: '#06b6d4', fontSize: 22, background: 'rgba(6,182,212,0.1)', padding: 8, borderRadius: 8 }} />
                <Title level={4} style={{ margin: 0, color: '#fff', fontWeight: 600 }}>Tồn kho hiện tại</Title>
              </Space>
            </div>
            
            {errorInventory ? (
              <Alert message={errorInventory} type="error" showIcon style={{ background: 'transparent', border: '1px solid #ef4444' }} />
            ) : (
              <Table 
                dataSource={inventoryData}
                columns={[
                  {
                    title: 'Tên linh kiện',
                    dataIndex: 'partName',
                    key: 'partName',
                    render: (text) => <Text style={{ color: '#e2e8f0', fontWeight: 500 }}>{text}</Text>
                  },
                  {
                    title: 'Mã',
                    dataIndex: 'partCode',
                    key: 'partCode',
                    render: (text) => <Tag color="default" style={{ background: '#1a1a2e', border: '1px solid #2d3748' }}>{text}</Tag>
                  },
                  {
                    title: 'Số lượng',
                    dataIndex: 'quantityInStock',
                    key: 'quantityInStock',
                    align: 'right',
                    render: (val) => <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{new Intl.NumberFormat('vi-VN').format(val || 0)}</Text>
                  },
                  {
                    title: 'Trạng thái',
                    key: 'status',
                    align: 'center',
                    render: (_, record) => {
                      if (record.lowStock || record.quantityInStock <= 0) {
                        return <Tag color="error" style={{ margin: 0, padding: '4px 8px', borderRadius: 4 }}>Cảnh báo tồn kho</Tag>;
                      }
                      return <Tag color="success" style={{ margin: 0, padding: '4px 8px', borderRadius: 4 }}>Còn hàng</Tag>;
                    }
                  }
                ]}
                rowKey="partId"
                pagination={{ pageSize: 5, showSizeChanger: false }}
                loading={loadingInventory}
                scroll={{ x: 600 }}
                className="dark-table dashboard-table"
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Table, Input, Button, Tag, Space, Modal, Form, Select, DatePicker,
  Descriptions, Tabs, message, Drawer, Badge, Card, Row, Col,
  Statistic, Tooltip, Typography, Divider, Timeline, Alert, Steps, Popconfirm
} from 'antd';
import {
  SearchOutlined, EyeOutlined, EditOutlined, ReloadOutlined,
  FilterOutlined, UserOutlined, FileTextOutlined, CalendarOutlined,
  ToolOutlined, CheckCircleOutlined, ClockCircleOutlined,
  ExclamationCircleOutlined, TeamOutlined, PhoneOutlined,
  MobileOutlined, HistoryOutlined, SyncOutlined
} from '@ant-design/icons';
import { ticketApi } from '../../api/ticketApi';
import { staffApi } from '../../api/staffApi';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// ─── Constants ───────────────────────────────────────────────────────────────
const STATUS_LIST = [
  { value: 'RECEIVED',   label: 'Tiếp nhận',   color: 'blue'    },
  { value: 'DIAGNOSING', label: 'Chẩn đoán',   color: 'orange'  },
  { value: 'QUOTED',     label: 'Đã báo giá',  color: 'purple'  },
  { value: 'APPROVED',   label: 'Đã duyệt',    color: 'cyan'    },
  { value: 'REPAIRING',  label: 'Đang sửa',    color: 'gold'    },
  { value: 'COMPLETED',  label: 'Hoàn tất',    color: 'green'   },
  { value: 'DELIVERED',  label: 'Đã giao',     color: 'default' },
  { value: 'CANCELLED',  label: 'Đã hủy',      color: 'red'     },
  { value: 'REJECTED',   label: 'Từ chối',     color: 'volcano' },
];
const STATUS_MAP = Object.fromEntries(STATUS_LIST.map(s => [s.value, s]));

const FLOW_STEPS = ['RECEIVED','DIAGNOSING','QUOTED','APPROVED','REPAIRING','COMPLETED','DELIVERED'];

const StatusTag = ({ status }) => {
  const s = STATUS_MAP[status] || { label: status, color: 'default' };
  return <Tag color={s.color}>{s.label}</Tag>;
};

const formatDateTime = (d) => d ? dayjs(d).format('DD/MM/YYYY HH:mm') : '—';

// ─── Timeline dot style ───────────────────────────────────────────────────────
const timelineDot = (status) => {
  if (['COMPLETED','DELIVERED'].includes(status)) return <CheckCircleOutlined style={{ color: '#16a34a' }} />;
  if (['CANCELLED','REJECTED'].includes(status)) return <ExclamationCircleOutlined style={{ color: '#dc2626' }} />;
  return <ClockCircleOutlined style={{ color: '#7c3aed' }} />;
};

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // Filters
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterStaffId, setFilterStaffId] = useState(null);
  const [filterDateRange, setFilterDateRange] = useState(null);
  const [searchText, setSearchText] = useState('');

  // Staff list for filter/assign
  const [staffList, setStaffList] = useState([]);

  // Drawer
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // Update status modal
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusForm] = Form.useForm();

  // Assign staff modal
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignForm] = Form.useForm();

  // Stats
  const [stats, setStats] = useState({});

  // Fetch staff list for filter
  useEffect(() => {
    staffApi.getAllStaff({ size: 100 }).then(res => setStaffList(res.data.data.content || [])).catch(() => {});
  }, []);

  // Build fetch params
  const buildParams = useCallback((page = 1, pageSize = 10) => {
    const p = { page: page - 1, size: pageSize };
    if (filterStatus) p.status = filterStatus;
    if (filterStaffId) p.staffId = filterStaffId;
    if (searchText) p.search = searchText;
    if (filterDateRange?.[0]) p.from = filterDateRange[0].startOf('day').toISOString();
    if (filterDateRange?.[1]) p.to = filterDateRange[1].endOf('day').toISOString();
    return p;
  }, [filterStatus, filterStaffId, filterDateRange, searchText]);

  // Fetch tickets
  const fetchTickets = useCallback(async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const params = buildParams(page, pageSize);
      const res = await ticketApi.getAllTickets(params);
      const data = res.data.data;
      setTickets(data.content || []);
      setPagination({ current: page, pageSize, total: data.totalElements || 0 });

      // Compute stats
      const all = data.content || [];
      const s = {};
      STATUS_LIST.forEach(st => { s[st.value] = all.filter(t => t.status === st.value).length; });
      setStats(s);
    } catch {
      message.error('Không thể tải danh sách phiếu sửa chữa');
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  useEffect(() => { fetchTickets(); }, [filterStatus, filterStaffId, filterDateRange]);

  // Open detail drawer
  const openDetail = async (ticket) => {
    setSelectedTicket(ticket);
    setDrawerVisible(true);
    setDetailLoading(true);
    try {
      const [detail, tl] = await Promise.all([
        ticketApi.getTicketAdmin(ticket.ticketId),
        ticketApi.getTicketTimelineAdmin(ticket.ticketId),
      ]);
      setSelectedTicket(detail.data.data);
      setTimeline(tl.data.data || []);
    } catch {
      message.error('Không thể tải chi tiết phiếu');
    } finally {
      setDetailLoading(false);
    }
  };

  // Open update status modal
  const openStatusUpdate = (ticket) => {
    setSelectedTicket(ticket);
    statusForm.setFieldsValue({ status: ticket.status, note: '' });
    setStatusModalVisible(true);
  };

  // Submit status update
  const handleStatusUpdate = async (values) => {
    setStatusLoading(true);
    try {
      const res = await ticketApi.updateTicketStatusAdmin(selectedTicket.ticketId, values);
      message.success('Cập nhật trạng thái thành công!');
      setStatusModalVisible(false);
      const updated = res.data.data;
      setSelectedTicket(updated);
      fetchTickets(pagination.current, pagination.pageSize);
      // Refresh timeline if drawer open
      if (drawerVisible) {
        const tl = await ticketApi.getTicketTimelineAdmin(updated.ticketId);
        setTimeline(tl.data.data || []);
      }
    } catch (err) {
      message.error(err.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setStatusLoading(false);
    }
  };

  // Open assign modal
  const openAssign = (ticket) => {
    setSelectedTicket(ticket);
    assignForm.setFieldsValue({ staffId: ticket.staffId || undefined });
    setAssignModalVisible(true);
  };

  // Submit assign staff
  const handleAssign = async (values) => {
    setAssignLoading(true);
    try {
      const res = await ticketApi.assignStaffToTicket(selectedTicket.ticketId, values.staffId);
      message.success('Phân công nhân viên thành công!');
      setAssignModalVisible(false);
      const updated = res.data.data;
      setSelectedTicket(updated);
      fetchTickets(pagination.current, pagination.pageSize);
    } catch (err) {
      message.error(err.response?.data?.message || 'Phân công thất bại');
    } finally {
      setAssignLoading(false);
    }
  };

  // ─── Table columns ─────────────────────────────────────────────────────────
  const columns = [
    {
      title: 'Mã phiếu',
      dataIndex: 'ticketCode',
      key: 'ticketCode',
      width: 130,
      render: c => <Text strong style={{ color: '#7c3aed', fontFamily: 'monospace' }}>{c}</Text>,
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.customerName}</div>
          <Text type="secondary" style={{ fontSize: 11 }}>
            <MobileOutlined /> {r.deviceBrand} {r.deviceModel}
          </Text>
        </div>
      ),
    },
    {
      title: 'Nhân viên',
      dataIndex: 'staffName',
      key: 'staffName',
      render: v => v
        ? <><UserOutlined style={{ color: '#7c3aed' }} /> {v}</>
        : <Text type="secondary">Chưa phân công</Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: s => <StatusTag status={s} />,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: d => formatDateTime(d),
      sorter: true,
    },
    {
      title: 'Cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: d => <Text type="secondary" style={{ fontSize: 12 }}>{formatDateTime(d)}</Text>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      render: (_, r) => (
        <Space size={4}>
          <Tooltip title="Xem chi tiết & tiến độ">
            <Button size="small" icon={<EyeOutlined />} onClick={() => openDetail(r)} />
          </Tooltip>
          <Tooltip title="Cập nhật trạng thái">
            <Button size="small" icon={<SyncOutlined />} type="primary" ghost
              onClick={() => openStatusUpdate(r)} />
          </Tooltip>
          <Tooltip title="Phân công nhân viên">
            <Button size="small" icon={<TeamOutlined />}
              style={{ color: '#059669', borderColor: '#059669' }}
              onClick={() => openAssign(r)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // ─── Progress steps ─────────────────────────────────────────────────────────
  const currentStepIndex = FLOW_STEPS.indexOf(selectedTicket?.status);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '0 4px' }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>
            <FileTextOutlined style={{ color: '#7c3aed', marginRight: 8 }} />
            Quản lý Phiếu sửa chữa
          </Title>
          <Text type="secondary">Tổng: <strong>{pagination.total}</strong> phiếu</Text>
        </Col>
        <Col>
          <Tooltip title="Làm mới">
            <Button icon={<ReloadOutlined />} onClick={() => fetchTickets(1, pagination.pageSize)} />
          </Tooltip>
        </Col>
      </Row>

      {/* Status quick-filter cards */}
      <Row gutter={8} style={{ marginBottom: 16 }}>
        {[
          { value: null, label: 'Tất cả', color: '#7c3aed' },
          { value: 'RECEIVED', label: 'Tiếp nhận', color: '#3b82f6' },
          { value: 'REPAIRING', label: 'Đang sửa', color: '#d97706' },
          { value: 'COMPLETED', label: 'Hoàn tất', color: '#16a34a' },
          { value: 'CANCELLED', label: 'Đã hủy', color: '#dc2626' },
        ].map(item => (
          <Col key={String(item.value)} span={4}>
            <Card
              size="small"
              hoverable
              onClick={() => { setFilterStatus(item.value); }}
              style={{
                cursor: 'pointer',
                textAlign: 'center',
                borderColor: filterStatus === item.value ? item.color : '#f0f0f0',
                background: filterStatus === item.value ? `${item.color}10` : '#fff',
                borderWidth: filterStatus === item.value ? 2 : 1,
              }}
            >
              <div style={{ color: item.color, fontWeight: 700, fontSize: 18 }}>
                {item.value ? (stats[item.value] || 0) : pagination.total}
              </div>
              <div style={{ fontSize: 11, color: '#666' }}>{item.label}</div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filters row */}
      <Card size="small" style={{ marginBottom: 12, background: '#fafafa' }}>
        <Row gutter={12} align="middle">
          <Col flex="1">
            <Search
              placeholder="Tìm mã phiếu, tên KH, thiết bị..."
              allowClear
              enterButton={<><SearchOutlined /> Tìm</>}
              style={{ width: '100%' }}
              onSearch={val => { setSearchText(val); fetchTickets(1, pagination.pageSize); }}
              onChange={e => { if (!e.target.value) { setSearchText(''); fetchTickets(1, pagination.pageSize); } }}
            />
          </Col>
          <Col>
            <Select
              placeholder="Lọc trạng thái"
              style={{ width: 160 }}
              allowClear
              value={filterStatus}
              onChange={val => setFilterStatus(val || null)}
            >
              {STATUS_LIST.map(s => (
                <Option key={s.value} value={s.value}>
                  <Tag color={s.color} style={{ margin: 0 }}>{s.label}</Tag>
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Select
              placeholder="Lọc nhân viên"
              style={{ width: 180 }}
              allowClear
              showSearch
              optionFilterProp="children"
              value={filterStaffId}
              onChange={val => setFilterStaffId(val || null)}
            >
              {staffList.map(s => (
                <Option key={s.staffId} value={s.staffId}>{s.fullName}</Option>
              ))}
            </Select>
          </Col>
          <Col>
            <RangePicker
              format="DD/MM/YYYY"
              placeholder={['Từ ngày', 'Đến ngày']}
              onChange={val => setFilterDateRange(val)}
              style={{ width: 240 }}
            />
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Table
        dataSource={tickets}
        columns={columns}
        rowKey="ticketId"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} phiếu`,
          onChange: (page, pageSize) => fetchTickets(page, pageSize),
        }}
        scroll={{ x: 1000 }}
        rowClassName={r => ['CANCELLED','REJECTED'].includes(r.status) ? 'cancelled-row' : ''}
      />

      {/* ============ DETAIL DRAWER ============ */}
      <Drawer
        title={
          <Space>
            <FileTextOutlined style={{ color: '#7c3aed' }} />
            <div>
              <Text strong style={{ color: '#7c3aed', fontFamily: 'monospace' }}>
                {selectedTicket?.ticketCode}
              </Text>
              <div>
                <StatusTag status={selectedTicket?.status} />
              </div>
            </div>
          </Space>
        }
        width={860}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        loading={detailLoading}
        extra={
          <Space>
            <Button icon={<SyncOutlined />} type="primary" ghost
              onClick={() => openStatusUpdate(selectedTicket)}>
              Cập nhật TT
            </Button>
            <Button icon={<TeamOutlined />} style={{ color: '#059669', borderColor: '#059669' }}
              onClick={() => openAssign(selectedTicket)}>
              Phân công
            </Button>
          </Space>
        }
      >
        {selectedTicket && (
          <Tabs defaultActiveKey="info">
            {/* ── Tab 1: Thông tin phiếu ── */}
            <TabPane tab={<span><FileTextOutlined />Thông tin</span>} key="info">
              {/* Progress tracker */}
              {!['CANCELLED','REJECTED'].includes(selectedTicket.status) && (
                <Card size="small" style={{ marginBottom: 16, background: '#f8f6ff', border: '1px solid #e9d5ff' }}>
                  <div style={{ fontSize: 12, color: '#7c3aed', fontWeight: 600, marginBottom: 8 }}>
                    Tiến độ sửa chữa
                  </div>
                  <Steps
                    size="small"
                    current={currentStepIndex >= 0 ? currentStepIndex : 0}
                    items={FLOW_STEPS.map(s => ({
                      title: STATUS_MAP[s]?.label,
                    }))}
                  />
                </Card>
              )}
              {['CANCELLED','REJECTED'].includes(selectedTicket.status) && (
                <Alert
                  message={`Phiếu đã ${STATUS_MAP[selectedTicket.status]?.label.toLowerCase()}`}
                  type="error"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              )}

              <Row gutter={16}>
                {/* Customer info */}
                <Col span={12}>
                  <Card size="small" title={<><UserOutlined /> Khách hàng</>} style={{ marginBottom: 12 }}>
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Tên">{selectedTicket.customerName}</Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
                {/* Staff info */}
                <Col span={12}>
                  <Card size="small" title={<><TeamOutlined /> Nhân viên phụ trách</>}>
                    {selectedTicket.staffName
                      ? <Text><UserOutlined style={{ color: '#7c3aed' }} /> {selectedTicket.staffName}</Text>
                      : <Alert message="Chưa phân công nhân viên" type="warning" showIcon banner />
                    }
                  </Card>
                </Col>
              </Row>

              {/* Device info */}
              <Card size="small" title={<><MobileOutlined /> Thiết bị</>} style={{ marginBottom: 12 }}>
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="Loại">{selectedTicket.deviceType}</Descriptions.Item>
                  <Descriptions.Item label="Hãng">{selectedTicket.deviceBrand}</Descriptions.Item>
                  <Descriptions.Item label="Model" span={2}>{selectedTicket.deviceModel}</Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Issue & Diagnosis */}
              <Card size="small" title={<><ToolOutlined /> Mô tả sự cố & Chẩn đoán</>}>
                <Descriptions column={1} size="small" bordered>
                  <Descriptions.Item label="Mô tả sự cố">
                    <Paragraph style={{ margin: 0 }}>{selectedTicket.issueDescription || '—'}</Paragraph>
                  </Descriptions.Item>
                  <Descriptions.Item label="Ghi chú chẩn đoán">
                    <Paragraph style={{ margin: 0 }}>{selectedTicket.diagnosisNotes || 'Chưa có'}</Paragraph>
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              <Divider style={{ margin: '12px 0' }} />
              <Descriptions size="small">
                <Descriptions.Item label={<><CalendarOutlined /> Ngày tạo</>}>
                  {formatDateTime(selectedTicket.createdAt)}
                </Descriptions.Item>
                <Descriptions.Item label="Cập nhật lúc">
                  {formatDateTime(selectedTicket.updatedAt)}
                </Descriptions.Item>
                {selectedTicket.completedAt && (
                  <Descriptions.Item label="Hoàn tất lúc">
                    {formatDateTime(selectedTicket.completedAt)}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </TabPane>

            {/* ── Tab 2: Lịch sử tiến độ ── */}
            <TabPane tab={<span><HistoryOutlined />Tiến độ ({timeline.length})</span>} key="timeline">
              {timeline.length === 0
                ? <Alert message="Chưa có lịch sử thay đổi trạng thái" type="info" showIcon />
                : (
                  <Timeline mode="left" style={{ paddingTop: 16 }}>
                    {[...timeline].reverse().map((item) => (
                      <Timeline.Item
                        key={item.historyId}
                        dot={timelineDot(item.status)}
                        label={<Text type="secondary" style={{ fontSize: 11 }}>
                          {formatDateTime(item.changedAt)}
                        </Text>}
                      >
                        <div>
                          <StatusTag status={item.status} />
                          {item.changedBy && (
                            <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                              bởi {item.changedBy}
                            </Text>
                          )}
                        </div>
                        {item.note && (
                          <div style={{ marginTop: 4, color: '#666', fontSize: 13 }}>
                            💬 {item.note}
                          </div>
                        )}
                      </Timeline.Item>
                    ))}
                  </Timeline>
                )
              }
            </TabPane>
          </Tabs>
        )}
      </Drawer>

      {/* ============ UPDATE STATUS MODAL ============ */}
      <Modal
        title={
          <Space>
            <SyncOutlined style={{ color: '#7c3aed' }} />
            Cập nhật trạng thái phiếu <Text code>{selectedTicket?.ticketCode}</Text>
          </Space>
        }
        open={statusModalVisible}
        onCancel={() => setStatusModalVisible(false)}
        footer={null}
        width={480}
      >
        <Alert
          message="Thay đổi trạng thái sẽ được ghi lại vào lịch sử phiếu sửa chữa."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Form form={statusForm} layout="vertical" onFinish={handleStatusUpdate}>
          <Form.Item label="Trạng thái hiện tại">
            <StatusTag status={selectedTicket?.status} />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái mới"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
            <Select size="large" placeholder="Chọn trạng thái mới">
              {STATUS_LIST.map(s => (
                <Option key={s.value} value={s.value}>
                  <Tag color={s.color}>{s.label}</Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="note" label="Ghi chú (tuỳ chọn)">
            <Input.TextArea rows={3} placeholder="Lý do thay đổi trạng thái..." />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setStatusModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={statusLoading}
                style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', border: 'none' }}>
                <CheckCircleOutlined /> Xác nhận cập nhật
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* ============ ASSIGN STAFF MODAL ============ */}
      <Modal
        title={
          <Space>
            <TeamOutlined style={{ color: '#059669' }} />
            Phân công nhân viên — <Text code>{selectedTicket?.ticketCode}</Text>
          </Space>
        }
        open={assignModalVisible}
        onCancel={() => setAssignModalVisible(false)}
        footer={null}
        width={440}
      >
        {selectedTicket?.staffName && (
          <Alert
            message={`Hiện đang được phụ trách bởi: ${selectedTicket.staffName}`}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        <Form form={assignForm} layout="vertical" onFinish={handleAssign}>
          <Form.Item name="staffId" label="Chọn nhân viên phụ trách"
            rules={[{ required: true, message: 'Vui lòng chọn nhân viên' }]}>
            <Select
              size="large"
              showSearch
              placeholder="Tìm và chọn nhân viên..."
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children?.toString().toLowerCase().includes(input.toLowerCase())
              }
            >
              {staffList.filter(s => s.status === 'ACTIVE').map(s => (
                <Option key={s.staffId} value={s.staffId}>
                  <UserOutlined style={{ color: '#7c3aed', marginRight: 6 }} />
                  {s.fullName}
                  <Tag color="blue" style={{ marginLeft: 8, fontSize: 11 }}>
                    {s.position === 'TECHNICIAN' ? 'KTV' : s.position === 'MANAGER' ? 'QL' : 'LT'}
                  </Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setAssignModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={assignLoading}
                style={{ background: '#059669', border: 'none' }}>
                <CheckCircleOutlined /> Xác nhận phân công
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

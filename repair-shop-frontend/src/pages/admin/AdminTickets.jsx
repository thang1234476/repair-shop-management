import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Table, Input, Button, Tag, Space, Modal, Form, Select, DatePicker,
  Descriptions, Tabs, message, Drawer, Badge, Card, Row, Col,
  Statistic, Tooltip, Typography, Divider, Timeline, Alert, Steps, Popconfirm, Spin
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

  // Fetch staff list for filter
  useEffect(() => {
    staffApi.getAllStaff({ size: 100 }).then(res => setStaffList(res.data.data.content || [])).catch(() => {});
  }, []);

  // Build fetch params — all filters are sent as AND conditions to backend
  const buildParams = useCallback((page = 1, pageSize = 10) => {
    const p = { page: page - 1, size: pageSize };
    if (filterStatus) p.status = filterStatus;
    // staffId phải là số nguyên — parse parseInt để tránh gửi string
    if (filterStaffId != null) p.staffId = parseInt(filterStaffId, 10);
    if (searchText) p.search = searchText;
    // Spring @DateTimeFormat(iso=DATE_TIME) cần format: 2024-01-01T00:00:00
    // không có Z suffix — dùng format() thay vì toISOString()
    if (filterDateRange?.[0]) p.from = filterDateRange[0].startOf('day').format('YYYY-MM-DDTHH:mm:ss');
    if (filterDateRange?.[1]) p.to   = filterDateRange[1].endOf('day').format('YYYY-MM-DDTHH:mm:ss');
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
    } catch {
      message.error('Không thể tải danh sách phiếu sửa chữa');
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  useEffect(() => { fetchTickets(1, 10); }, [filterStatus, filterStaffId, filterDateRange, fetchTickets]);
  // NOTE: searchText không vào dep này — search chỉ trigger bằng nút Tìm (onSearch)

  const handleRefresh = () => {
    fetchTickets(1, pagination.pageSize);
  };

  // Reset tất cả filter về mặc định
  const handleResetFilters = useCallback(async () => {
    setSearchText('');
    setFilterStatus(null);
    setFilterStaffId(null);
    setFilterDateRange(null);
    // Gọi API trực tiếp với params rống
    setLoading(true);
    try {
      const res = await ticketApi.getAllTickets({ page: 0, size: pagination.pageSize });
      const data = res.data.data;
      setTickets(data.content || []);
      setPagination(prev => ({ ...prev, current: 1, total: data.totalElements || 0 }));
    } catch {
      message.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [pagination.pageSize]);

  const hasActiveFilters = searchText || filterStatus || filterStaffId || filterDateRange;

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
        <Space size={8}>
          <Tooltip title="Xem chi tiết">
            <Button size="small" type="primary" ghost icon={<EyeOutlined />} onClick={() => openDetail(r)} style={{ borderRadius: 6 }} />
          </Tooltip>
          <Tooltip title="Cập nhật trạng thái">
            <Button size="small" type="default" icon={<SyncOutlined />} style={{ borderRadius: 6, background: '#1e293b', color: '#3b82f6', borderColor: '#3b82f6' }} onClick={() => openStatusUpdate(r)} />
          </Tooltip>
          <Tooltip title="Phân công nhân viên">
            <Button size="small" icon={<TeamOutlined />} style={{ borderRadius: 6, color: '#10b981', borderColor: '#10b981', background: '#1e293b' }} onClick={() => openAssign(r)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // ─── Progress steps ─────────────────────────────────────────────────────────
  const currentStepIndex = FLOW_STEPS.indexOf(selectedTicket?.status);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '0 12px', maxWidth: 1600, margin: '0 auto' }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space align="start" size="middle">
            <div style={{ padding: '10px 14px', background: 'rgba(124, 58, 237, 0.15)', borderRadius: 12 }}>
              <FileTextOutlined style={{ fontSize: 26, color: '#a855f7' }} />
            </div>
            <div>
              <Title level={3} style={{ margin: 0, color: '#fff', fontWeight: 600 }}>Quản lý Phiếu sửa chữa</Title>
              <Text style={{ color: '#94a3b8' }}>Theo dõi và quản lý toàn bộ phiếu sửa chữa trong hệ thống</Text>
            </div>
          </Space>
        </Col>
        <Col>
          <Button
            type="primary"
            ghost
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            style={{ borderRadius: 8, borderColor: '#a855f7', color: '#a855f7' }}
          >
            Làm mới
          </Button>
        </Col>
      </Row>

      <Card
        variant="borderless"
        style={{
          background: '#16213e',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          borderRadius: 12,
        }}
        styles={{ body: { padding: '24px' } }}
      >
        {/* Filters row */}
        <div style={{ marginBottom: 20 }}>
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} sm={24} md={8} lg={8}>
              <Search
                placeholder="Tìm mã phiếu, khách hàng, SĐT..."
                allowClear
                value={searchText}
                enterButton={
                  <Button type="primary" icon={<SearchOutlined />} style={{ background: '#7c3aed', borderColor: '#7c3aed' }}>
                    Tìm
                  </Button>
                }
                size="large"
                onSearch={async (val) => {
                  setSearchText(val);
                  // Gọi API trực tiếp với search value mới — tránh stale closure
                  setLoading(true);
                  try {
                    const p = { page: 0, size: pagination.pageSize };
                    if (val) p.search = val;
                    if (filterStatus) p.status = filterStatus;
                    if (filterStaffId != null) p.staffId = parseInt(filterStaffId, 10);
                    if (filterDateRange?.[0]) p.from = filterDateRange[0].startOf('day').format('YYYY-MM-DDTHH:mm:ss');
                    if (filterDateRange?.[1]) p.to   = filterDateRange[1].endOf('day').format('YYYY-MM-DDTHH:mm:ss');
                    const res = await ticketApi.getAllTickets(p);
                    const data = res.data.data;
                    setTickets(data.content || []);
                    setPagination(prev => ({ ...prev, current: 1, total: data.totalElements || 0 }));
                  } catch {
                    message.error('Không thể tìm kiếm');
                  } finally {
                    setLoading(false);
                  }
                }}
                onChange={e => {
                  const val = e.target.value;
                  setSearchText(val);
                }}
                style={{ width: '100%' }}
              />
            </Col>
            <Col xs={24} sm={12} md={4} lg={4}>
              <Select
                placeholder="Tất cả trạng thái"
                size="large"
                style={{ width: '100%' }}
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
            <Col xs={24} sm={12} md={4} lg={4}>
              <Select
                placeholder="Tất cả nhân viên"
                size="large"
                style={{ width: '100%' }}
                allowClear
                showSearch
                optionFilterProp="children"
                value={filterStaffId}
                onChange={val => setFilterStaffId(val != null ? parseInt(val, 10) : null)}
              >
                {staffList.map(s => (
                  <Option key={s.staffId} value={s.staffId}>{s.fullName}</Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={5} lg={5}>
              <RangePicker
                size="large"
                format="DD/MM/YYYY"
                placeholder={['Từ ngày', 'Đến ngày']}
                value={filterDateRange}
                onChange={val => setFilterDateRange(val)}
                style={{ width: '100%' }}
              />
            </Col>
            <Col xs={24} sm={12} md={3} lg={3}>
              <Button
                size="large"
                icon={<ReloadOutlined />}
                onClick={handleResetFilters}
                disabled={!hasActiveFilters}
                style={{
                  width: '100%',
                  borderRadius: 8,
                  background: hasActiveFilters ? 'rgba(239,68,68,0.1)' : 'transparent',
                  borderColor: hasActiveFilters ? '#ef4444' : '#334155',
                  color: hasActiveFilters ? '#ef4444' : '#64748b',
                  transition: 'all 0.2s',
                }}
              >
                Xóa lọc
              </Button>
            </Col>
          </Row>

          {/* Active filter summary */}
          {hasActiveFilters && (
            <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <Text style={{ color: '#64748b', fontSize: 12 }}>Đang lọc:</Text>
              {searchText && <Tag closable onClose={() => { setSearchText(''); fetchTickets(1, 10); }} color="purple">Từ khóa: "{searchText}"</Tag>}
              {filterStatus && <Tag closable onClose={() => setFilterStatus(null)} color={STATUS_MAP[filterStatus]?.color}>{STATUS_MAP[filterStatus]?.label}</Tag>}
              {filterStaffId != null && <Tag closable onClose={() => setFilterStaffId(null)} color="blue">{staffList.find(s => s.staffId === filterStaffId)?.fullName || 'Nhân viên'}</Tag>}
              {filterDateRange && <Tag closable onClose={() => setFilterDateRange(null)} color="cyan">{filterDateRange[0]?.format('DD/MM/YYYY')} → {filterDateRange[1]?.format('DD/MM/YYYY')}</Tag>}
              <Text style={{ color: '#94a3b8', fontSize: 12 }}>• {pagination.total} kết quả</Text>
            </div>
          )}
        </div>

        {/* Table */}
        <Table
          dataSource={tickets}
          columns={columns}
          rowKey="ticketId"
          loading={{
            indicator: <Spin indicator={<SyncOutlined spin />} tip="Đang tải dữ liệu..." />,
            spinning: loading
          }}
          locale={{
            emptyText: (
              <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <FileTextOutlined style={{ fontSize: 48, color: '#334155', marginBottom: 16, display: 'block' }} />
                <Text style={{ color: '#64748b', fontSize: 15 }}>Không tìm thấy phiếu sửa chữa phù hợp</Text>
                {hasActiveFilters && (
                  <div style={{ marginTop: 12 }}>
                    <Button size="small" onClick={handleResetFilters} style={{ color: '#a855f7', borderColor: '#a855f7' }}>
                      Xóa bộ lọc
                    </Button>
                  </div>
                )}
              </div>
            )
          }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} phiếu`,
            onChange: (page, pageSize) => fetchTickets(page, pageSize),
          }}
          scroll={{ x: 1000 }}
          className="dark-table"
        />
      </Card>

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
        size="large"
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

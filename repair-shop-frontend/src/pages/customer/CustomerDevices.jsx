import React, { useState, useEffect } from 'react';
import { Spin, Modal, Form, Input, Select, Button, message, Drawer, Descriptions } from 'antd';
import { PlusOutlined, MobileOutlined, EditOutlined, InfoCircleOutlined, HistoryOutlined } from '@ant-design/icons';
import { customerApi } from '../../api/customerApi';
import { ticketApi } from '../../api/ticketApi';
import DeviceCard from '../../components/modern/DeviceCard';
import TicketCard from '../../components/modern/TicketCard';
import { formatDate } from '../../utils/helpers';

const BASE = '/customer';

const DEVICE_TYPES = [
  { value: 'LAPTOP',   label: 'Laptop' },
  { value: 'MOBILE',   label: 'Điện thoại' },
  { value: 'PC',       label: 'Máy tính bàn' },
  { value: 'TABLET',   label: 'Máy tính bảng' },
  { value: 'PRINTER',  label: 'Máy in' },
];

export default function CustomerDevices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Device Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Edit Device Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [editForm] = Form.useForm();
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Detail Modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailDevice, setDetailDevice] = useState(null);

  // History Drawer
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deviceHistory, setDeviceHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await customerApi.getMyDevices();
      setDevices(res.data.data || []);
    } catch {
      message.error('Lỗi tải danh sách thiết bị');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDevice = async (values) => {
    setSubmitting(true);
    try {
      await customerApi.addDevice(values);
      message.success('✅ Thêm thiết bị thành công!');
      setModalOpen(false);
      form.resetFields();
      fetchDevices();
    } catch {
      message.error('Lỗi khi thêm thiết bị');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditDevice = async (values) => {
    if (!editingDevice) return;
    const deviceId = editingDevice.deviceId || editingDevice.id;
    setEditSubmitting(true);
    try {
      await customerApi.updateDevice(deviceId, values);
      message.success('✅ Cập nhật thiết bị thành công!');
      setEditModalOpen(false);
      setEditingDevice(null);
      editForm.resetFields();
      fetchDevices();
      if (detailDevice && (detailDevice.deviceId || detailDevice.id) === deviceId) {
        setDetailDevice(prev => ({ ...prev, ...values }));
      }
    } catch {
      message.error('Lỗi khi cập nhật thiết bị');
    } finally {
      setEditSubmitting(false);
    }
  };

  const openEdit = (device) => {
    setEditingDevice(device);
    editForm.setFieldsValue({
      deviceType: device.deviceType,
      brand: device.brand,
      model: device.model,
      serialNumber: device.serialNumber,
      imei: device.imei,
      initialCondition: device.initialCondition,
    });
    setEditModalOpen(true);
  };

  const openDetail = (device) => {
    setDetailDevice(device);
    setDetailModalOpen(true);
  };

  const openHistory = async (device) => {
    setSelectedDevice(device);
    setDrawerOpen(true);
    setHistoryLoading(true);
    const deviceId = device.deviceId || device.id;
    try {
      const res = await customerApi.getDeviceHistory(deviceId);
      setDeviceHistory(res.data.data || []);
    } catch {
      try {
        const res = await ticketApi.getMyTickets({ deviceId: deviceId, size: 20 });
        setDeviceHistory(res.data.data.content || []);
      } catch {
        setDeviceHistory([]);
      }
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div>
      {/* ── Header ── */}
      <div className="mc-flex-between mc-mb-24" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 4 }}>
            Thiết bị của tôi
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
            Quản lý các thiết bị điện tử của bạn
          </p>
        </div>
        <button
          className="mc-btn-primary"
          onClick={() => setModalOpen(true)}
        >
          <PlusOutlined /> Thêm thiết bị
        </button>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <Spin size="large" />
        </div>
      ) : devices.length === 0 ? (
        <div className="mc-card">
          <div className="mc-empty">
            <div className="mc-empty-icon">📱</div>
            <div className="mc-empty-title">Chưa có thiết bị nào</div>
            <div className="mc-empty-desc">
              Thêm thiết bị để chúng tôi có thể theo dõi lịch sử sửa chữa và giúp bạn tốt hơn.
            </div>
            <button className="mc-btn-primary" onClick={() => setModalOpen(true)}>
              <PlusOutlined /> Thêm thiết bị đầu tiên
            </button>
          </div>
        </div>
      ) : (
        <div className="mc-grid-3">
          {devices.map(device => (
            <DeviceCard
              key={device.deviceId || device.id}
              device={device}
              basePath={BASE}
              onViewDetail={openDetail}
              onViewHistory={openHistory}
              onEdit={openEdit}
            />
          ))}

          {/* Add new device card */}
          <div
            className="mc-device-card"
            style={{
              border: '2px dashed #e5e7eb',
              boxShadow: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 200,
              cursor: 'pointer',
              color: '#9ca3af',
              gap: 12,
            }}
            onClick={() => setModalOpen(true)}
          >
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              border: '2px dashed #d1d5db',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 24, color: '#d1d5db',
            }}>
              <PlusOutlined />
            </div>
            <span style={{ fontSize: 14, fontWeight: 500 }}>Thêm thiết bị mới</span>
          </div>
        </div>
      )}

      {/* ── Add Device Modal ── */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: '#eef2ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
              <MobileOutlined />
            </div>
            <span style={{ fontWeight: 700, color: '#111827' }}>Thêm thiết bị mới</span>
          </div>
        }
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        footer={null}
        width={520}
        style={{ borderRadius: 16 }}
      >
        <Form form={form} layout="vertical" onFinish={handleAddDevice} style={{ marginTop: 16 }}>
          <Form.Item
            name="deviceType"
            label={<span style={{ fontWeight: 500 }}>Loại thiết bị</span>}
            rules={[{ required: true, message: 'Vui lòng chọn loại thiết bị' }]}
          >
            <Select placeholder="Chọn loại thiết bị" size="large" options={DEVICE_TYPES} />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item
              name="brand"
              label={<span style={{ fontWeight: 500 }}>Hãng sản xuất</span>}
              rules={[{ required: true, message: 'Vui lòng nhập hãng' }]}
            >
              <Input placeholder="VD: HP, Apple, Samsung..." size="large" />
            </Form.Item>
            <Form.Item
              name="model"
              label={<span style={{ fontWeight: 500 }}>Model / Tên máy</span>}
              rules={[{ required: true, message: 'Vui lòng nhập model' }]}
            >
              <Input placeholder="VD: EliteBook 840, iPhone 13..." size="large" />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item
              name="serialNumber"
              label={<span style={{ fontWeight: 500 }}>Số Serial <span style={{ color: '#9ca3af', fontWeight: 400 }}>(tuỳ chọn)</span></span>}
            >
              <Input placeholder="VD: C02DW0R6MD6T..." size="large" />
            </Form.Item>
            <Form.Item
              name="imei"
              label={<span style={{ fontWeight: 500 }}>Số IMEI <span style={{ color: '#9ca3af', fontWeight: 400 }}>(tuỳ chọn)</span></span>}
            >
              <Input placeholder="VD: 356984112345678..." size="large" />
            </Form.Item>
          </div>

          <Form.Item
            name="initialCondition"
            label={<span style={{ fontWeight: 500 }}>Tình trạng ban đầu / Ghi chú <span style={{ color: '#9ca3af', fontWeight: 400 }}>(tuỳ chọn)</span></span>}
          >
            <Input.TextArea rows={3} placeholder="Mô tả tình trạng ngoại quan, trầy xước hoặc lỗi sơ bộ..." />
          </Form.Item>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button onClick={() => { setModalOpen(false); form.resetFields(); }}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              style={{ background: '#4f46e5', borderColor: '#4f46e5' }}
            >
              Thêm thiết bị
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ── Edit Device Modal ── */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: '#eef2ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
              <EditOutlined />
            </div>
            <span style={{ fontWeight: 700, color: '#111827' }}>Cập nhật thông tin thiết bị</span>
          </div>
        }
        open={editModalOpen}
        onCancel={() => { setEditModalOpen(false); setEditingDevice(null); editForm.resetFields(); }}
        footer={null}
        width={520}
        style={{ borderRadius: 16 }}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditDevice} style={{ marginTop: 16 }}>
          <Form.Item
            name="deviceType"
            label={<span style={{ fontWeight: 500 }}>Loại thiết bị</span>}
            rules={[{ required: true, message: 'Vui lòng chọn loại thiết bị' }]}
          >
            <Select placeholder="Chọn loại thiết bị" size="large" options={DEVICE_TYPES} />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item
              name="brand"
              label={<span style={{ fontWeight: 500 }}>Hãng sản xuất</span>}
              rules={[{ required: true, message: 'Vui lòng nhập hãng' }]}
            >
              <Input placeholder="VD: HP, Apple, Samsung..." size="large" />
            </Form.Item>
            <Form.Item
              name="model"
              label={<span style={{ fontWeight: 500 }}>Model / Tên máy</span>}
              rules={[{ required: true, message: 'Vui lòng nhập model' }]}
            >
              <Input placeholder="VD: EliteBook 840, iPhone 13..." size="large" />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item
              name="serialNumber"
              label={<span style={{ fontWeight: 500 }}>Số Serial</span>}
            >
              <Input placeholder="VD: C02DW0R6MD6T..." size="large" />
            </Form.Item>
            <Form.Item
              name="imei"
              label={<span style={{ fontWeight: 500 }}>Số IMEI</span>}
            >
              <Input placeholder="VD: 356984112345678..." size="large" />
            </Form.Item>
          </div>

          <Form.Item
            name="initialCondition"
            label={<span style={{ fontWeight: 500 }}>Tình trạng ban đầu / Ghi chú</span>}
          >
            <Input.TextArea rows={3} placeholder="Mô tả tình trạng ngoại quan, trầy xước..." />
          </Form.Item>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button onClick={() => { setEditModalOpen(false); setEditingDevice(null); editForm.resetFields(); }}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={editSubmitting}
              style={{ background: '#4f46e5', borderColor: '#4f46e5' }}
            >
              Lưu thay đổi
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ── View Device Detail Modal ── */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: '#eef2ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
              <InfoCircleOutlined />
            </div>
            <span style={{ fontWeight: 700, color: '#111827' }}>Chi tiết thiết bị</span>
          </div>
        }
        open={detailModalOpen}
        onCancel={() => { setDetailModalOpen(false); setDetailDevice(null); }}
        width={560}
        style={{ borderRadius: 16 }}
        footer={[
          <Button
            key="history"
            icon={<HistoryOutlined />}
            onClick={() => {
              const d = detailDevice;
              setDetailModalOpen(false);
              openHistory(d);
            }}
          >
            Xem lịch sử sửa chữa
          </Button>,
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            style={{ background: '#4f46e5', borderColor: '#4f46e5' }}
            onClick={() => {
              const d = detailDevice;
              setDetailModalOpen(false);
              openEdit(d);
            }}
          >
            Chỉnh sửa
          </Button>,
        ]}
      >
        {detailDevice && (
          <div style={{ marginTop: 16 }}>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Loại thiết bị">
                <strong>{detailDevice.deviceType}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Hãng sản xuất">
                {detailDevice.brand || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Model / Tên máy">
                {detailDevice.model || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Số Serial">
                <code>{detailDevice.serialNumber || 'Chưa cập nhật'}</code>
              </Descriptions.Item>
              <Descriptions.Item label="Số IMEI">
                <code>{detailDevice.imei || 'Chưa cập nhật'}</code>
              </Descriptions.Item>
              <Descriptions.Item label="Tình trạng ban đầu">
                {detailDevice.initialCondition || 'Không có ghi chú'}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tiếp nhận">
                {formatDate(detailDevice.createdAt)}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* ── Device History Drawer ── */}
      <Drawer
        title={
          selectedDevice && (
            <div>
              <div style={{ fontWeight: 700, color: '#111827' }}>
                {selectedDevice.brand} {selectedDevice.model}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 400, marginTop: 2 }}>
                Lịch sử sửa chữa
              </div>
            </div>
          )
        }
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setSelectedDevice(null); setDeviceHistory([]); }}
        width={480}
        bodyStyle={{ padding: 0 }}
      >
        {historyLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <Spin />
          </div>
        ) : deviceHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <div style={{ fontWeight: 600, color: '#374151' }}>Chưa có lịch sử sửa chữa</div>
            <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 6 }}>Thiết bị này chưa được sửa chữa lần nào</div>
          </div>
        ) : (
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {deviceHistory.map(ticket => (
              <TicketCard key={ticket.ticketId || ticket.id} ticket={ticket} basePath={BASE} />
            ))}
          </div>
        )}
      </Drawer>
    </div>
  );
}

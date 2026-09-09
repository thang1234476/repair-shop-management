import React, { useState, useEffect } from 'react';
import { Spin, Modal, Form, Input, Select, Button, message, Drawer } from 'antd';
import { PlusOutlined, MobileOutlined } from '@ant-design/icons';
import { customerApi } from '../../api/customerApi';
import { ticketApi } from '../../api/ticketApi';
import DeviceCard from '../../components/modern/DeviceCard';
import TicketCard from '../../components/modern/TicketCard';

const BASE = '/customer-new';

const DEVICE_TYPES = [
  { value: 'LAPTOP',   label: 'Laptop' },
  { value: 'MOBILE',   label: 'Điện thoại' },
  { value: 'PC',       label: 'Máy tính bàn' },
  { value: 'TABLET',   label: 'Máy tính bảng' },
  { value: 'PRINTER',  label: 'Máy in' },
];

export default function ModernDevices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deviceHistory, setDeviceHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

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

  const openHistory = async (device) => {
    setSelectedDevice(device);
    setDrawerOpen(true);
    setHistoryLoading(true);
    try {
      const res = await customerApi.getDeviceHistory(device.id);
      setDeviceHistory(res.data.data || []);
    } catch {
      // getDeviceHistory might not exist yet; fall back to ticket search
      try {
        const res = await ticketApi.getMyTickets({ deviceId: device.id, size: 20 });
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
            <div
              key={device.id}
              onClick={() => openHistory(device)}
            >
              <DeviceCard device={device} basePath={BASE} />
            </div>
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
        width={480}
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

          <Form.Item
            name="serialNumber"
            label={<span style={{ fontWeight: 500 }}>Số Serial / IMEI <span style={{ color: '#9ca3af', fontWeight: 400 }}>(tuỳ chọn)</span></span>}
          >
            <Input placeholder="Nhập số serial hoặc IMEI nếu có" size="large" />
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
              <TicketCard key={ticket.id} ticket={ticket} basePath={BASE} />
            ))}
          </div>
        )}
      </Drawer>
    </div>
  );
}

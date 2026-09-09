import React, { useState } from 'react';
import { Modal, Form, Input, Select, DatePicker, message, Button } from 'antd';
import { CheckCircleOutlined, CalendarOutlined, PhoneOutlined, UserOutlined, LaptopOutlined } from '@ant-design/icons';

const DEVICE_TYPES = [
  { value: 'LAPTOP', label: 'Laptop / Notebook' },
  { value: 'PC', label: 'Máy tính bàn (PC / Workstation)' },
  { value: 'PHONE', label: 'Điện thoại thông minh (iPhone, Android...)' },
  { value: 'TABLET', label: 'Máy tính bảng (iPad, Galaxy Tab...)' },
  { value: 'OTHER', label: 'Thiết bị điện tử khác' },
];

export default function BookingModal({ open, onCancel }) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookingCode, setBookingCode] = useState('');

  const handleSubmit = async (values) => {
    setSubmitting(true);
    // Simulate booking submission
    setTimeout(() => {
      setSubmitting(false);
      const code = 'BK-' + Math.floor(100000 + Math.random() * 900000);
      setBookingCode(code);
      setSuccess(true);
      form.resetFields();
    }, 800);
  };

  const handleClose = () => {
    setSuccess(false);
    onCancel();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={520}
      centered
      style={{ borderRadius: 16 }}
    >
      {!success ? (
        <div style={{ padding: '8px 4px' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: '#eef2ff', color: '#4f46e5',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, marginBottom: 12
            }}>
              <CalendarOutlined />
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Đặt Lịch Sửa Chữa
            </h3>
            <p style={{ color: '#64748b', fontSize: 14, marginTop: 6, margin: 0 }}>
              Để lại thông tin, kỹ thuật viên sẽ chuẩn bị và ưu tiên tiếp nhận thiết bị của bạn.
            </p>
          </div>

          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Form.Item
                name="fullName"
                label={<span style={{ fontWeight: 600 }}>Họ và tên</span>}
                rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
              >
                <Input prefix={<UserOutlined style={{ color: '#94a3b8' }} />} placeholder="Nguyễn Văn A" size="large" />
              </Form.Item>

              <Form.Item
                name="phone"
                label={<span style={{ fontWeight: 600 }}>Số điện thoại</span>}
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
              >
                <Input prefix={<PhoneOutlined style={{ color: '#94a3b8' }} />} placeholder="0912 345 678" size="large" />
              </Form.Item>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Form.Item
                name="deviceType"
                label={<span style={{ fontWeight: 600 }}>Loại thiết bị</span>}
                rules={[{ required: true, message: 'Vui lòng chọn thiết bị' }]}
              >
                <Select placeholder="Chọn thiết bị" size="large" options={DEVICE_TYPES} />
              </Form.Item>

              <Form.Item
                name="preferredDate"
                label={<span style={{ fontWeight: 600 }}>Ngày hẹn dự kiến</span>}
              >
                <DatePicker placeholder="Chọn ngày" size="large" style={{ width: '100%' }} />
              </Form.Item>
            </div>

            <Form.Item
              name="issue"
              label={<span style={{ fontWeight: 600 }}>Mô tả tình trạng lỗi / nhu cầu</span>}
              rules={[{ required: true, message: 'Vui lòng mô tả sơ bộ lỗi' }]}
            >
              <Input.TextArea rows={3} placeholder="VD: Máy bật không lên nguồn, quạt kêu to, cần thay pin..." />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={submitting}
              style={{
                background: '#4f46e5',
                borderColor: '#4f46e5',
                height: 46,
                fontWeight: 600,
                borderRadius: 10,
                marginTop: 8
              }}
            >
              Xác Nhận Đặt Lịch Hẹn
            </Button>
          </Form>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '24px 8px' }}>
          <CheckCircleOutlined style={{ fontSize: 56, color: '#10b981', marginBottom: 16 }} />
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
            Đặt Lịch Thành Công!
          </h3>
          <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20 }}>
            Mã đặt lịch hẹn của bạn là:
          </p>
          <div style={{
            background: '#f8fafc',
            border: '2px dashed #cbd5e1',
            borderRadius: 12,
            padding: '12px 24px',
            fontSize: 22,
            fontWeight: 800,
            color: '#4f46e5',
            letterSpacing: 2,
            display: 'inline-block',
            marginBottom: 20
          }}>
            {bookingCode}
          </div>
          <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.6, maxWidth: 380, margin: '0 auto 24px' }}>
            Kỹ thuật viên sẽ liên hệ với bạn trong thời gian sớm nhất để xác nhận thông tin.
          </p>
          <Button
            type="primary"
            onClick={handleClose}
            style={{ background: '#4f46e5', borderRadius: 10, padding: '0 28px' }}
          >
            Đã Hiểu & Đóng
          </Button>
        </div>
      )}
    </Modal>
  );
}

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Spin, Avatar, Modal, DatePicker, Select } from 'antd';
import {
  UserOutlined, MailOutlined, PhoneOutlined,
  HomeOutlined, LockOutlined, LogoutOutlined,
  EditOutlined, CheckOutlined, CalendarOutlined,
  ManOutlined, FileTextOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { customerApi } from '../../api/customerApi';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const GENDER_OPTIONS = [
  { value: 'MALE',   label: 'Nam' },
  { value: 'FEMALE', label: 'Nữ' },
  { value: 'OTHER',  label: 'Khác' },
];

function SectionCard({ title, children }) {
  return (
    <div className="mc-card mc-mb-16">
      <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid #f3f4f6' }}>
        {title}
      </div>
      {children}
    </div>
  );
}

export default function CustomerProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileForm] = Form.useForm();
  const [pwForm] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [pwLoading, setPwLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await customerApi.getProfile();
      const data = res.data?.data || {};
      setProfile(data);
      profileForm.setFieldsValue({
        fullName: data.fullName || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        dateOfBirth: data.dateOfBirth ? dayjs(data.dateOfBirth) : null,
        gender: data.gender || null,
        note: data.note || '',
      });
    } catch {
      message.error('Lỗi khi tải thông tin hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSaveProfile = async (values) => {
    setSaving(true);
    try {
      const payload = {
        fullName: values.fullName,
        phone: values.phone,
        address: values.address,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null,
        gender: values.gender,
        note: values.note,
      };
      await customerApi.updateProfile(payload);
      message.success('✅ Cập nhật thành công!');
      setEditing(false);
      await loadProfile();
    } catch {
      message.error('Lỗi cập nhật hồ sơ');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    if (profile) {
      profileForm.setFieldsValue({
        fullName: profile.fullName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        dateOfBirth: profile.dateOfBirth ? dayjs(profile.dateOfBirth) : null,
        gender: profile.gender || null,
        note: profile.note || '',
      });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      {/* ── Header / Avatar section ── */}
      <div className="mc-card mc-mb-16" style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '24px' }}>
        <Avatar
          size={72}
          icon={<UserOutlined />}
          style={{ background: '#4f46e5', flexShrink: 0, fontSize: 28 }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#111827', letterSpacing: '-0.3px' }}>
            {profile?.fullName || user?.fullName}
          </div>
          <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
            {profile?.email || user?.email}
          </div>
          <div style={{ marginTop: 8 }}>
            <span style={{
              fontSize: 12, fontWeight: 600,
              background: '#eef2ff', color: '#4f46e5',
              padding: '2px 10px', borderRadius: 100,
            }}>
              Khách hàng
            </span>
          </div>
        </div>
        {!editing && (
          <button
            className="mc-btn-secondary"
            style={{ fontSize: 13, flexShrink: 0 }}
            onClick={() => setEditing(true)}
          >
            <EditOutlined /> Chỉnh sửa
          </button>
        )}
      </div>

      {/* ── Thông tin cá nhân ── */}
      <SectionCard title="📋 Thông tin cá nhân">
        <Form form={profileForm} layout="vertical" onFinish={handleSaveProfile}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item
              name="fullName"
              label={<span style={{ fontWeight: 500 }}>Họ và tên</span>}
              rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
              style={{ gridColumn: 'span 2' }}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#9ca3af' }} />}
                size="large"
                disabled={!editing}
                style={{ background: editing ? '#fff' : '#f9fafb' }}
              />
            </Form.Item>

            <Form.Item
              name="email"
              label={<span style={{ fontWeight: 500 }}>Email tài khoản <span style={{ color: '#9ca3af', fontWeight: 400 }}>(chỉ đọc)</span></span>}
              style={{ gridColumn: 'span 2' }}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#9ca3af' }} />}
                size="large"
                disabled
                style={{ background: '#f3f4f6', color: '#6b7280', cursor: 'not-allowed' }}
              />
            </Form.Item>

            <Form.Item
              name="phone"
              label={<span style={{ fontWeight: 500 }}>Số điện thoại</span>}
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
            >
              <Input
                prefix={<PhoneOutlined style={{ color: '#9ca3af' }} />}
                size="large"
                disabled={!editing}
                style={{ background: editing ? '#fff' : '#f9fafb' }}
              />
            </Form.Item>

            <Form.Item
              name="gender"
              label={<span style={{ fontWeight: 500 }}>Giới tính</span>}
            >
              <Select
                placeholder="Chọn giới tính"
                size="large"
                disabled={!editing}
                options={GENDER_OPTIONS}
                allowClear
              />
            </Form.Item>

            <Form.Item
              name="dateOfBirth"
              label={<span style={{ fontWeight: 500 }}>Ngày sinh</span>}
              style={{ gridColumn: 'span 2' }}
            >
              <DatePicker
                format="DD/MM/YYYY"
                placeholder="Chọn ngày sinh"
                size="large"
                disabled={!editing}
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="address"
              label={<span style={{ fontWeight: 500 }}>Địa chỉ</span>}
              style={{ gridColumn: 'span 2' }}
            >
              <Input
                prefix={<HomeOutlined style={{ color: '#9ca3af' }} />}
                size="large"
                disabled={!editing}
                placeholder={editing ? 'Nhập địa chỉ của bạn...' : ''}
                style={{ background: editing ? '#fff' : '#f9fafb' }}
              />
            </Form.Item>

            <Form.Item
              name="note"
              label={<span style={{ fontWeight: 500 }}>Ghi chú cá nhân</span>}
              style={{ gridColumn: 'span 2' }}
            >
              <Input.TextArea
                rows={3}
                disabled={!editing}
                placeholder={editing ? 'Nhập ghi chú cá nhân (tuỳ chọn)...' : ''}
                style={{ background: editing ? '#fff' : '#f9fafb', borderRadius: 8 }}
              />
            </Form.Item>
          </div>

          {editing && (
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={saving}
                icon={<CheckOutlined />}
                style={{ background: '#4f46e5', borderColor: '#4f46e5', borderRadius: 10 }}
              >
                Lưu thay đổi
              </Button>
              <Button
                onClick={handleCancelEdit}
                style={{ borderRadius: 10 }}
              >
                Hủy
              </Button>
            </div>
          )}
        </Form>
      </SectionCard>

      {/* ── Bảo mật ── */}
      <SectionCard title="🔒 Bảo mật">
        <Form form={pwForm} layout="vertical" onFinish={async (vals) => {
          if (vals.newPassword !== vals.confirmPassword) {
            message.error('Mật khẩu xác nhận không khớp');
            return;
          }
          setPwLoading(true);
          try {
            await authApi.changePassword?.({ currentPassword: vals.currentPassword, newPassword: vals.newPassword })
              .catch(() => { throw new Error('API chưa hỗ trợ'); });
            message.success('✅ Đổi mật khẩu thành công!');
            pwForm.resetFields();
          } catch {
            message.info('Chức năng đổi mật khẩu sẽ sớm được cập nhật');
          } finally {
            setPwLoading(false);
          }
        }}>
          <Form.Item name="currentPassword" label={<span style={{ fontWeight: 500 }}>Mật khẩu hiện tại</span>} rules={[{ required: true }]}>
            <Input.Password prefix={<LockOutlined style={{ color: '#9ca3af' }} />} size="large" />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item name="newPassword" label={<span style={{ fontWeight: 500 }}>Mật khẩu mới</span>} rules={[{ required: true, min: 6 }]}>
              <Input.Password prefix={<LockOutlined style={{ color: '#9ca3af' }} />} size="large" />
            </Form.Item>
            <Form.Item name="confirmPassword" label={<span style={{ fontWeight: 500 }}>Xác nhận mật khẩu</span>} rules={[{ required: true }]}>
              <Input.Password prefix={<LockOutlined style={{ color: '#9ca3af' }} />} size="large" />
            </Form.Item>
          </div>
          <Button
            type="primary"
            htmlType="submit"
            loading={pwLoading}
            ghost
            style={{ borderColor: '#4f46e5', color: '#4f46e5', borderRadius: 10 }}
          >
            Đổi mật khẩu
          </Button>
        </Form>
      </SectionCard>

      {/* ── Tài khoản ── */}
      <SectionCard title="⚙️ Tài khoản">
        <button
          className="mc-btn-danger"
          style={{ width: '100%', justifyContent: 'center', padding: '12px 20px' }}
          onClick={() => setShowLogoutConfirm(true)}
        >
          <LogoutOutlined /> Đăng xuất khỏi tài khoản
        </button>
      </SectionCard>

      {/* Logout Confirm Modal */}
      <Modal
        title="Đăng xuất?"
        open={showLogoutConfirm}
        onOk={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
        okText="Đăng xuất"
        cancelText="Hủy"
        okButtonProps={{ danger: true, style: { borderRadius: 8 } }}
        cancelButtonProps={{ style: { borderRadius: 8 } }}
        centered
      >
        <p style={{ color: '#6b7280' }}>Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?</p>
      </Modal>
    </div>
  );
}

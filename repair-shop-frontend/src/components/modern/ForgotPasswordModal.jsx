import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Alert, message, Steps } from 'antd';
import {
  MailOutlined,
  LockOutlined,
  KeyOutlined,
  ArrowLeftOutlined,
  CheckCircleFilled,
  SafetyCertificateOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { authApi } from '../../api/authApi';

export default function ForgotPasswordModal({ open, onClose, primaryColor = '#4f46e5', initialEmail = '' }) {
  const [currentStep, setCurrentStep] = useState(0); // 0: Enter email, 1: Enter OTP & New Password, 2: Success
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState('');
  const [countdown, setCountdown] = useState(0);

  const [emailForm] = Form.useForm();
  const [resetForm] = Form.useForm();

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleOpen = () => {
    if (initialEmail) {
      emailForm.setFieldsValue({ email: initialEmail });
    }
  };

  const handleClose = () => {
    emailForm.resetFields();
    resetForm.resetFields();
    setCurrentStep(0);
    setLoading(false);
    setResending(false);
    setCountdown(0);
    onClose();
  };

  // Step 1: Request OTP
  const handleRequestOtp = async (values) => {
    setLoading(true);
    try {
      const targetEmail = values.email.trim();
      const res = await authApi.forgotPassword({ email: targetEmail });
      setEmail(targetEmail);
      setCountdown(60);

      // Reset step 2 form token so user must enter from email
      resetForm.resetFields();

      message.success(res.data?.data?.message || 'Đã gửi mã xác thực về email của bạn!');
      setCurrentStep(1);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Không tìm thấy tài khoản với email này hoặc có lỗi xảy ra.';
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setResending(true);
    try {
      const res = await authApi.forgotPassword({ email });
      setCountdown(60);
      message.success(res.data?.data?.message || 'Đã gửi lại mã xác thực mới về email của bạn!');
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Lỗi khi gửi lại mã xác thực. Vui lòng thử lại.';
      message.error(errMsg);
    } finally {
      setResending(false);
    }
  };

  // Step 2: Reset Password
  const handleResetPassword = async (values) => {
    setLoading(true);
    try {
      await authApi.resetPassword({
        token: values.token.trim(),
        newPassword: values.newPassword,
      });
      message.success('Đặt lại mật khẩu thành công!');
      setCurrentStep(2);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Mã xác thực không đúng hoặc đã hết hạn. Vui lòng kiểm tra lại email.';
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={460}
      destroyOnClose
      afterOpenChange={(isOpen) => isOpen && handleOpen()}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 17, fontWeight: 700, color: '#1e293b' }}>
          <SafetyCertificateOutlined style={{ color: primaryColor, fontSize: 20 }} />
          <span>Khôi phục mật khẩu</span>
        </div>
      }
    >
      <div style={{ padding: '8px 0 4px' }}>
        <Steps
          size="small"
          current={currentStep}
          items={[
            { title: 'Nhập email' },
            { title: 'Xác thực email' },
            { title: 'Hoàn tất' },
          ]}
          style={{ marginBottom: 24 }}
        />

        {/* STEP 0: ENTER EMAIL */}
        {currentStep === 0 && (
          <div>
            <p style={{ color: '#64748b', fontSize: 13.5, lineHeight: 1.5, marginBottom: 18 }}>
              Vui lòng nhập địa chỉ email đã đăng ký. Hệ thống sẽ gửi mã xác thực OTP 6 chữ số vào hòm thư của bạn để tiến hành đặt lại mật khẩu.
            </p>

            <Form form={emailForm} onFinish={handleRequestOtp} layout="vertical">
              <Form.Item
                name="email"
                label={<span style={{ fontWeight: 600, color: '#334155' }}>Địa chỉ Email</span>}
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Địa chỉ email không đúng định dạng!' },
                ]}
              >
                <Input
                  prefix={<MailOutlined style={{ color: '#94a3b8' }} />}
                  placeholder="name@example.com"
                  size="large"
                  style={{ height: 44, borderRadius: 8 }}
                />
              </Form.Item>

              <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
                <Button
                  onClick={handleClose}
                  style={{ flex: 1, height: 44, borderRadius: 8 }}
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  style={{
                    flex: 1.5,
                    height: 44,
                    borderRadius: 8,
                    background: primaryColor,
                    borderColor: primaryColor,
                    fontWeight: 600,
                  }}
                >
                  Gửi mã xác thực
                </Button>
              </div>
            </Form>
          </div>
        )}

        {/* STEP 1: ENTER TOKEN FROM EMAIL & NEW PASSWORD */}
        {currentStep === 1 && (
          <div>
            <Alert
              type="info"
              showIcon
              message="Đã gửi mã xác thực qua email"
              description={
                <div>
                  <div style={{ color: '#334155', marginTop: 4 }}>
                    Mã xác thực OTP gồm 6 chữ số đã được gửi tới:
                  </div>
                  <div style={{ fontWeight: 700, color: primaryColor, margin: '2px 0 6px' }}>
                    {email}
                  </div>
                  <div style={{ color: '#64748b', fontSize: 12.5 }}>
                    Vui lòng mở ứng dụng hoặc trang web Gmail/Email để kiểm tra hộp thư đến (hoặc mục Thư rác/Spam), sau đó nhập mã vào bên dưới.
                  </div>
                </div>
              }
              style={{ marginBottom: 18, borderRadius: 8 }}
            />

            <Form form={resetForm} onFinish={handleResetPassword} layout="vertical">
              <Form.Item
                name="token"
                label={
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, color: '#334155' }}>Mã OTP (6 chữ số trong email)</span>
                    <Button
                      type="link"
                      size="small"
                      disabled={countdown > 0 || resending}
                      onClick={handleResendOtp}
                      style={{ padding: 0, fontSize: 12, height: 'auto', color: countdown > 0 ? '#94a3b8' : primaryColor }}
                    >
                      {resending ? <SyncOutlined spin /> : (countdown > 0 ? `Gửi lại sau (${countdown}s)` : 'Gửi lại mã')}
                    </Button>
                  </div>
                }
                rules={[{ required: true, message: 'Vui lòng nhập mã OTP được gửi về email!' }]}
              >
                <Input
                  prefix={<KeyOutlined style={{ color: '#94a3b8' }} />}
                  placeholder="Nhập mã 6 chữ số từ email"
                  size="large"
                  maxLength={10}
                  style={{ height: 44, borderRadius: 8, letterSpacing: 2, fontWeight: 600 }}
                />
              </Form.Item>

              <Form.Item
                name="newPassword"
                label={<span style={{ fontWeight: 600, color: '#334155' }}>Mật khẩu mới</span>}
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                  { min: 6, message: 'Mật khẩu phải có tối thiểu 6 ký tự!' },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  size="large"
                  style={{ height: 44, borderRadius: 8 }}
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label={<span style={{ fontWeight: 600, color: '#334155' }}>Xác nhận mật khẩu mới</span>}
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Mật khẩu xác nhận không trùng khớp!'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
                  placeholder="Nhập lại mật khẩu mới"
                  size="large"
                  style={{ height: 44, borderRadius: 8 }}
                />
              </Form.Item>

              <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => setCurrentStep(0)}
                  style={{ flex: 1, height: 44, borderRadius: 8 }}
                >
                  Nhập lại email
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  style={{
                    flex: 1.5,
                    height: 44,
                    borderRadius: 8,
                    background: primaryColor,
                    borderColor: primaryColor,
                    fontWeight: 600,
                  }}
                >
                  Xác nhận & Đổi MK
                </Button>
              </div>
            </Form>
          </div>
        )}

        {/* STEP 2: SUCCESS RESULT */}
        {currentStep === 2 && (
          <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
            <CheckCircleFilled style={{ fontSize: 56, color: '#10b981', marginBottom: 16 }} />
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
              Đặt lại mật khẩu thành công!
            </h3>
            <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 24px' }}>
              Mật khẩu mới của bạn đã được cập nhật thành công vào hệ thống. Bạn có thể đăng nhập ngay với mật khẩu mới.
            </p>
            <Button
              type="primary"
              size="large"
              block
              onClick={handleClose}
              style={{
                height: 46,
                borderRadius: 8,
                background: primaryColor,
                borderColor: primaryColor,
                fontWeight: 700,
              }}
            >
              Đăng nhập ngay
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}

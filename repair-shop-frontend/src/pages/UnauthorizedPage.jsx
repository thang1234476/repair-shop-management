import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f0f1a' }}>
      <Result
        status="403"
        title={<span style={{ color: 'white' }}>403</span>}
        subTitle={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Xin lỗi, bạn không có quyền truy cập trang này.</span>}
        extra={<Button type="primary" onClick={() => navigate(-1)} style={{ background: '#7c3aed' }}>Quay lại</Button>}
      />
    </div>
  );
}

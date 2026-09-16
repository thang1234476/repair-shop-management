import React, { useState, useEffect, useRef } from 'react';
import { Modal, Input, Button, Alert, Upload, message } from 'antd';
import {
  ScanOutlined,
  CameraOutlined,
  UploadOutlined,
  SearchOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';
import jsQR from 'jsqr';

export default function QrScannerModal({ open, onClose, onScanSuccess }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);

  const [hasCamera, setHasCamera] = useState(true);
  const [cameraError, setCameraError] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [detectedCode, setDetectedCode] = useState(null);

  useEffect(() => {
    if (open) {
      setDetectedCode(null);
      setCameraError(null);
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [open]);

  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasCamera(false);
      setCameraError('Trình duyệt không hỗ trợ truy cập camera hoặc đang chạy trong môi trường không bảo mật (cần HTTPS hoặc localhost).');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
        setScanning(true);
        requestAnimationFrame(tick);
      }
    } catch (err) {
      console.warn('Camera error:', err);
      setHasCamera(false);
      setCameraError('Không thể truy cập camera. Vui lòng cấp quyền camera trên trình duyệt hoặc tải ảnh mã QR / nhập mã phiếu.');
    }
  };

  const handleDetected = (code) => {
    if (!code) return;
    let cleaned = code.trim();
    if (cleaned.includes('/tickets/')) {
      cleaned = cleaned.split('/tickets/').pop().split('?')[0];
    }
    setDetectedCode(cleaned);
    stopCamera();

    // Subtle audio feedback
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // AudioContext not allowed or unsupported
    }

    setTimeout(() => {
      onScanSuccess(cleaned);
      onClose();
    }, 600);
  };

  const tick = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (canvas) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });
        if (code && code.data) {
          handleDetected(code.data);
          return;
        }
      }
    }
    animFrameRef.current = requestAnimationFrame(tick);
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code && code.data) {
          message.success('Đã quét mã QR từ ảnh thành công!');
          handleDetected(code.data);
        } else {
          message.error('Không tìm thấy mã QR hợp lệ trong ảnh.');
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
    return false; // prevent upload
  };

  const handleManualSubmit = (e) => {
    if (e) e.preventDefault();
    if (!manualCode.trim()) {
      message.warning('Vui lòng nhập mã phiếu');
      return;
    }
    handleDetected(manualCode.trim());
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 700 }}>
          <ScanOutlined style={{ color: '#4f46e5' }} />
          <span>Quét mã QR tra cứu phiếu sửa chữa</span>
        </div>
      }
      width={480}
      destroyOnClose
    >
      <div style={{ padding: '8px 0' }}>
        {cameraError ? (
          <Alert
            type="warning"
            showIcon
            message="Không thể bật Camera"
            description={cameraError}
            style={{ marginBottom: 16, borderRadius: 8 }}
          />
        ) : (
          <div style={{
            position: 'relative',
            width: '100%',
            height: 280,
            borderRadius: 12,
            overflow: 'hidden',
            backgroundColor: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}>
            <video
              ref={videoRef}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              muted
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Scanning Guide Overlay */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 180,
              height: 180,
              border: '2px solid rgba(255, 255, 255, 0.8)',
              borderRadius: 12,
              boxShadow: '0 0 0 4000px rgba(0, 0, 0, 0.45)',
              pointerEvents: 'none',
            }}>
              {/* Corner markers */}
              <div style={{ position: 'absolute', top: -2, left: -2, width: 16, height: 16, borderTop: '4px solid #4f46e5', borderLeft: '4px solid #4f46e5', borderTopLeftRadius: 4 }} />
              <div style={{ position: 'absolute', top: -2, right: -2, width: 16, height: 16, borderTop: '4px solid #4f46e5', borderRight: '4px solid #4f46e5', borderTopRightRadius: 4 }} />
              <div style={{ position: 'absolute', bottom: -2, left: -2, width: 16, height: 16, borderBottom: '4px solid #4f46e5', borderLeft: '4px solid #4f46e5', borderBottomLeftRadius: 4 }} />
              <div style={{ position: 'absolute', bottom: -2, right: -2, width: 16, height: 16, borderBottom: '4px solid #4f46e5', borderRight: '4px solid #4f46e5', borderBottomRightRadius: 4 }} />

              {/* Scanning red/blue laser line */}
              {scanning && !detectedCode && (
                <div className="mc-laser-line" />
              )}

              {detectedCode && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(16, 185, 129, 0.85)',
                  borderRadius: 10,
                  color: 'white',
                  textAlign: 'center',
                  padding: 10,
                }}>
                  <CheckCircleFilled style={{ fontSize: 32, marginBottom: 6 }} />
                  <div style={{ fontWeight: 700, fontSize: 13 }}>Đã quét thành công!</div>
                  <div style={{ fontSize: 12, marginTop: 2, fontFamily: 'monospace' }}>{detectedCode}</div>
                </div>
              )}
            </div>

            <div style={{
              position: 'absolute',
              bottom: 12,
              color: '#f3f4f6',
              fontSize: 12,
              background: 'rgba(0,0,0,0.6)',
              padding: '4px 12px',
              borderRadius: 20,
              backdropFilter: 'blur(4px)',
            }}>
              {scanning ? 'Hướng camera vào mã QR trên phiếu biên nhận' : 'Đang khởi động camera...'}
            </div>
          </div>
        )}

        {/* Fallback actions: Upload image or Type code */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <Upload
            beforeUpload={handleFileUpload}
            showUploadList={false}
            accept="image/*"
            style={{ flex: 1 }}
          >
            <Button
              icon={<UploadOutlined />}
              style={{ width: '100%', borderRadius: 8, height: 38 }}
            >
              Tải ảnh QR từ thiết bị
            </Button>
          </Upload>
          {cameraError && (
            <Button
              icon={<CameraOutlined />}
              onClick={startCamera}
              style={{ borderRadius: 8, height: 38 }}
            >
              Thử lại Camera
            </Button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0 10px' }}>
          <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
          <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>Hoặc nhập mã phiếu</span>
          <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
        </div>

        <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: 8 }}>
          <Input
            placeholder="VD: TKT-20240101-001"
            value={manualCode}
            onChange={e => setManualCode(e.target.value)}
            style={{ borderRadius: 8, height: 40 }}
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleManualSubmit}
            style={{ borderRadius: 8, height: 40, background: '#4f46e5' }}
          >
            Tìm kiếm
          </Button>
        </form>
      </div>

      <style>{`
        @keyframes laserMove {
          0% { top: 0%; opacity: 0.8; }
          50% { top: 100%; opacity: 1; }
          100% { top: 0%; opacity: 0.8; }
        }
        .mc-laser-line {
          position: absolute;
          left: 4px;
          right: 4px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #4f46e5, #06b6d4, transparent);
          box-shadow: 0 0 8px #4f46e5;
          animation: laserMove 2s infinite ease-in-out;
        }
      `}</style>
    </Modal>
  );
}

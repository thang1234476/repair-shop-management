import React, { useState, useEffect } from 'react';
import { Table, Card, Typography, Space, Tag, Button, Modal, Spin, Alert, Row, Col, Divider, Descriptions, Input, Popconfirm, message } from 'antd';
import { EyeOutlined, SyncOutlined, FileTextOutlined, DollarCircleOutlined, UserOutlined, CalendarOutlined, SearchOutlined, CheckCircleOutlined, DownloadOutlined, PrinterOutlined } from '@ant-design/icons';
import { invoiceApi } from '../../api/invoiceApi';
import { formatCurrency, formatDate } from '../../utils/helpers';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const INVOICE_STATUS_COLORS = {
  UNPAID: 'error',
  PARTIALLY_PAID: 'warning',
  PAID: 'success'
};

const INVOICE_STATUS_TEXT = {
  UNPAID: 'Chưa thanh toán',
  PARTIALLY_PAID: 'Thanh toán một phần',
  PAID: 'Đã thanh toán'
};

export default function AdminInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');

  // Pagination & Filtering state (prepared for future if needed)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

  // Detail Modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState({});
  const [exportLoading, setExportLoading] = useState({});

  useEffect(() => {
    fetchInvoices(0, pagination.pageSize, searchText);
  }, []);

  const fetchInvoices = async (page = 0, size = 20, search = searchText) => {
    try {
      setLoading(true);
      setError(null);
      const res = await invoiceApi.getAllInvoices({ page, size, search: search || undefined });
      const data = res.data.data;
      setInvoices(data.content);
      setPagination({
        ...pagination,
        current: data.number + 1,
        total: data.totalElements,
      });
    } catch (err) {
      setError('Không thể tải danh sách hóa đơn. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination) => {
    fetchInvoices(newPagination.current - 1, newPagination.pageSize, searchText);
  };

  const handleSearch = (value) => {
    // value can be from onSearch or empty if cleared
    setSearchText(value);
    fetchInvoices(0, pagination.pageSize, value);
  };

  const handleReset = () => {
    setSearchText('');
    fetchInvoices(0, pagination.pageSize, '');
  };

  const handleConfirmPayment = async (invoiceId) => {
    try {
      setConfirmLoading(prev => ({ ...prev, [invoiceId]: true }));
      await invoiceApi.confirmPayment(invoiceId);
      message.success('Xác nhận thanh toán thành công!');
      fetchInvoices(pagination.current - 1, pagination.pageSize, searchText);
    } catch (err) {
      message.error(err?.response?.data?.message || 'Xác nhận thanh toán thất bại.');
    } finally {
      setConfirmLoading(prev => ({ ...prev, [invoiceId]: false }));
    }
  };

  const handleExport = async (invoiceId, invoiceCode) => {
    try {
      setExportLoading(prev => ({ ...prev, [invoiceId]: true }));
      const res = await invoiceApi.printInvoice(invoiceId);
      
      const file = new Blob([res.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      
      const link = document.createElement('a');
      link.href = fileURL;
      link.download = `invoice-${invoiceCode}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      message.success('Xuất hóa đơn thành công!');
      URL.revokeObjectURL(fileURL);
    } catch (err) {
      message.error('Không thể xuất hóa đơn. Vui lòng thử lại sau.');
    } finally {
      setExportLoading(prev => ({ ...prev, [invoiceId]: false }));
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('print-area').innerHTML;
    const printWindow = window.open('', '', 'height=800,width=800');
    printWindow.document.write('<html><head><title>In Hóa Đơn - ' + (selectedInvoice?.invoiceCode || '') + '</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #000; }
      .print-header { text-align: center; margin-bottom: 30px; }
      .print-header h2 { margin: 0; font-size: 24px; }
      .print-header p { margin: 5px 0; color: #333; }
      .print-title { text-align: center; font-size: 28px; margin: 20px 0 30px 0; text-transform: uppercase; font-weight: bold; }
      .print-info-row { display: flex; justify-content: space-between; margin-bottom: 30px; }
      .print-info-col p { margin: 5px 0; font-size: 16px; }
      .print-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
      .print-table th, .print-table td { border-bottom: 1px solid #ccc; padding: 12px 8px; text-align: left; }
      .print-table th { background: #f5f5f5 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .print-summary { width: 300px; float: right; }
      .print-summary-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 16px; }
      .print-total { font-weight: bold; font-size: 20px; border-top: 2px solid #000; padding-top: 10px; margin-top: 10px; }
      .print-footer { clear: both; text-align: center; padding-top: 50px; font-style: italic; color: #555; }
    `);
    printWindow.document.write('</style></head><body>');
    printWindow.document.write(printContent);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleViewDetail = async (invoiceId) => {
    setIsModalVisible(true);
    try {
      setDetailLoading(true);
      const res = await invoiceApi.getInvoice(invoiceId);
      setSelectedInvoice(res.data.data);
    } catch (err) {
      // Fallback to table data if fetch fails
      setSelectedInvoice(invoices.find(i => i.invoiceId === invoiceId));
    } finally {
      setDetailLoading(false);
    }
  };

  const columns = [
    {
      title: 'Mã Hóa Đơn',
      dataIndex: 'invoiceCode',
      key: 'invoiceCode',
      render: (text) => <Text style={{ color: '#fff', fontWeight: 600 }}>{text}</Text>,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (text) => <Text style={{ color: '#e2e8f0' }}>{text || 'N/A'}</Text>,
    },
    {
      title: 'Mã Phiếu SC',
      dataIndex: 'ticketCode',
      key: 'ticketCode',
      render: (text) => <Tag color="default" style={{ background: '#1a1a2e', border: '1px solid #2d3748' }}>{text || 'N/A'}</Tag>,
    },
    {
      title: 'Ngày lập',
      dataIndex: 'issuedAt',
      key: 'issuedAt',
      render: (date) => <Text style={{ color: '#94a3b8' }}>{date ? dayjs(date).format('DD/MM/YYYY HH:mm') : 'N/A'}</Text>,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'finalAmount',
      key: 'finalAmount',
      align: 'right',
      render: (amount) => <Text style={{ color: '#10b981', fontWeight: 'bold' }}>{formatCurrency(amount)}</Text>,
    },
    {
      title: 'Đã thanh toán',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      align: 'right',
      render: (amount) => <Text style={{ color: '#3b82f6', fontWeight: 'bold' }}>{formatCurrency(amount || 0)}</Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status) => (
        <Tag color={INVOICE_STATUS_COLORS[status] || 'default'} style={{ margin: 0, padding: '4px 12px', borderRadius: 6, fontWeight: 500 }}>
          {INVOICE_STATUS_TEXT[status] || status}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            ghost 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => handleViewDetail(record.invoiceId)}
            style={{ borderRadius: 6 }}
          >
            Chi tiết
          </Button>
          
          {record.status !== 'PAID' && (
            <Popconfirm
              title="Xác nhận thanh toán?"
              description={`Xác nhận thu đủ tiền cho ${record.invoiceCode}?`}
              onConfirm={() => handleConfirmPayment(record.invoiceId)}
              okText="Xác nhận"
              cancelText="Hủy"
              okButtonProps={{ loading: confirmLoading[record.invoiceId] }}
            >
              <Button 
                type="primary" 
                icon={<CheckCircleOutlined />} 
                size="small"
                style={{ borderRadius: 6, background: '#10b981', borderColor: '#10b981', color: '#fff' }}
                loading={confirmLoading[record.invoiceId]}
              >
                Thu tiền
              </Button>
            </Popconfirm>
          )}

          <Button
            icon={<DownloadOutlined />}
            size="small"
            onClick={() => handleExport(record.invoiceId, record.invoiceCode)}
            style={{ borderRadius: 6, color: '#3b82f6', borderColor: '#3b82f6', background: 'transparent' }}
            loading={exportLoading[record.invoiceId]}
          >
            Xuất PDF
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '0 12px', maxWidth: 1600, margin: '0 auto' }}>
      <Space align="center" style={{ marginBottom: 24 }}>
        <FileTextOutlined style={{ fontSize: 28, color: '#3b82f6' }} />
        <Title level={3} style={{ margin: 0, color: '#fff', fontWeight: 600 }}>Quản lý Hóa Đơn</Title>
      </Space>

      <Card
        bordered={false}
        style={{
          background: '#16213e',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          borderRadius: 12,
        }}
        bodyStyle={{ padding: '24px' }}
      >
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <Space>
            <Input.Search
              placeholder="Nhập mã hóa đơn..."
              allowClear
              enterButton={<Button type="primary" icon={<SearchOutlined />}>Tìm kiếm</Button>}
              size="large"
              onSearch={handleSearch}
              style={{ width: 350 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            {searchText && (
              <Button size="large" onClick={handleReset} style={{ background: '#2d3748', border: 'none', color: '#fff' }}>
                Xóa bộ lọc
              </Button>
            )}
          </Space>
        </div>

        {error ? (
          <Alert message={error} type="error" showIcon style={{ marginBottom: 24, background: 'transparent', border: '1px solid #ef4444' }} />
        ) : null}

        <Table
          columns={columns}
          dataSource={invoices}
          rowKey="invoiceId"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: false,
          }}
          loading={{
            indicator: <Spin indicator={<SyncOutlined spin />} tip="Đang tải dữ liệu..." />,
            spinning: loading
          }}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
          className="dark-table"
        />
      </Card>

      {/* MODAL CHI TIẾT HÓA ĐƠN */}
      <Modal
        title={
          <Space>
            <FileTextOutlined style={{ color: '#3b82f6' }} />
            <span>Chi tiết Hóa đơn {selectedInvoice?.invoiceCode}</span>
          </Space>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={handlePrint} disabled={!selectedInvoice} style={{ background: '#10b981', borderColor: '#10b981' }}>
            In Hóa Đơn
          </Button>,
          <Button key="close" onClick={() => setIsModalVisible(false)} style={{ background: '#2d3748', border: 'none', color: '#fff' }}>
            Đóng
          </Button>
        ]}
        width={700}
        bodyStyle={{ background: '#1a1a2e', padding: '24px' }}
        wrapClassName="dark-modal"
        destroyOnClose
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin indicator={<SyncOutlined spin style={{ fontSize: 24 }} />} />
          </div>
        ) : selectedInvoice ? (
          <div>
            <Row gutter={[24, 24]}>
              <Col span={12}>
                <Space direction="vertical" size="small">
                  <Text style={{ color: '#94a3b8', fontSize: 13, textTransform: 'uppercase' }}>Khách hàng</Text>
                  <Space>
                    <UserOutlined style={{ color: '#fff' }} />
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: 500 }}>{selectedInvoice.customerName || 'N/A'}</Text>
                  </Space>
                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical" size="small">
                  <Text style={{ color: '#94a3b8', fontSize: 13, textTransform: 'uppercase' }}>Ngày lập hóa đơn</Text>
                  <Space>
                    <CalendarOutlined style={{ color: '#fff' }} />
                    <Text style={{ color: '#fff', fontSize: 16 }}>
                      {selectedInvoice.issuedAt ? dayjs(selectedInvoice.issuedAt).format('DD/MM/YYYY HH:mm') : 'N/A'}
                    </Text>
                  </Space>
                </Space>
              </Col>
            </Row>

            <Divider style={{ borderColor: '#2d3748' }} />

            <Descriptions column={1} bordered size="small" 
              labelStyle={{ background: '#16213e', color: '#94a3b8', borderRight: '1px solid #2d3748' }}
              contentStyle={{ background: '#1a1a2e', color: '#fff' }}
              style={{ border: '1px solid #2d3748' }}
            >
              <Descriptions.Item label="Mã phiếu sửa chữa">
                <Tag color="blue">{selectedInvoice.ticketCode || 'N/A'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Người lập">
                {selectedInvoice.issuedBy || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={INVOICE_STATUS_COLORS[selectedInvoice.status]} style={{ margin: 0 }}>
                  {INVOICE_STATUS_TEXT[selectedInvoice.status] || selectedInvoice.status}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ borderColor: '#2d3748' }} />

            <div style={{ background: '#16213e', padding: '16px 24px', borderRadius: 8 }}>
              <Row justify="space-between" style={{ marginBottom: 8 }}>
                <Text style={{ color: '#94a3b8' }}>Tạm tính:</Text>
                <Text style={{ color: '#e2e8f0' }}>{formatCurrency(selectedInvoice.subtotal)}</Text>
              </Row>
              <Row justify="space-between" style={{ marginBottom: 8 }}>
                <Text style={{ color: '#94a3b8' }}>Thuế:</Text>
                <Text style={{ color: '#e2e8f0' }}>{formatCurrency(selectedInvoice.tax)}</Text>
              </Row>
              <Row justify="space-between" style={{ marginBottom: 16 }}>
                <Text style={{ color: '#94a3b8' }}>Giảm giá:</Text>
                <Text style={{ color: '#ef4444' }}>- {formatCurrency(selectedInvoice.discount)}</Text>
              </Row>
              
              <Divider style={{ borderColor: '#2d3748', margin: '12px 0' }} />
              
              <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>TỔNG CỘNG:</Text>
                <Text style={{ color: '#10b981', fontSize: 22, fontWeight: 'bold' }}>{formatCurrency(selectedInvoice.finalAmount)}</Text>
              </Row>
              <Row justify="space-between" align="middle">
                <Text style={{ color: '#94a3b8' }}>Đã thanh toán:</Text>
                <Text style={{ color: '#3b82f6', fontSize: 16, fontWeight: 'bold' }}>{formatCurrency(selectedInvoice.paidAmount)}</Text>
              </Row>
            </div>
            
            {/* Note about payment history missing */}
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <Text type="secondary" style={{ fontSize: 12, color: '#64748b' }}>
                * Danh sách giao dịch chi tiết (ngày thanh toán) không khả dụng do API backend chưa cung cấp.
              </Text>
            </div>
          </div>
        ) : (
          <Alert message="Không tìm thấy thông tin hóa đơn" type="warning" />
        )}
      </Modal>

      {/* Inject custom CSS for modal styling implicitly */}
      <style dangerouslySetInnerHTML={{__html: `
        .dark-modal .ant-modal-content {
          background-color: #1a1a2e;
          border: 1px solid #2d3748;
        }
        .dark-modal .ant-modal-header {
          background-color: #1a1a2e;
          border-bottom: 1px solid #2d3748;
        }
        .dark-modal .ant-modal-title {
          color: #fff;
        }
        .dark-modal .ant-modal-close {
          color: #a0aec0;
        }
        .dark-modal .ant-modal-close:hover {
          color: #fff;
        }
        .dark-modal .ant-descriptions-view {
          border: 1px solid #2d3748 !important;
        }
        .dark-modal .ant-descriptions-row {
          border-bottom: 1px solid #2d3748 !important;
        }
      `}} />

      {/* KHU VỰC IN ẨN */}
      <div id="print-area" style={{ display: 'none' }}>
        {selectedInvoice && (
          <div>
            <div className="print-header">
              <h2>CỬA HÀNG SỬA CHỮA ANTIGRAVITY</h2>
              <p>123 Đường Điện Biên Phủ, Quận Bình Thạnh, TP.HCM</p>
              <p>Điện thoại: 0123.456.789</p>
            </div>
            
            <h1 className="print-title">HÓA ĐƠN THANH TOÁN</h1>
            
            <div className="print-info-row">
              <div className="print-info-col">
                <p><strong>Mã hóa đơn:</strong> {selectedInvoice.invoiceCode}</p>
                <p><strong>Ngày lập:</strong> {selectedInvoice.issuedAt ? dayjs(selectedInvoice.issuedAt).format('DD/MM/YYYY HH:mm') : ''}</p>
              </div>
              <div className="print-info-col">
                <p><strong>Khách hàng:</strong> {selectedInvoice.customerName || 'N/A'}</p>
                <p><strong>Phiếu sửa chữa:</strong> {selectedInvoice.ticketCode || 'N/A'}</p>
              </div>
            </div>

            <table className="print-table">
              <thead>
                <tr>
                  <th>Nội dung / Dịch vụ</th>
                  <th style={{ textAlign: 'right' }}>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Dịch vụ sửa chữa theo phiếu {selectedInvoice.ticketCode || ''}</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(selectedInvoice.subtotal)}</td>
                </tr>
              </tbody>
            </table>

            <div className="print-summary">
              <div className="print-summary-row">
                <span>Tạm tính:</span>
                <span>{formatCurrency(selectedInvoice.subtotal)}</span>
              </div>
              <div className="print-summary-row">
                <span>Thuế (VAT):</span>
                <span>{formatCurrency(selectedInvoice.tax)}</span>
              </div>
              <div className="print-summary-row">
                <span>Giảm giá:</span>
                <span>- {formatCurrency(selectedInvoice.discount)}</span>
              </div>
              <div className="print-summary-row print-total">
                <span>TỔNG CỘNG:</span>
                <span>{formatCurrency(selectedInvoice.finalAmount)}</span>
              </div>
              <div className="print-summary-row">
                <span>Trạng thái:</span>
                <span>{INVOICE_STATUS_TEXT[selectedInvoice.status] || selectedInvoice.status}</span>
              </div>
            </div>
            
            <div className="print-footer">
              <p>Cảm ơn quý khách đã sử dụng dịch vụ!</p>
              <p>Hẹn gặp lại quý khách.</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

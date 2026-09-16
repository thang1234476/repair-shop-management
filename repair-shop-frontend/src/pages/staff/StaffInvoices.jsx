import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Modal, Form, InputNumber, Select, Space, Card, Tag, Drawer, Descriptions, List, message } from 'antd';
import { DollarOutlined, DownloadOutlined, EyeOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { invoiceApi } from '../../api/invoiceApi';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { INVOICE_STATUS_COLORS } from '../../utils/constants';

const { Option } = Select;

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Tiền mặt' },
  { value: 'BANK_TRANSFER', label: 'Chuyển khoản ngân hàng' },
  { value: 'CARD', label: 'Thẻ ATM / Visa / Master' },
  { value: 'E_WALLET', label: 'Ví điện tử (Momo, ZaloPay...)' },
];

export default function StaffInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  // Detail & Payment Modals
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const [paymentForm] = Form.useForm();
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const fetchInvoices = async (p = page, s = pageSize) => {
    setLoading(true);
    try {
      const res = await invoiceApi.getStaffInvoices({
        page: p,
        size: s,
      });
      const data = res.data?.data;
      setInvoices(data?.content || []);
      setTotalElements(data?.totalElements || 0);
    } catch {
      message.error('Lỗi khi tải danh sách hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices(page, pageSize);
  }, [page, pageSize]);

  // Download PDF
  const handleDownloadPdf = async (record) => {
    const invId = record.invoiceId || record.id;
    setDownloadingId(invId);
    try {
      const res = await invoiceApi.exportPdf(invId);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${record.invoiceCode || invId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success('Đã tải hóa đơn PDF thành công!');
    } catch {
      message.error('Lỗi khi xuất hóa đơn PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  // Open Payment Modal
  const openPaymentModal = (record) => {
    setSelectedInvoice(record);
    paymentForm.resetFields();
    const remaining = Math.max(0, (record.finalAmount || 0) - (record.paidAmount || 0));
    paymentForm.setFieldsValue({
      amount: remaining,
      paymentMethod: 'CASH',
    });
    setPaymentModalOpen(true);
  };

  // Submit Payment
  const handlePaymentSubmit = async (values) => {
    if (!selectedInvoice) return;
    setSubmittingPayment(true);
    try {
      const payload = {
        invoiceId: selectedInvoice.invoiceId || selectedInvoice.id,
        amount: values.amount,
        paymentMethod: values.paymentMethod,
        note: values.note,
      };
      await invoiceApi.createPayment(payload);
      message.success('Ghi nhận thanh toán thành công!');
      setPaymentModalOpen(false);
      fetchInvoices(page, pageSize);
      // Refresh detail if open
      if (detailDrawerOpen) {
        const updated = await invoiceApi.getInvoice(selectedInvoice.invoiceId || selectedInvoice.id);
        setSelectedInvoice(updated.data?.data);
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi ghi nhận thanh toán');
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Open Detail Drawer
  const openDetailDrawer = async (record) => {
    const invId = record.invoiceId || record.id;
    try {
      const res = await invoiceApi.getInvoice(invId);
      setSelectedInvoice(res.data?.data || record);
    } catch {
      setSelectedInvoice(record);
    }
    setDetailDrawerOpen(true);
  };

  const filteredInvoices = invoices.filter((i) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      i.invoiceCode?.toLowerCase().includes(q) ||
      i.ticketCode?.toLowerCase().includes(q) ||
      i.customerName?.toLowerCase().includes(q)
    );
  });

  const columns = [
    {
      title: 'Mã HĐ',
      dataIndex: 'invoiceCode',
      key: 'invoiceCode',
      render: (code) => <span style={{ fontWeight: 700, color: '#a78bfa' }}>{code}</span>,
    },
    {
      title: 'Mã Phiếu',
      dataIndex: 'ticketCode',
      key: 'ticketCode',
      render: (tCode) => <span style={{ color: '#60a5fa' }}>{tCode}</span>,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (name) => name || '—',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'finalAmount',
      key: 'finalAmount',
      render: (a) => <span style={{ fontWeight: 600 }}>{formatCurrency(a)}</span>,
    },
    {
      title: 'Đã thanh toán',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      render: (paid, r) => {
        const remaining = (r.finalAmount || 0) - (paid || 0);
        return (
          <div>
            <div style={{ color: '#10b981', fontWeight: 500 }}>{formatCurrency(paid || 0)}</div>
            {remaining > 0 && (
              <div style={{ fontSize: 11, color: '#f87171' }}>
                Còn nợ: {formatCurrency(remaining)}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (s) => (
        <Tag color={INVOICE_STATUS_COLORS[s] || 'default'}>
          {s === 'PAID' ? 'Đã thanh toán' : s === 'PARTIALLY_PAID' ? 'Thanh toán 1 phần' : 'Chưa thanh toán'}
        </Tag>
      ),
    },
    {
      title: 'Ngày phát hành',
      dataIndex: 'issuedAt',
      key: 'issuedAt',
      render: (d) => formatDate(d),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 220,
      render: (_, record) => {
        const isPaid = record.status === 'PAID';
        const invId = record.invoiceId || record.id;
        return (
          <Space size="small">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => openDetailDrawer(record)}
            >
              Chi tiết
            </Button>
            {!isPaid && (
              <Button
                size="small"
                icon={<DollarOutlined />}
                onClick={() => openPaymentModal(record)}
                style={{ color: '#10b981', borderColor: '#10b981' }}
              >
                Thu tiền
              </Button>
            )}
            <Button
              size="small"
              icon={<DownloadOutlined />}
              loading={downloadingId === invId}
              onClick={() => handleDownloadPdf(record)}
              style={{ color: '#60a5fa', borderColor: '#3b82f6' }}
            >
              PDF
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, color: 'white' }}>Quản lý hóa đơn & thanh toán</h2>
          <p style={{ margin: '4px 0 0 0', color: '#9ca3af' }}>Danh sách hóa đơn, thu tiền và in phiếu thanh toán</p>
        </div>
      </div>

      <Card className="glass-card" style={{ marginBottom: 16 }}>
        <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
          <Input
            placeholder="Tìm theo mã HĐ, mã phiếu, tên khách..."
            prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 340 }}
            allowClear
          />
          <Button icon={<ReloadOutlined />} onClick={() => fetchInvoices(page, pageSize)}>
            Làm mới
          </Button>
        </Space>
      </Card>

      <Card className="glass-card">
        <Table
          dataSource={filteredInvoices}
          columns={columns}
          rowKey={(r) => r.invoiceId || r.id}
          loading={loading}
          pagination={{
            current: page + 1,
            pageSize,
            total: totalElements,
            onChange: (p, s) => {
              setPage(p - 1);
              setPageSize(s);
            },
            showTotal: (total) => `Tổng cộng ${total} hóa đơn`,
          }}
        />
      </Card>

      {/* Modal Ghi nhận thanh toán */}
      <Modal
        title={`Ghi nhận thanh toán — Hóa đơn ${selectedInvoice?.invoiceCode || ''}`}
        open={paymentModalOpen}
        onCancel={() => setPaymentModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={paymentForm} layout="vertical" onFinish={handlePaymentSubmit}>
          <div style={{ background: '#1e1b4b', padding: '12px 16px', borderRadius: 8, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: '#9ca3af' }}>Tổng tiền hóa đơn:</span>
              <span style={{ fontWeight: 600, color: '#fff' }}>{formatCurrency(selectedInvoice?.finalAmount || 0)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: '#9ca3af' }}>Đã thanh toán:</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>{formatCurrency(selectedInvoice?.paidAmount || 0)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #312e81', paddingTop: 6 }}>
              <span style={{ color: '#f87171', fontWeight: 600 }}>Còn phải thu:</span>
              <span style={{ color: '#f87171', fontWeight: 700, fontSize: 16 }}>
                {formatCurrency(Math.max(0, (selectedInvoice?.finalAmount || 0) - (selectedInvoice?.paidAmount || 0)))}
              </span>
            </div>
          </div>

          <Form.Item
            name="amount"
            label="Số tiền thanh toán"
            rules={[
              { required: true, message: 'Vui lòng nhập số tiền' },
              { type: 'number', min: 1000, message: 'Số tiền tối thiểu 1,000 đ' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              placeholder="Nhập số tiền khách trả..."
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="paymentMethod"
            label="Phương thức thanh toán"
            rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán' }]}
          >
            <Select options={PAYMENT_METHODS} size="large" />
          </Form.Item>

          <Form.Item name="note" label="Ghi chú thanh toán">
            <Input.TextArea rows={2} placeholder="Mã giao dịch chuyển khoản, ghi chú thêm..." />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <Button onClick={() => setPaymentModalOpen(false)}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submittingPayment}
              style={{ background: '#10b981', borderColor: '#10b981' }}
            >
              Xác nhận thu tiền
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Drawer Xem chi tiết hóa đơn */}
      <Drawer
        title={`Chi tiết hóa đơn: ${selectedInvoice?.invoiceCode || ''}`}
        open={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
        width={540}
        extra={
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => handleDownloadPdf(selectedInvoice)}
            style={{ background: '#3b82f6', borderColor: '#3b82f6' }}
          >
            Tải PDF
          </Button>
        }
      >
        {selectedInvoice && (
          <div>
            <Descriptions bordered column={1} size="small" style={{ marginBottom: 20 }}>
              <Descriptions.Item label="Mã hóa đơn">{selectedInvoice.invoiceCode}</Descriptions.Item>
              <Descriptions.Item label="Mã phiếu">{selectedInvoice.ticketCode}</Descriptions.Item>
              <Descriptions.Item label="Khách hàng">{selectedInvoice.customerName}</Descriptions.Item>
              <Descriptions.Item label="Tiền dịch vụ (Subtotal)">{formatCurrency(selectedInvoice.subtotal || 0)}</Descriptions.Item>
              <Descriptions.Item label="Thuế VAT">{formatCurrency(selectedInvoice.tax || 0)}</Descriptions.Item>
              <Descriptions.Item label="Chiết khấu / Giảm giá">{formatCurrency(selectedInvoice.discount || 0)}</Descriptions.Item>
              <Descriptions.Item label="Tổng thanh toán (Final)">
                <span style={{ fontWeight: 700, fontSize: 16, color: '#a78bfa' }}>
                  {formatCurrency(selectedInvoice.finalAmount || 0)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Đã thanh toán">
                <span style={{ color: '#10b981', fontWeight: 600 }}>{formatCurrency(selectedInvoice.paidAmount || 0)}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={INVOICE_STATUS_COLORS[selectedInvoice.status] || 'default'}>
                  {selectedInvoice.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Người lập">{selectedInvoice.issuedBy || '—'}</Descriptions.Item>
              <Descriptions.Item label="Ngày lập">{formatDate(selectedInvoice.issuedAt)}</Descriptions.Item>
            </Descriptions>

            <h4 style={{ color: '#fff', marginBottom: 12 }}>Lịch sử các đợt thanh toán</h4>
            <List
              dataSource={selectedInvoice.payments || []}
              locale={{ emptyText: 'Chưa có lượt thanh toán nào' }}
              renderItem={(p) => (
                <List.Item key={p.paymentId || p.id}>
                  <List.Item.Meta
                    avatar={<DollarOutlined style={{ color: '#10b981', fontSize: 20 }} />}
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 600, color: '#10b981' }}>{formatCurrency(p.amount)}</span>
                        <Tag>{p.paymentMethod}</Tag>
                      </div>
                    }
                    description={
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>
                        <div>Thời gian: {formatDate(p.paymentDate)}</div>
                        {p.receivedByName && <div>Người nhận: {p.receivedByName}</div>}
                        {p.note && <div>Ghi chú: {p.note}</div>}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        )}
      </Drawer>
    </div>
  );
}

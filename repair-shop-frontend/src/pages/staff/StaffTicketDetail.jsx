import React, { useState, useEffect } from 'react';
import {
  Card,
  Descriptions,
  Button,
  message,
  Spin,
  Select,
  Form,
  Input,
  InputNumber,
  Divider,
  Tag,
  Row,
  Col,
  Table,
  Timeline,
  Modal,
  Tabs,
  Alert,
  Space,
  Popconfirm,
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  DownloadOutlined,
  ExportOutlined,
  FileTextOutlined,
  PlusOutlined,
  QrcodeOutlined,
  SaveOutlined,
  ToolOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketApi } from '../../api/ticketApi';
import { invoiceApi } from '../../api/invoiceApi';
import { inventoryApi } from '../../api/inventoryApi';
import { TicketStatusBadge } from '../../components/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { INVOICE_STATUS_COLORS } from '../../utils/constants';
import { QRCodeSVG } from 'qrcode.react';

const { Option } = Select;

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Tiền mặt' },
  { value: 'BANK_TRANSFER', label: 'Chuyển khoản ngân hàng' },
  { value: 'CARD', label: 'Thẻ ATM / Visa / Master' },
  { value: 'E_WALLET', label: 'Ví điện tử' },
];

export default function StaffTicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Core state
  const [ticket, setTicket] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [quote, setQuote] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [inventoryParts, setInventoryParts] = useState([]);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [updatingDiagnosis, setUpdatingDiagnosis] = useState(false);
  const [creatingQuote, setCreatingQuote] = useState(false);
  const [exportingPart, setExportingPart] = useState(false);
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const [recordingPayment, setRecordingPayment] = useState(false);
  const [closingTicket, setClosingTicket] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Modals & Forms
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const [diagnosisForm] = Form.useForm();
  const [quoteForm] = Form.useForm();
  const [inventoryForm] = Form.useForm();
  const [invoiceForm] = Form.useForm();
  const [paymentForm] = Form.useForm();

  useEffect(() => {
    fetchAllData();
  }, [id]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // 1. Load Ticket Detail
      const ticketRes = await ticketApi.getStaffTicket(id);
      const tData = ticketRes.data?.data;
      setTicket(tData);
      diagnosisForm.setFieldsValue({
        diagnosisNotes: tData?.diagnosisNotes || '',
      });

      // 2. Load Timeline
      try {
        const timelineRes = await ticketApi.getStaffTicketTimeline(id);
        setTimeline(timelineRes.data?.data || []);
      } catch {
        setTimeline([]);
      }

      // 3. Load Quote
      try {
        const quoteRes = await ticketApi.getStaffTicketQuote(id);
        setQuote(quoteRes.data?.data || null);
      } catch {
        setQuote(null);
      }

      // 4. Load Invoice
      try {
        const invoiceRes = await ticketApi.getStaffTicketInvoice(id);
        setInvoice(invoiceRes.data?.data || null);
      } catch {
        setInvoice(null);
      }

      // 5. Load Parts for inventory select
      try {
        const invRes = await inventoryApi.getInventory({ size: 100 });
        setInventoryParts(invRes.data?.data?.content || []);
      } catch {
        setInventoryParts([]);
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi tải thông tin phiếu');
    } finally {
      setLoading(false);
    }
  };

  // Status transitions
  const handleUpdateStatus = async (status, noteText = '') => {
    try {
      await ticketApi.updateTicketStatus(id, {
        status,
        note: noteText || `Cập nhật trạng thái thành ${status}`,
      });
      message.success(`Đã chuyển trạng thái phiếu sang ${status}`);
      fetchAllData();
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi cập nhật trạng thái');
    }
  };

  // Update Diagnosis
  const handleSaveDiagnosis = async (values) => {
    setUpdatingDiagnosis(true);
    try {
      await ticketApi.updateDiagnosis(id, {
        diagnosisNotes: values.diagnosisNotes,
      });
      message.success('Cập nhật kết quả chẩn đoán thành công!');
      fetchAllData();
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi lưu chẩn đoán');
    } finally {
      setUpdatingDiagnosis(false);
    }
  };

  // Create Quote
  const handleCreateQuote = async (values) => {
    if (!values.items || values.items.length === 0) {
      message.error('Vui lòng thêm ít nhất một mục báo giá');
      return;
    }
    setCreatingQuote(true);
    try {
      const payload = {
        items: values.items.map((item) => ({
          itemType: item.itemType || 'PART',
          partId: item.partId || null,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      };
      await ticketApi.createQuote(id, payload);
      message.success('Tạo báo giá và gửi khách hàng thành công!');
      quoteForm.resetFields();
      fetchAllData();
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi tạo báo giá');
    } finally {
      setCreatingQuote(false);
    }
  };

  // Export inventory part for this ticket
  const handleExportPart = async (values) => {
    const selected = inventoryParts.find((p) => (p.partId || p.id) === values.partId);
    if (selected && values.quantity > selected.quantityInStock) {
      message.error(`Số lượng xuất (${values.quantity}) vượt tồn kho (${selected.quantityInStock})`);
      return;
    }
    setExportingPart(true);
    try {
      await inventoryApi.exportParts({
        partId: values.partId,
        ticketId: parseInt(id),
        quantity: values.quantity,
        note: values.note || `Xuất linh kiện cho phiếu ${ticket?.ticketCode}`,
      });
      message.success('Xuất kho linh kiện cho phiếu thành công!');
      inventoryForm.resetFields();
      fetchAllData();
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi xuất kho');
    } finally {
      setExportingPart(false);
    }
  };

  // Create Invoice
  const handleCreateInvoice = async (values) => {
    setCreatingInvoice(true);
    try {
      await invoiceApi.createInvoice({
        ticketId: parseInt(id),
        tax: values.tax || 0,
        discount: values.discount || 0,
      });
      message.success('Tạo hóa đơn thành công!');
      fetchAllData();
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi tạo hóa đơn');
    } finally {
      setCreatingInvoice(false);
    }
  };

  // Record Payment
  const handleRecordPayment = async (values) => {
    if (!invoice) return;
    setRecordingPayment(true);
    try {
      await invoiceApi.createPayment({
        invoiceId: invoice.invoiceId || invoice.id,
        amount: values.amount,
        paymentMethod: values.paymentMethod,
        note: values.note,
      });
      message.success('Ghi nhận thanh toán thành công!');
      setPaymentModalOpen(false);
      paymentForm.resetFields();
      fetchAllData();
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi ghi nhận thanh toán');
    } finally {
      setRecordingPayment(false);
    }
  };

  // Export PDF
  const handleDownloadPdf = async () => {
    if (!invoice) return;
    const invId = invoice.invoiceId || invoice.id;
    setDownloadingPdf(true);
    try {
      const res = await invoiceApi.exportPdf(invId);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoice.invoiceCode || invId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success('Đã tải PDF hóa đơn thành công!');
    } catch {
      message.error('Lỗi khi xuất PDF hóa đơn');
    } finally {
      setDownloadingPdf(false);
    }
  };

  // Close Ticket
  const handleCloseTicket = async () => {
    setClosingTicket(true);
    try {
      await ticketApi.closeTicket(id);
      message.success('Đã đóng phiếu và bàn giao thiết bị thành công!');
      fetchAllData();
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi đóng phiếu');
    } finally {
      setClosingTicket(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <h3 style={{ color: '#f87171' }}>Không tìm thấy thông tin phiếu sửa chữa</h3>
        <Button onClick={() => navigate('/staff/tickets')}>Quay lại danh sách</Button>
      </div>
    );
  }

  const quoteItemsColumns = [
    {
      title: 'Loại',
      dataIndex: 'itemType',
      key: 'itemType',
      width: 100,
      render: (t) => {
        if (t === 'PART') return <Tag color="blue">Linh kiện</Tag>;
        if (t === 'LABOR') return <Tag color="green">Tiền công</Tag>;
        return <Tag color="default">Khác</Tag>;
      },
    },
    {
      title: 'Nội dung / Tên linh kiện',
      dataIndex: 'description',
      key: 'description',
      render: (text, r) => (
        <div>
          <div style={{ fontWeight: 600, color: '#fff' }}>{text}</div>
          {r.partName && <div style={{ fontSize: 12, color: '#9ca3af' }}>LK kho: {r.partName}</div>}
        </div>
      ),
    },
    {
      title: 'SL',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 70,
      align: 'center',
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 130,
      render: (p) => formatCurrency(p),
    },
    {
      title: 'Thành tiền',
      dataIndex: 'subtotal',
      key: 'subtotal',
      width: 140,
      render: (s) => <span style={{ fontWeight: 600, color: '#a78bfa' }}>{formatCurrency(s)}</span>,
    },
  ];

  return (
    <div>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/staff/tickets')}>
            Danh sách
          </Button>
          <div>
            <h2 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: 10 }}>
              Phiếu: <span style={{ color: '#a78bfa' }}>{ticket.ticketCode}</span>
              <TicketStatusBadge status={ticket.status} />
            </h2>
            <p style={{ margin: '4px 0 0 0', color: '#9ca3af', fontSize: 13 }}>
              Tạo ngày: {formatDate(ticket.createdAt)}
            </p>
          </div>
        </div>

        <Space>
          <Button icon={<QrcodeOutlined />} onClick={() => setQrModalOpen(true)}>
            Mã QR
          </Button>
          {ticket.status !== 'DELIVERED' && ticket.status !== 'CANCELLED' && (
            <Popconfirm
              title="Xác nhận đóng phiếu và bàn giao?"
              description="Hành động này sẽ cập nhật phiếu sang trạng thái ĐÃ BÀN GIAO."
              onConfirm={handleCloseTicket}
              okText="Đồng ý"
              cancelText="Hủy"
            >
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                loading={closingTicket}
                style={{ background: '#10b981', borderColor: '#10b981' }}
              >
                Bàn giao & Đóng phiếu
              </Button>
            </Popconfirm>
          )}
        </Space>
      </div>

      {/* Ticket Overview Card */}
      <Card className="glass-card" style={{ marginBottom: 20 }}>
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }} size="small">
          <Descriptions.Item label="Mã phiếu">
            <span style={{ fontWeight: 700, color: '#a78bfa' }}>{ticket.ticketCode}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Khách hàng">
            <span style={{ fontWeight: 600, color: '#fff' }}>{ticket.customerName || '—'}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Kỹ thuật viên phụ trách">
            {ticket.staffName || 'Chưa phân công'}
          </Descriptions.Item>
          <Descriptions.Item label="Thiết bị">
            <b>{ticket.deviceBrand}</b> {ticket.deviceModel} ({ticket.deviceType || 'Thiết bị'})
          </Descriptions.Item>
          <Descriptions.Item label="Số Serial (S/N)">
            <span style={{ fontFamily: 'monospace' }}>
              {ticket.deviceSerialNumber || ticket.serialNumber || '—'}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái hiện tại">
            <TicketStatusBadge status={ticket.status} />
          </Descriptions.Item>
          <Descriptions.Item label="Mô tả lỗi của khách" span={3}>
            <div style={{ color: '#f1f5f9', whiteSpace: 'pre-wrap' }}>{ticket.issueDescription}</div>
          </Descriptions.Item>
        </Descriptions>

        {/* Quick status progression actions */}
        <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ color: '#9ca3af', fontSize: 13, marginRight: 6 }}>Chuyển nhanh trạng thái:</span>
          {ticket.status === 'RECEIVED' && (
            <Button
              type="primary"
              onClick={() => handleUpdateStatus('DIAGNOSING', 'Bắt đầu kiểm tra chẩn đoán lỗi')}
              style={{ background: '#3b82f6', borderColor: '#3b82f6' }}
            >
              1. Bắt đầu kiểm tra (DIAGNOSING)
            </Button>
          )}
          {(ticket.status === 'DIAGNOSING' || ticket.status === 'APPROVED') && (
            <Button
              type="primary"
              onClick={() => handleUpdateStatus('REPAIRING', 'Bắt đầu tiến hành sửa chữa')}
              style={{ background: '#f59e0b', borderColor: '#f59e0b' }}
            >
              2. Bắt đầu sửa chữa (REPAIRING)
            </Button>
          )}
          {ticket.status === 'REPAIRING' && (
            <Button
              type="primary"
              onClick={() => handleUpdateStatus('COMPLETED', 'Đã sửa chữa và kiểm thử thành công')}
              style={{ background: '#10b981', borderColor: '#10b981' }}
            >
              3. Đã sửa xong (COMPLETED)
            </Button>
          )}
          {ticket.status === 'COMPLETED' && (
            <Button
              type="primary"
              onClick={() => handleCloseTicket()}
              style={{ background: '#059669', borderColor: '#059669' }}
            >
              4. Bàn giao khách hàng (DELIVERED)
            </Button>
          )}
        </div>
      </Card>

      {/* Main Workflow Tabs */}
      <Tabs
        defaultActiveKey="workflow"
        type="card"
        items={[
          {
            key: 'workflow',
            label: <span><ToolOutlined /> Quy trình xử lý phiếu</span>,
            children: (
              <div>
                {/* 1. DIAGNOSIS CARD */}
                <Card
                  title={<span style={{ color: 'white' }}>1. Chẩn đoán kỹ thuật (Diagnosis)</span>}
                  className="glass-card"
                  style={{ marginBottom: 20 }}
                >
                  <Form form={diagnosisForm} layout="vertical" onFinish={handleSaveDiagnosis}>
                    <Form.Item
                      name="diagnosisNotes"
                      label="Kết quả kiểm tra & Nguyên nhân hư hỏng"
                      rules={[{ required: true, message: 'Vui lòng nhập ghi chú chẩn đoán' }]}
                    >
                      <Input.TextArea
                        rows={3}
                        placeholder="Mô tả linh kiện bị hỏng, lỗi phần cứng/phần mềm cụ thể, phương án khắc phục..."
                      />
                    </Form.Item>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={updatingDiagnosis}
                        icon={<SaveOutlined />}
                        style={{ background: '#7c3aed', borderColor: '#7c3aed' }}
                      >
                        Lưu kết quả chẩn đoán
                      </Button>
                    </div>
                  </Form>
                </Card>

                {/* 2. QUOTE CARD */}
                <Card
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'white' }}>2. Báo giá sửa chữa (Itemized Quote)</span>
                      {quote && (
                        <Tag color={quote.status === 'ACCEPTED' ? 'green' : quote.status === 'REJECTED' ? 'red' : 'gold'}>
                          {quote.status === 'ACCEPTED' ? 'Khách đã duyệt' : quote.status === 'REJECTED' ? 'Khách từ chối' : 'Chờ khách duyệt'}
                        </Tag>
                      )}
                    </div>
                  }
                  className="glass-card"
                  style={{ marginBottom: 20 }}
                >
                  {quote ? (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div>
                          <div style={{ color: '#9ca3af', fontSize: 13 }}>
                            Người lập: <b>{quote.createdByName || 'Nhân viên'}</b> — Ngày lập: {formatDate(quote.createdAt)}
                          </div>
                          {quote.customerNote && (
                            <div style={{ color: '#f87171', fontSize: 13, marginTop: 4 }}>
                              Phản hồi của khách: <i>{quote.customerNote}</i>
                            </div>
                          )}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: '#9ca3af', fontSize: 12 }}>Tổng chi phí báo giá:</div>
                          <div style={{ fontSize: 20, fontWeight: 700, color: '#a78bfa' }}>
                            {formatCurrency(quote.totalAmount || 0)}
                          </div>
                        </div>
                      </div>

                      <Table
                        dataSource={quote.items || []}
                        columns={quoteItemsColumns}
                        rowKey="quoteItemId"
                        pagination={false}
                        size="small"
                      />

                      {quote.status === 'REJECTED' && (
                        <div style={{ marginTop: 16 }}>
                          <Alert
                            type="warning"
                            showIcon
                            message="Khách hàng đã từ chối báo giá này. Bạn có thể lập báo giá mới bên dưới."
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <Alert
                        type="info"
                        showIcon
                        message="Chưa có báo giá nào cho phiếu này. Hãy thêm các hạng mục linh kiện và tiền công để gửi khách."
                        style={{ marginBottom: 16 }}
                      />
                    </div>
                  )}

                  {/* Form Tạo Báo Giá mới (nếu chưa có hoặc đã bị từ chối) */}
                  {(!quote || quote.status === 'REJECTED') && (
                    <div style={{ marginTop: 24, borderTop: '1px solid #2d2b52', paddingTop: 16 }}>
                      <h4 style={{ color: '#fff', marginBottom: 12 }}>+ Tạo báo giá mới</h4>
                      <Form form={quoteForm} layout="vertical" onFinish={handleCreateQuote}>
                        <Form.List name="items" initialValue={[{ itemType: 'PART', description: '', quantity: 1, unitPrice: 0 }]}>
                          {(fields, { add, remove }) => (
                            <>
                              {fields.map(({ key, name, ...restField }) => (
                                <Row key={key} gutter={[12, 12]} align="middle" style={{ marginBottom: 12 }}>
                                  <Col xs={24} sm={4}>
                                    <Form.Item
                                      {...restField}
                                      name={[name, 'itemType']}
                                      label={key === 0 ? 'Loại' : ''}
                                      rules={[{ required: true }]}
                                    >
                                      <Select>
                                        <Option value="PART">Linh kiện</Option>
                                        <Option value="LABOR">Tiền công</Option>
                                        <Option value="OTHER">Khác</Option>
                                      </Select>
                                    </Form.Item>
                                  </Col>

                                  <Col xs={24} sm={6}>
                                    <Form.Item
                                      {...restField}
                                      name={[name, 'partId']}
                                      label={key === 0 ? 'Chọn từ kho (tùy chọn)' : ''}
                                    >
                                      <Select
                                        placeholder="Chọn LK kho..."
                                        allowClear
                                        showSearch
                                        optionFilterProp="children"
                                        onChange={(partId) => {
                                          const part = inventoryParts.find((p) => (p.partId || p.id) === partId);
                                          if (part) {
                                            const items = quoteForm.getFieldValue('items') || [];
                                            items[name] = {
                                              ...items[name],
                                              description: part.partName,
                                              unitPrice: part.unitPrice || 0,
                                            };
                                            quoteForm.setFieldsValue({ items });
                                          }
                                        }}
                                      >
                                        {inventoryParts.map((p) => (
                                          <Option key={p.partId || p.id} value={p.partId || p.id}>
                                            {p.partName} ({formatCurrency(p.unitPrice)})
                                          </Option>
                                        ))}
                                      </Select>
                                    </Form.Item>
                                  </Col>

                                  <Col xs={24} sm={6}>
                                    <Form.Item
                                      {...restField}
                                      name={[name, 'description']}
                                      label={key === 0 ? 'Mô tả chi tiết' : ''}
                                      rules={[{ required: true, message: 'Nhập mô tả' }]}
                                    >
                                      <Input placeholder="Tên linh kiện / Hạng mục" />
                                    </Form.Item>
                                  </Col>

                                  <Col xs={12} sm={3}>
                                    <Form.Item
                                      {...restField}
                                      name={[name, 'quantity']}
                                      label={key === 0 ? 'SL' : ''}
                                      rules={[{ required: true, message: 'SL' }]}
                                    >
                                      <InputNumber min={1} style={{ width: '100%' }} />
                                    </Form.Item>
                                  </Col>

                                  <Col xs={12} sm={4}>
                                    <Form.Item
                                      {...restField}
                                      name={[name, 'unitPrice']}
                                      label={key === 0 ? 'Đơn giá (VNĐ)' : ''}
                                      rules={[{ required: true, message: 'Đơn giá' }]}
                                    >
                                      <InputNumber
                                        min={0}
                                        style={{ width: '100%' }}
                                        formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={(val) => val.replace(/\$\s?|(,*)/g, '')}
                                      />
                                    </Form.Item>
                                  </Col>

                                  <Col xs={24} sm={1} style={{ textAlign: 'center' }}>
                                    {fields.length > 1 && (
                                      <Button
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => remove(name)}
                                        style={{ marginTop: key === 0 ? 30 : 0 }}
                                      />
                                    )}
                                  </Col>
                                </Row>
                              ))}

                              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
                                <Button
                                  type="dashed"
                                  onClick={() => add({ itemType: 'PART', description: '', quantity: 1, unitPrice: 0 })}
                                  icon={<PlusOutlined />}
                                >
                                  Thêm hạng mục
                                </Button>
                                <Button
                                  type="primary"
                                  htmlType="submit"
                                  loading={creatingQuote}
                                  style={{ background: '#7c3aed', borderColor: '#7c3aed' }}
                                >
                                  Lưu & Gửi báo giá
                                </Button>
                              </div>
                            </>
                          )}
                        </Form.List>
                      </Form>
                    </div>
                  )}
                </Card>

                {/* 3. INVENTORY EXPORT CARD */}
                <Card
                  title={<span style={{ color: 'white' }}>3. Xuất kho linh kiện cho phiếu sửa chữa</span>}
                  className="glass-card"
                  style={{ marginBottom: 20 }}
                >
                  <Form form={inventoryForm} layout="vertical" onFinish={handleExportPart}>
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          name="partId"
                          label="Linh kiện trong kho"
                          rules={[{ required: true, message: 'Vui lòng chọn linh kiện' }]}
                        >
                          <Select placeholder="Chọn linh kiện cần xuất" showSearch optionFilterProp="children">
                            {inventoryParts.map((p) => (
                              <Option key={p.partId || p.id} value={p.partId || p.id} disabled={p.quantityInStock <= 0}>
                                {p.partCode} — {p.partName} (Tồn: {p.quantityInStock} {p.unit || 'cái'})
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={4}>
                        <Form.Item
                          name="quantity"
                          label="Số lượng"
                          initialValue={1}
                          rules={[
                            { required: true, message: 'Nhập số lượng' },
                            { type: 'number', min: 1, message: 'Tối thiểu 1' },
                          ]}
                        >
                          <InputNumber min={1} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={8}>
                        <Form.Item name="note" label="Ghi chú xuất">
                          <Input placeholder="Vị trí lắp ráp, mục đích..." />
                        </Form.Item>
                      </Col>
                    </Row>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={exportingPart}
                        icon={<ExportOutlined />}
                        style={{ background: '#f59e0b', borderColor: '#f59e0b' }}
                      >
                        Xác nhận xuất kho cho phiếu
                      </Button>
                    </div>
                  </Form>
                </Card>

                {/* 4. INVOICE & PAYMENT CARD */}
                <Card
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'white' }}>4. Hóa đơn & Thanh toán</span>
                      {invoice && (
                        <Tag color={INVOICE_STATUS_COLORS[invoice.status] || 'default'}>
                          {invoice.status === 'PAID'
                            ? 'Đã thanh toán đủ'
                            : invoice.status === 'PARTIALLY_PAID'
                            ? 'Thanh toán 1 phần'
                            : 'Chưa thanh toán'}
                        </Tag>
                      )}
                    </div>
                  }
                  className="glass-card"
                  style={{ marginBottom: 20 }}
                >
                  {invoice ? (
                    <div>
                      <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }} size="small" style={{ marginBottom: 16 }}>
                        <Descriptions.Item label="Mã hóa đơn">
                          <span style={{ fontWeight: 700, color: '#a78bfa' }}>{invoice.invoiceCode}</span>
                        </Descriptions.Item>
                        <Descriptions.Item label="Tiền trước thuế (Subtotal)">
                          {formatCurrency(invoice.subtotal || 0)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Thuế VAT">
                          {formatCurrency(invoice.tax || 0)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Chiết khấu">
                          {formatCurrency(invoice.discount || 0)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tổng thanh toán">
                          <span style={{ fontWeight: 700, fontSize: 16, color: '#fff' }}>
                            {formatCurrency(invoice.finalAmount || 0)}
                          </span>
                        </Descriptions.Item>
                        <Descriptions.Item label="Đã thu">
                          <span style={{ color: '#10b981', fontWeight: 600 }}>
                            {formatCurrency(invoice.paidAmount || 0)}
                          </span>
                        </Descriptions.Item>
                      </Descriptions>

                      {/* Payment Action buttons */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          {invoice.status !== 'PAID' && (
                            <span style={{ color: '#f87171', fontWeight: 600 }}>
                              Còn phải thu:{' '}
                              {formatCurrency(Math.max(0, (invoice.finalAmount || 0) - (invoice.paidAmount || 0)))}
                            </span>
                          )}
                        </div>
                        <Space>
                          {invoice.status !== 'PAID' && (
                            <Button
                              type="primary"
                              icon={<DollarOutlined />}
                              onClick={() => {
                                const remaining = Math.max(0, (invoice.finalAmount || 0) - (invoice.paidAmount || 0));
                                paymentForm.setFieldsValue({
                                  amount: remaining,
                                  paymentMethod: 'CASH',
                                });
                                setPaymentModalOpen(true);
                              }}
                              style={{ background: '#10b981', borderColor: '#10b981' }}
                            >
                              Thu tiền thanh toán
                            </Button>
                          )}
                          <Button
                            icon={<DownloadOutlined />}
                            loading={downloadingPdf}
                            onClick={handleDownloadPdf}
                            style={{ color: '#60a5fa', borderColor: '#3b82f6' }}
                          >
                            Xuất PDF Hóa đơn
                          </Button>
                        </Space>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Alert
                        type="info"
                        showIcon
                        message="Chưa có hóa đơn cho phiếu này. Bạn có thể lập hóa đơn sau khi chẩn đoán và sửa chữa."
                        style={{ marginBottom: 16 }}
                      />
                      <Form form={invoiceForm} layout="vertical" onFinish={handleCreateInvoice}>
                        <Row gutter={16}>
                          <Col xs={12} sm={6}>
                            <Form.Item name="tax" label="Thuế VAT (VNĐ)" initialValue={0}>
                              <InputNumber
                                min={0}
                                style={{ width: '100%' }}
                                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(val) => val.replace(/\$\s?|(,*)/g, '')}
                              />
                            </Form.Item>
                          </Col>
                          <Col xs={12} sm={6}>
                            <Form.Item name="discount" label="Giảm giá / Chiết khấu (VNĐ)" initialValue={0}>
                              <InputNumber
                                min={0}
                                style={{ width: '100%' }}
                                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(val) => val.replace(/\$\s?|(,*)/g, '')}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={creatingInvoice}
                          icon={<FileTextOutlined />}
                          style={{ background: '#7c3aed', borderColor: '#7c3aed' }}
                        >
                          Lập hóa đơn từ báo giá
                        </Button>
                      </Form>
                    </div>
                  )}
                </Card>
              </div>
            ),
          },
          {
            key: 'timeline',
            label: <span><ClockCircleOutlined /> Lịch sử trạng thái ({timeline.length})</span>,
            children: (
              <Card className="glass-card">
                <Timeline
                  items={timeline.map((item) => ({
                    color: item.status === 'COMPLETED' || item.status === 'DELIVERED' ? 'green' : 'purple',
                    children: (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <TicketStatusBadge status={item.status} />
                          <span style={{ fontSize: 12, color: '#9ca3af' }}>{formatDate(item.changedAt)}</span>
                        </div>
                        {item.note && <div style={{ color: '#e2e8f0', fontSize: 13 }}>{item.note}</div>}
                        {item.changedBy && (
                          <div style={{ fontSize: 12, color: '#7c3aed' }}>Thực hiện bởi: {item.changedBy}</div>
                        )}
                      </div>
                    ),
                  }))}
                />
              </Card>
            ),
          },
        ]}
      />

      {/* Modal QR Code */}
      <Modal
        title={`Mã QR tra cứu phiếu: ${ticket.ticketCode}`}
        open={qrModalOpen}
        onCancel={() => setQrModalOpen(false)}
        footer={null}
        width={340}
        style={{ textAlign: 'center' }}
      >
        <div style={{ padding: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ background: '#fff', padding: 16, borderRadius: 8, display: 'inline-block' }}>
            <QRCodeSVG value={ticket.ticketCode} size={200} />
          </div>
          <p style={{ marginTop: 16, color: '#9ca3af', fontSize: 13 }}>
            Khách hàng quét mã này để theo dõi tiến độ sửa chữa trực tuyến
          </p>
        </div>
      </Modal>

      {/* Modal Ghi nhận thanh toán */}
      <Modal
        title={`Thu tiền hóa đơn: ${invoice?.invoiceCode || ''}`}
        open={paymentModalOpen}
        onCancel={() => setPaymentModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={paymentForm} layout="vertical" onFinish={handleRecordPayment}>
          <div style={{ background: '#1e1b4b', padding: '12px 16px', borderRadius: 8, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: '#9ca3af' }}>Tổng tiền hóa đơn:</span>
              <span style={{ fontWeight: 600, color: '#fff' }}>{formatCurrency(invoice?.finalAmount || 0)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: '#9ca3af' }}>Đã thanh toán:</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>{formatCurrency(invoice?.paidAmount || 0)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #312e81', paddingTop: 6 }}>
              <span style={{ color: '#f87171', fontWeight: 600 }}>Còn phải thu:</span>
              <span style={{ color: '#f87171', fontWeight: 700, fontSize: 16 }}>
                {formatCurrency(Math.max(0, (invoice?.finalAmount || 0) - (invoice?.paidAmount || 0)))}
              </span>
            </div>
          </div>

          <Form.Item
            name="amount"
            label="Số tiền thu"
            rules={[
              { required: true, message: 'Vui lòng nhập số tiền' },
              { type: 'number', min: 1000, message: 'Tối thiểu 1,000 đ' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="paymentMethod"
            label="Hình thức thanh toán"
            rules={[{ required: true, message: 'Vui lòng chọn hình thức' }]}
          >
            <Select options={PAYMENT_METHODS} size="large" />
          </Form.Item>

          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea rows={2} placeholder="Mã giao dịch, thông tin tham chiếu..." />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <Button onClick={() => setPaymentModalOpen(false)}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={recordingPayment}
              style={{ background: '#10b981', borderColor: '#10b981' }}
            >
              Xác nhận thu tiền
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

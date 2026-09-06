import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message } from 'antd';
import { customerApi } from '../../api/customerApi';

export default function CustomerDevices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await customerApi.getMyDevices();
      setDevices(res.data.data);
    } catch (error) {
      message.error('Lỗi tải danh sách thiết bị');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDevice = async (values) => {
    try {
      await customerApi.addDevice(values);
      message.success('Thêm thiết bị thành công');
      setIsModalVisible(false);
      form.resetFields();
      fetchDevices();
    } catch (error) {
      message.error('Lỗi khi thêm thiết bị');
    }
  };

  const columns = [
    { title: 'Loại', dataIndex: 'deviceType', key: 'type' },
    { title: 'Hãng', dataIndex: 'brand', key: 'brand' },
    { title: 'Model', dataIndex: 'model', key: 'model' },
    { title: 'Serial/IMEI', dataIndex: 'serialNumber', key: 'serial' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Thiết bị của tôi</h2>
        <Button type="primary" onClick={() => setIsModalVisible(true)}>Thêm thiết bị</Button>
      </div>
      <Table dataSource={devices} columns={columns} rowKey="id" loading={loading} />

      <Modal title="Thêm thiết bị mới" open={isModalVisible} onCancel={() => setIsModalVisible(false)} onOk={() => form.submit()}>
        <Form form={form} onFinish={handleAddDevice} layout="vertical">
          <Form.Item name="deviceType" label="Loại thiết bị" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="brand" label="Hãng" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="model" label="Model" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="serialNumber" label="Số Serial/IMEI"><Input /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

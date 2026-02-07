import { useEffect, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Upload,
  message,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import client from '@/api/client.js';

const HealthModelConfig = () => {
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filterName, setFilterName] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [cover, setCover] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize, filterName]);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const payload = {
        current: pagination.current,
        size: pagination.pageSize,
        name: filterName || undefined,
      };
      const { data } = await client.post('/health-model-config/query', payload);
      if (data.code === 200) {
        setTableData(data.data);
        setPagination(prev => ({ ...prev, total: data.total }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = pag => {
    setPagination(prev => ({ ...prev, current: pag.current, pageSize: pag.pageSize }));
  };

  const uploadProps = {
    showUploadList: false,
    customRequest: async ({ file, onSuccess, onError }) => {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const { data } = await client.post('/file/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (data.code === 200) {
          setCover(data.data);
          message.success('icon upload success');
          onSuccess(data, file);
        } else {
          throw new Error(data.msg || 'upload failed');
        }
      } catch (error) {
        message.error(error.message || 'upload failed');
        onError(error);
      }
    },
  };

  const openModal = record => {
    setEditing(record);
    form.resetFields();
    if (record) {
      form.setFieldsValue({
        name: record.name,
        unit: record.unit,
        symbol: record.symbol,
        valueRange: record.valueRange,
        detail: record.detail,
        isGlobal: record.isGlobal,
      });
      setCover(record.cover || '');
    } else {
      form.setFieldsValue({
        name: '',
        unit: '',
        symbol: '',
        valueRange: '',
        detail: '',
        isGlobal: true,
      });
      setCover('');
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = { ...values, cover };
      if (editing) {
        payload.id = editing.id;
        await client.put('/health-model-config/update', payload);
        message.success('model updated');
      } else {
        await client.post('/health-model-config/config/save', payload);
        message.success('model added');
      }
      setModalOpen(false);
      setEditing(null);
      fetchModels();
    } catch (error) {
      if (error?.errorFields) return;
      message.error(error.message || 'operation failed');
    }
  };

  const handleDelete = async ids => {
    await client.post('/health-model-config/batchDelete', ids);
    message.success('model deleted');
    fetchModels();
  };

  const columns = [
    {
      title: 'icon',
      dataIndex: 'cover',
      render: url => <Avatar src={url} shape="square" size={40} />,
    },
    { title: 'model name', dataIndex: 'name' },
    {
      title: 'permission',
      dataIndex: 'isGlobal',
      render: val => (val ? 'global' : 'private'),
    },
    { title: 'config user', dataIndex: 'userName' },
    { title: 'value range', dataIndex: 'valueRange' },
    { title: 'unit', dataIndex: 'unit' },
    { title: 'symbol', dataIndex: 'symbol' },
    { title: 'introduction', dataIndex: 'detail' },
    {
      title: 'operation',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => openModal(record)}>
            edit
          </Button>
          <Popconfirm title="delete model?" onConfirm={() => handleDelete([record.id])}>
            <Button type="link" danger>
              delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="model manage"
      extra={
        <Space>
          {selectedRowKeys.length ? (
            <Popconfirm title="delete selected?" onConfirm={() => handleDelete(selectedRowKeys)}>
              <Button danger>batch delete</Button>
            </Popconfirm>
          ) : null}
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(null)}>
            add model
          </Button>
        </Space>
      }
    >
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="model name"
          value={filterName}
          onChange={e => {
            setFilterName(e.target.value);
            setPagination(prev => ({ ...prev, current: 1 }));
          }}
          style={{ width: 240 }}
        />
        <Button onClick={() => setFilterName('')}>reset</Button>
      </Space>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={tableData}
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
      />

      <Modal
        open={modalOpen}
        title={editing ? 'edit model' : 'add model'}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText="save"
      >
        <Form form={form} layout="vertical">
          <Form.Item label="icon">
            <Upload {...uploadProps}>
              <Button>upload</Button>
            </Upload>
            {cover ? <Avatar src={cover} size={64} style={{ marginTop: 12 }} /> : null}
          </Form.Item>
          <Form.Item label="config name" name="name" rules={[{ required: true }]}>
            <Input placeholder="input" />
          </Form.Item>
          <Form.Item label="unit" name="unit" rules={[{ required: true }]}>
            <Input placeholder="input" />
          </Form.Item>
          <Form.Item label="symbol" name="symbol" rules={[{ required: true }]}>
            <Input placeholder="input" />
          </Form.Item>
          <Form.Item label="value range" name="valueRange" rules={[{ required: true }]}>
            <Input placeholder="format: min,max" />
          </Form.Item>
          <Form.Item label="introduction" name="detail" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="global model" name="isGlobal" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default HealthModelConfig;

import { useEffect, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Space,
  Tabs,
  Typography,
  Upload,
  message,
} from 'antd';
import client from '@/api/client.js';

const Record = () => {
  const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || 'null');
  const [models, setModels] = useState([]);
  const [selectedModels, setSelectedModels] = useState([]);
  const [activeTab, setActiveTab] = useState('global');
  const [nameFilter, setNameFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [cover, setCover] = useState('');

  useEffect(() => {
    fetchModels(activeTab);
  }, [activeTab, nameFilter]);

  const fetchModels = async tab => {
    const payload = { name: nameFilter || undefined };
    if (tab === 'global') {
      payload.isGlobal = true;
    } else if (userInfo) {
      payload.userId = userInfo.id;
    }
    const { data } = await client.post('/health-model-config/query', payload);
    if (data.code === 200) {
      setModels(data.data);
    }
  };

  const toggleModel = model => {
    const exists = selectedModels.find(item => item.id === model.id);
    if (exists) {
      setSelectedModels(selectedModels.filter(item => item.id !== model.id));
    } else {
      setSelectedModels([...selectedModels, { ...model, value: '' }]);
    }
  };

  const handleValueChange = (modelId, value) => {
    setSelectedModels(prev => prev.map(model => (model.id === modelId ? { ...model, value } : model)));
  };

  const handleRecord = async () => {
    if (!selectedModels.length) {
      message.warning('please select at least one model');
      return;
    }
    try {
      const payload = selectedModels.map(model => ({
        healthModelConfigId: model.id,
        value: model.value,
      }));
      const { data } = await client.post('/user-health/save', payload);
      if (data.code === 200) {
        message.success('record success');
        setSelectedModels([]);
      }
    } catch (error) {
      message.error('record failed');
    }
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

  const handleAddModel = async () => {
    try {
      const values = await form.validateFields();
      const payload = { ...values, cover, userId: userInfo?.id };
      const { data } = await client.post('/health-model-config/save', payload);
      if (data.code === 200) {
        message.success('model added');
        setModalOpen(false);
        setCover('');
        form.resetFields();
        fetchModels(activeTab);
      } else {
        message.error(data.msg);
      }
    } catch (error) {
      if (error?.errorFields) return;
      message.error('add model failed');
    }
  };

  return (
    <Row gutter={32}>
      <Col xs={24} lg={8}>
        <Card
          title="model list"
          extra={<Button onClick={() => setModalOpen(true)}>add model</Button>}
          style={{ maxHeight: '80vh', overflowY: 'auto' }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              { key: 'global', label: 'global model' },
              { key: 'personal', label: 'my model' },
            ]}
          />
        <Input
          placeholder="search model"
          value={nameFilter}
          onChange={e => setNameFilter(e.target.value)}
          style={{ marginBottom: 12 }}
        />
          {models.length === 0 ? (
            <Empty description="no model" />
          ) : (
            models.map(model => (
              <Card
                key={model.id}
                onClick={() => toggleModel(model)}
                style={{ marginBottom: 12, cursor: 'pointer' }}
                type={selectedModels.find(item => item.id === model.id) ? 'inner' : undefined}
              >
                <Space>
                  <Avatar src={model.cover} />
                  <div>
                    <Typography.Text strong>{model.name}</Typography.Text>
                    <div>
                      <Typography.Text type="secondary">
                        {model.unit} · {model.symbol}
                      </Typography.Text>
                    </div>
                  </div>
                </Space>
              </Card>
            ))
          )}
        </Card>
      </Col>
      <Col xs={24} lg={16}>
        <Card title="data input panel">
          {selectedModels.length === 0 ? (
            <Empty description="select model to record" />
          ) : (
            selectedModels.map(model => (
              <div key={model.id} style={{ marginBottom: 16 }}>
                <Typography.Title level={5}>
                  {model.name} ({model.unit})
                </Typography.Title>
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder={`normal value range: ${model.valueRange}`}
                  value={model.value}
                  onChange={value => handleValueChange(model.id, value)}
                />
              </div>
            ))
          )}
          <Button type="primary" onClick={handleRecord} disabled={!selectedModels.length}>
            record now
          </Button>
        </Card>
      </Col>

      <Modal
        open={modalOpen}
        title="add health model"
        onOk={handleAddModel}
        onCancel={() => setModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="icon">
            <Upload {...uploadProps}>
              <Button>upload</Button>
            </Upload>
            {cover ? <Avatar src={cover} size={64} style={{ marginTop: 12 }} /> : null}
          </Form.Item>
          <Form.Item label="model name" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="unit" name="unit" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="symbol" name="symbol" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="value range" name="valueRange" rules={[{ required: true }]}>
            <Input placeholder="format: min,max" />
          </Form.Item>
          <Form.Item label="detail" name="detail" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Row>
  );
};

export default Record;

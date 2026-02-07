import { useEffect, useState } from 'react';
import { Button, Card, Form, Input, Modal, Popconfirm, Space, Table, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import client from '@/api/client.js';

const TagsManagement = () => {
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filterName, setFilterName] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize, filterName]);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const payload = {
        current: pagination.current,
        size: pagination.pageSize,
        name: filterName || undefined,
      };
      const { data } = await client.post('/tags/query', payload);
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

  const openModal = record => {
    setEditing(record);
    form.setFieldsValue({ name: record?.name || '' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await client.put('/tags/update', { id: editing.id, name: values.name });
        message.success('tag updated');
      } else {
        await client.post('/tags/save', { name: values.name });
        message.success('tag added');
      }
      setModalOpen(false);
      setEditing(null);
      fetchTags();
    } catch (error) {
      if (error?.errorFields) return;
      message.error(error.message || 'operation failed');
    }
  };

  const handleDelete = async id => {
    await client.post('/tags/batchDelete', [id]);
    message.success('tag deleted');
    fetchTags();
  };

  const columns = [
    { title: 'tag name', dataIndex: 'name' },
    {
      title: 'operation',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => openModal(record)}>
            edit
          </Button>
          <Popconfirm title="delete tag?" onConfirm={() => handleDelete(record.id)}>
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
      title="news category"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(null)}>
          add tag
        </Button>
      }
    >
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="tag name"
          value={filterName}
          onChange={e => {
            setFilterName(e.target.value);
            setPagination(prev => ({ ...prev, current: 1 }));
          }}
          style={{ width: 220 }}
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
      />

      <Modal
        open={modalOpen}
        title={editing ? 'edit tag' : 'add tag'}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText="save"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="tag name"
            name="name"
            rules={[{ required: true, message: 'please input tag name' }]}
          >
            <Input placeholder="input" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default TagsManagement;

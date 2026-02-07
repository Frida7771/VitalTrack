import { useEffect, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Upload,
  message,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import md5 from 'js-md5';
import client from '@/api/client.js';
import { buildDateRangePayload } from '@/utils/time.js';

const { RangePicker } = DatePicker;

const UserManagement = () => {
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({ userName: '', dateRange: [] });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { startTime, endTime } = buildDateRangePayload(filters.dateRange);
      const payload = {
        current: pagination.current,
        size: pagination.pageSize,
        userName: filters.userName || undefined,
        startTime,
        endTime,
      };
      const { data } = await client.post('/user/query', payload);
      if (data.code === 200) {
        setTableData(data.data);
        setPagination(prev => ({ ...prev, total: data.total }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = changed => {
    setFilters(prev => ({ ...prev, ...changed }));
    setPagination(prev => ({ ...prev, current: 1 }));
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
          setAvatarUrl(data.data);
          message.success('avatar upload success');
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
    setEditingRecord(record);
    form.resetFields();
    if (record) {
      form.setFieldsValue({
        userName: record.userName,
        userAccount: record.userAccount,
        userEmail: record.userEmail,
        userRole: record.userRole,
      });
      setAvatarUrl(record.userAvatar || '');
    } else {
      setAvatarUrl('');
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        userAvatar: avatarUrl,
        userName: values.userName,
        userAccount: values.userAccount,
        userEmail: values.userEmail,
        userRole: values.userRole,
      };
      if (values.userPwd) {
        payload.userPwd = md5(md5(values.userPwd));
      }
      if (editingRecord) {
        payload.id = editingRecord.id;
        await client.put('/user/backUpdate', payload);
        message.success('user updated');
      } else {
        await client.post('/user/insert', payload);
        message.success('user added');
      }
      setModalOpen(false);
      setEditingRecord(null);
      fetchUsers();
    } catch (error) {
      if (error?.errorFields) return;
      message.error(error.message || 'operation failed');
    }
  };

  const handleStatusChange = async (record, field, value) => {
    await client.put('/user/backUpdate', { id: record.id, [field]: value });
    message.success('status updated');
    fetchUsers();
  };

  const handleDelete = async ids => {
    await client.post('/user/batchDelete', ids);
    message.success('user deleted');
    fetchUsers();
  };

  const columns = [
    {
      title: 'avatar',
      dataIndex: 'userAvatar',
      render: src => <Avatar src={src} />,
    },
    { title: 'name', dataIndex: 'userName' },
    { title: 'account', dataIndex: 'userAccount' },
    { title: 'email', dataIndex: 'userEmail' },
    {
      title: 'role',
      dataIndex: 'userRole',
      render: role => (role === 1 ? 'admin' : 'user'),
    },
    {
      title: 'ban login',
      dataIndex: 'isLogin',
      render: (value, record) => (
        <Switch checked={value} onChange={checked => handleStatusChange(record, 'isLogin', checked)} />
      ),
    },
    {
      title: 'ban comment',
      dataIndex: 'isWord',
      render: (value, record) => (
        <Switch checked={value} onChange={checked => handleStatusChange(record, 'isWord', checked)} />
      ),
    },
    { title: 'register time', dataIndex: 'createTime' },
    {
      title: 'operation',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => openModal(record)}>
            edit
          </Button>
          <Popconfirm title="delete user?" onConfirm={() => handleDelete([record.id])}>
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
      title="user manage"
      extra={
        <Space>
          {selectedRowKeys.length ? (
            <Popconfirm title="delete selected?" onConfirm={() => handleDelete(selectedRowKeys)}>
              <Button danger>batch delete</Button>
            </Popconfirm>
          ) : null}
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(null)}>
            add user
          </Button>
        </Space>
      }
    >
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Input
          placeholder="input user name"
          value={filters.userName}
          onChange={e => handleFilterChange({ userName: e.target.value })}
          style={{ width: 220 }}
        />
        <RangePicker
          value={filters.dateRange}
          onChange={range => handleFilterChange({ dateRange: range })}
        />
        <Button onClick={() => handleFilterChange({ userName: '', dateRange: [] })}>reset</Button>
      </Row>
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
        title={editingRecord ? 'edit user' : 'add user'}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText="save"
      >
        <Form form={form} layout="vertical">
          <Form.Item label="avatar">
            <Upload {...uploadProps}>
              <Button>upload</Button>
            </Upload>
            {avatarUrl ? <Avatar src={avatarUrl} size={64} style={{ marginTop: 12 }} /> : null}
          </Form.Item>
          <Form.Item
            label="user name"
            name="userName"
            rules={[{ required: true, message: 'please input user name' }]}
          >
            <Input placeholder="input" />
          </Form.Item>
          <Form.Item
            label="account"
            name="userAccount"
            rules={[{ required: true, message: 'please input account' }]}
          >
            <Input placeholder="input" />
          </Form.Item>
          <Form.Item
            label="email"
            name="userEmail"
            rules={[{ type: 'email', required: true, message: 'please input email' }]}
          >
            <Input placeholder="input" />
          </Form.Item>
          <Form.Item label="password" name="userPwd">
            <Input.Password placeholder={editingRecord ? 'leave blank to keep original' : 'input password'} />
          </Form.Item>
          <Form.Item
            label="role"
            name="userRole"
            rules={[{ required: true, message: 'please select role' }]}
          >
            <Select options={[{ value: 1, label: 'admin' }, { value: 2, label: 'user' }]} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default UserManagement;

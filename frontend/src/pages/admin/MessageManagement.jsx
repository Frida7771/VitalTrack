import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  message,
} from 'antd';
import client from '@/api/client.js';
import { buildDateRangePayload } from '@/utils/time.js';

const { RangePicker } = DatePicker;

const typeMap = {
  1: 'comment reply',
  2: 'comment like',
  3: 'index reminder',
  4: 'system notification',
};

const MessageManagement = () => {
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({ content: '', dateRange: [], messageType: null });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [pushOpen, setPushOpen] = useState(false);
  const [pushContent, setPushContent] = useState('');

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize, filters.content, filters.dateRange, filters.messageType]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { startTime, endTime } = buildDateRangePayload(filters.dateRange);
      const payload = {
        current: pagination.current,
        size: pagination.pageSize,
        content: filters.content || undefined,
        messageType: filters.messageType || undefined,
        startTime,
        endTime,
      };
      const { data } = await client.post('/message/query', payload);
      if (data.code === 200) {
        setTableData(data.data);
        setPagination(prev => ({ ...prev, total: data.total }));
      }
    } finally {
      setLoading(false);
    }
  };

  const parseText = text => {
    if (!text) return '';
    const parts = text.split(';');
    return parts.length >= 3 ? parts[2] : text;
  };

  const handleTableChange = pag => {
    setPagination(prev => ({ ...prev, current: pag.current, pageSize: pag.pageSize }));
  };

  const handleDelete = async ids => {
    await client.post('/message/batchDelete', ids);
    message.success('message deleted');
    fetchMessages();
  };

  const handlePush = async () => {
    if (!pushContent.trim()) {
      message.error('content required');
      return;
    }
    const { data } = await client.post('/message/systemInfoUsersSave', { content: pushContent });
    if (data.code === 200) {
      message.success('push success');
      setPushContent('');
      setPushOpen(false);
      fetchMessages();
    }
  };

  const columns = [
    {
      title: 'read status',
      dataIndex: 'isRead',
      render: value => (value ? 'read' : 'unread'),
    },
    {
      title: 'message type',
      dataIndex: 'messageType',
      render: type => typeMap[type] || 'system notification',
    },
    { title: 'receiver', dataIndex: 'receiverName' },
    {
      title: 'message body',
      dataIndex: 'content',
      render: text => parseText(text),
    },
    { title: 'send time', dataIndex: 'createTime' },
    {
      title: 'operation',
      render: (_, record) => (
        <Popconfirm title="delete message?" onConfirm={() => handleDelete([record.id])}>
          <Button type="link" danger>
            delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Card
      title="message manage"
      extra={
        <Space>
          {selectedRowKeys.length ? (
            <Popconfirm title="delete selected?" onConfirm={() => handleDelete(selectedRowKeys)}>
              <Button danger>batch delete</Button>
            </Popconfirm>
          ) : null}
          <Button type="primary" onClick={() => setPushOpen(true)}>
            message push
          </Button>
        </Space>
      }
    >
      <Space style={{ marginBottom: 16 }}>
        <RangePicker
          value={filters.dateRange}
          onChange={range => {
            setFilters(prev => ({ ...prev, dateRange: range }));
            setPagination(prev => ({ ...prev, current: 1 }));
          }}
        />
        <Input
          placeholder="content"
          value={filters.content}
          onChange={e => {
            setFilters(prev => ({ ...prev, content: e.target.value }));
            setPagination(prev => ({ ...prev, current: 1 }));
          }}
          style={{ width: 220 }}
        />
        <Select
          placeholder="message type"
          allowClear
          value={filters.messageType}
          options={Object.entries(typeMap).map(([value, label]) => ({ value: Number(value), label }))}
          style={{ width: 200 }}
          onChange={value => {
            setFilters(prev => ({ ...prev, messageType: value || null }));
            setPagination(prev => ({ ...prev, current: 1 }));
          }}
        />
        <Button onClick={() => setFilters({ content: '', dateRange: [], messageType: null })}>reset</Button>
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
        open={pushOpen}
        title="message push"
        onOk={handlePush}
        onCancel={() => setPushOpen(false)}
        okText="push"
      >
        <Input.TextArea
          rows={4}
          value={pushContent}
          onChange={e => setPushContent(e.target.value)}
          placeholder="input message content"
        />
      </Modal>
    </Card>
  );
};

export default MessageManagement;

import { useEffect, useState } from 'react';
import { Button, Card, DatePicker, Input, Popconfirm, Space, Table, Tag, message } from 'antd';
import client from '@/api/client.js';
import { buildDateRangePayload } from '@/utils/time.js';

const { RangePicker } = DatePicker;

const UserHealthManagement = () => {
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({ userId: '', dateRange: [] });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize, filters.userId, filters.dateRange]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const { startTime, endTime } = buildDateRangePayload(filters.dateRange);
      const payload = {
        current: pagination.current,
        size: pagination.pageSize,
        userId: filters.userId || undefined,
        startTime,
        endTime,
      };
      const { data } = await client.post('/user-health/query', payload);
      if (data.code === 200) {
        setTableData(data.data);
        setPagination(prev => ({ ...prev, total: data.total }));
      }
    } finally {
      setLoading(false);
    }
  };

  const statusCheck = record => {
    if (!record.valueRange || record.value == null) return true;
    const [min, max] = record.valueRange.split(',').map(Number);
    const value = Number(record.value);
    return value >= min && value <= max;
  };

  const handleTableChange = pag => {
    setPagination(prev => ({ ...prev, current: pag.current, pageSize: pag.pageSize }));
  };

  const handleDelete = async ids => {
    await client.post('/user-health/batchDelete', ids);
    message.success('record deleted');
    fetchRecords();
  };

  const columns = [
    {
      title: 'status',
      width: 120,
      render: (_, record) =>
        statusCheck(record) ? <Tag color="success">normal</Tag> : <Tag color="error">abnormal</Tag>,
    },
    {
      title: 'value',
      dataIndex: 'value',
      render: (value, record) => (
        <span>
          {value} ({record.unit})
        </span>
      ),
      sorter: (a, b) => a.value - b.value,
    },
    { title: 'user', dataIndex: 'userName' },
    { title: 'threshold', dataIndex: 'valueRange' },
    { title: 'model name', dataIndex: 'name' },
    { title: 'unit', dataIndex: 'unit' },
    { title: 'symbol', dataIndex: 'symbol' },
    { title: 'user ID', dataIndex: 'userId' },
    { title: 'time', dataIndex: 'createTime' },
    {
      title: 'operation',
      render: (_, record) => (
        <Popconfirm title="delete record?" onConfirm={() => handleDelete([record.id])}>
          <Button type="link" danger>
            delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Card
      title="health record"
      extra={
        selectedRowKeys.length ? (
          <Popconfirm title="delete selected?" onConfirm={() => handleDelete(selectedRowKeys)}>
            <Button danger>batch delete</Button>
          </Popconfirm>
        ) : null
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
          placeholder="user ID"
          value={filters.userId}
          onChange={e => {
            setFilters(prev => ({ ...prev, userId: e.target.value }));
            setPagination(prev => ({ ...prev, current: 1 }));
          }}
          style={{ width: 180 }}
        />
        <Button onClick={() => setFilters({ userId: '', dateRange: [] })}>reset</Button>
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
    </Card>
  );
};

export default UserHealthManagement;

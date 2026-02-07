import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Input,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tooltip,
  message,
} from 'antd';
import client from '@/api/client.js';
import { buildDateRangePayload } from '@/utils/time.js';
import PieChartCard from '@/components/charts/PieChartCard.jsx';

const { RangePicker } = DatePicker;

const EvaluationsManagement = () => {
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [filters, setFilters] = useState({ content: '', dateRange: [] });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [reportsData, setReportsData] = useState([]);

  useEffect(() => {
    fetchEvaluations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize, filters.content, filters.dateRange]);

  const fetchEvaluations = async () => {
    setLoading(true);
    try {
      const { startTime, endTime } = buildDateRangePayload(filters.dateRange);
      const payload = {
        current: pagination.current,
        size: pagination.pageSize,
        content: filters.content || undefined,
        startTime,
        endTime,
      };
      const { data } = await client.post('/evaluations/query', payload);
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

  const handleDelete = async ids => {
    await client.post('/evaluations/batchDelete', ids);
    message.success('evaluation removed');
    fetchEvaluations();
  };

  const openReports = async record => {
    const { data } = await client.get(`/evaluations-reports/reportCount/${record.id}`);
    if (data.code === 200) {
      setReportsData(data.data.map(item => ({ name: item.name, value: item.count })));
      setReportsOpen(true);
    }
  };

  const columns = [
    {
      title: 'text',
      dataIndex: 'content',
      render: text => (
        <Tooltip title={text} placement="bottom">
          <div style={{ maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{text}</div>
        </Tooltip>
      ),
    },
    {
      title: 'like',
      dataIndex: 'upvoteList',
      width: 80,
      render: value => (value ? value.split(',').length : 0),
    },
    { title: 'source', dataIndex: 'contentType', width: 120 },
    { title: 'commented at', dataIndex: 'createTime', width: 160 },
    { title: 'commenter', dataIndex: 'userName', width: 140 },
    { title: 'commented', dataIndex: 'replierName', width: 140 },
    {
      title: 'level',
      dataIndex: 'parentId',
      width: 120,
      render: value => (value === null ? 'parent' : 'child'),
    },
    {
      title: 'operation',
      fixed: 'right',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => openReports(record)}>
            report detail
          </Button>
          <Popconfirm title="delete comment?" onConfirm={() => handleDelete([record.id])}>
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
      title="comment manage"
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
          placeholder="content"
          value={filters.content}
          onChange={e => {
            setFilters(prev => ({ ...prev, content: e.target.value }));
            setPagination(prev => ({ ...prev, current: 1 }));
          }}
          style={{ width: 220 }}
        />
        <Button onClick={() => setFilters({ content: '', dateRange: [] })}>reset</Button>
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={tableData}
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        scroll={{ x: 900 }}
        rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
      />

      <Modal open={reportsOpen} title="report detail" footer={null} onCancel={() => setReportsOpen(false)}>
        {reportsData.length ? <PieChartCard title="report overview" data={reportsData} /> : 'no data'}
      </Modal>
    </Card>
  );
};

export default EvaluationsManagement;

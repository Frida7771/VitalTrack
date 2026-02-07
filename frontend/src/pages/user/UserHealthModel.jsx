import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  DatePicker,
  Empty,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import ReactECharts from 'echarts-for-react';
import client from '@/api/client.js';
import { buildDateRangePayload } from '@/utils/time.js';

const { RangePicker } = DatePicker;

const UserHealthModel = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || 'null');
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [chartRange, setChartRange] = useState(365);
  const [chartData, setChartData] = useState({ values: [], dates: [] });
  const [records, setRecords] = useState([]);
  const [filters, setFilters] = useState({ dateRange: [], healthModelConfigId: null });
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  useEffect(() => {
    loadModels();
  }, []);

  useEffect(() => {
    if (selectedModel) {
      loadChart(selectedModel.id, chartRange);
    }
  }, [selectedModel, chartRange]);

  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.dateRange, filters.healthModelConfigId, pagination.current, pagination.pageSize]);

  const loadModels = async () => {
    const { data } = await client.post('/health-model-config/modelList');
    if (data.code === 200 && data.data.length) {
      setModels(data.data);
      setSelectedModel(data.data[0]);
      setFilters(prev => ({ ...prev, healthModelConfigId: data.data[0].id }));
    }
  };

  const loadChart = async (modelId, days) => {
    const { data } = await client.get(`/user-health/timeQuery/${modelId}/${days}`);
    if (data.code === 200) {
      const ordered = data.data.reverse();
      setChartData({
        values: ordered.map(item => item.value),
        dates: ordered.map(item => item.createTime),
      });
    }
  };

  const fetchRecords = async () => {
    if (!userInfo) return;
    const { startTime, endTime } = buildDateRangePayload(filters.dateRange);
    const payload = {
      current: pagination.current,
      size: pagination.pageSize,
      startTime,
      endTime,
      userId: userInfo.id,
      healthModelConfigId: filters.healthModelConfigId,
    };
    const { data } = await client.post('/user-health/query', payload);
    if (data.code === 200) {
      setRecords(data.data);
      setPagination(prev => ({ ...prev, total: data.total }));
    }
  };

  const chartOption = useMemo(
    () => ({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: chartData.dates },
      yAxis: { type: 'value' },
      grid: { left: 50, right: 10, top: 20, bottom: 30 },
      series: [
        {
          data: chartData.values,
          type: 'line',
          smooth: true,
          areaStyle: { color: 'rgba(43,121,203,0.1)' },
          lineStyle: { color: '#2b79cb' },
        },
      ],
    }),
    [chartData],
  );

  const statusCheck = record => {
    if (!record.valueRange || record.value == null) return true;
    const [min, max] = record.valueRange.split(',').map(Number);
    const value = Number(record.value);
    return value >= min && value <= max;
  };

  const columns = [
    {
      title: 'indicator',
      dataIndex: 'name',
      render: text => (
        <Space>
          <i className="el-icon-paperclip" />
          {text}
        </Space>
      ),
    },
    {
      title: 'value',
      dataIndex: 'value',
      render: (value, record) => (
        <Typography.Text strong>
          {value} {record.unit}
        </Typography.Text>
      ),
    },
    { title: 'symbol', dataIndex: 'symbol' },
    {
      title: 'status',
      render: (_, record) =>
        statusCheck(record) ? <Tag color="success">normal</Tag> : <Tag color="error">abnormal</Tag>,
    },
    { title: 'time', dataIndex: 'createTime' },
  ];

  return (
    <div>
      <Card style={{ marginBottom: 24 }}>
        <Typography.Title level={3}>
          health life, start now · every change is worth recording
        </Typography.Title>
        <Button type="link" onClick={() => navigate('/record')}>
          go to record
        </Button>
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <Space style={{ marginBottom: 16 }}>
          <Select
            style={{ minWidth: 220 }}
            value={selectedModel?.id}
            options={models.map(model => ({ value: model.id, label: model.name }))}
            onChange={value => {
              const model = models.find(item => item.id === value);
              setSelectedModel(model);
              setFilters(prev => ({ ...prev, healthModelConfigId: value }));
            }}
          />
          <Select
            value={chartRange}
            onChange={setChartRange}
            options={[
              { value: 30, label: '30 days' },
              { value: 90, label: '90 days' },
              { value: 180, label: '180 days' },
              { value: 365, label: '365 days' },
            ]}
          />
        </Space>
        {chartData.values.length === 0 ? (
          <Empty description="no data, go to record" />
        ) : (
          <ReactECharts option={chartOption} style={{ height: 400 }} />
        )}
      </Card>

      <Card title="health indicator data">
        <Space style={{ marginBottom: 16 }}>
          <Select
            placeholder="select model"
            allowClear
            value={filters.healthModelConfigId}
            style={{ minWidth: 200 }}
            options={[{ value: null, label: 'all' }, ...models.map(model => ({ value: model.id, label: model.name }))]}
            onChange={value => {
              setFilters(prev => ({ ...prev, healthModelConfigId: value }));
              setPagination(prev => ({ ...prev, current: 1 }));
            }}
          />
          <RangePicker
            value={filters.dateRange}
            onChange={range => {
              setFilters(prev => ({ ...prev, dateRange: range }));
              setPagination(prev => ({ ...prev, current: 1 }));
            }}
          />
        </Space>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={records}
          pagination={pagination}
          onChange={pag => setPagination({ ...pagination, current: pag.current, pageSize: pag.pageSize })}
        />
      </Card>
    </div>
  );
};

export default UserHealthModel;

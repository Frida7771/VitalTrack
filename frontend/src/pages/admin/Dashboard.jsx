import { useEffect, useState } from 'react';
import { Card, Col, Row, Typography } from 'antd';
import client from '@/api/client.js';
import LineChartCard from '@/components/charts/LineChartCard.jsx';
import PieChartCard from '@/components/charts/PieChartCard.jsx';
import { timeAgo } from '@/utils/time.js';

const Dashboard = () => {
  const [pieData, setPieData] = useState([]);
  const [messages, setMessages] = useState([]);
  const [userSeries, setUserSeries] = useState({ values: [], dates: [] });
  const [modelSeries, setModelSeries] = useState({ values: [], dates: [] });

  useEffect(() => {
    loadPie();
    loadMessages();
    loadUsers(365);
    loadModels(365);
  }, []);

  const loadPie = async () => {
    const { data } = await client.get('/views/staticControls');
    if (data.code === 200) {
      setPieData(data.data.map(item => ({ name: item.name, value: item.count })));
    }
  };

  const loadMessages = async () => {
    const { data } = await client.post('/message/query', { current: 1, size: 4 });
    if (data.code === 200) {
      setMessages(data.data);
    }
  };

  const loadUsers = async days => {
    const { data } = await client.get(`/user/daysQuery/${days}`);
    if (data.code === 200) {
      setUserSeries({
        values: data.data.map(item => item.count),
        dates: data.data.map(item => item.name),
      });
    }
  };

  const loadModels = async days => {
    const { data } = await client.get(`/user-health/daysQuery/${days}`);
    if (data.code === 200) {
      setModelSeries({
        values: data.data.map(item => item.count),
        dates: data.data.map(item => item.name),
      });
    }
  };

  return (
    <div>
      <Row gutter={24}>
        <Col xs={24} lg={8}>
          <PieChartCard title="info ratio" data={pieData} />
        </Col>
        <Col xs={24} lg={16}>
          <Card className="full-height-card" title="latest message">
            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
              {messages.map(item => (
                <div key={item.id} style={{ marginBottom: 16 }}>
                  <Typography.Title level={4} style={{ marginBottom: 4 }}>
                    {item.receiverName}
                  </Typography.Title>
                  <Typography.Paragraph style={{ marginBottom: 4 }}>
                    {item.content?.split(';').pop()}
                  </Typography.Paragraph>
                  <Typography.Text type="secondary">{timeAgo(item.createTime)}</Typography.Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
      <Row gutter={24} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <LineChartCard
            title="user count"
            data={userSeries.values}
            categories={userSeries.dates}
            onRangeChange={loadUsers}
          />
        </Col>
        <Col xs={24} lg={12}>
          <LineChartCard
            title="health index"
            data={modelSeries.values}
            categories={modelSeries.dates}
            onRangeChange={loadModels}
          />
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;

import PropTypes from 'prop-types';
import { Card } from 'antd';
import ReactECharts from 'echarts-for-react';

const PieChartCard = ({ title, data }) => {
  const option = {
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [
      {
        name: title,
        type: 'pie',
        radius: ['45%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: { show: false, position: 'center' },
        emphasis: {
          label: {
            show: true,
            fontSize: 18,
            fontWeight: 'bold',
          },
        },
        labelLine: { show: false },
        data: data.map(item => ({ value: item.value, name: item.name })),
      },
    ],
  };

  return (
    <Card className="full-height-card" style={{ marginBottom: 24 }} title={title}>
      <ReactECharts option={option} style={{ height: 280 }} />
    </Card>
  );
};

PieChartCard.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    }),
  ),
};

PieChartCard.defaultProps = {
  data: [],
};

export default PieChartCard;

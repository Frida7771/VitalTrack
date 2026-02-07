import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Card, Segmented } from 'antd';
import ReactECharts from 'echarts-for-react';

const ranges = [
  { label: '30d', value: 30 },
  { label: '90d', value: 90 },
  { label: '180d', value: 180 },
  { label: '365d', value: 365 },
];

const LineChartCard = ({ title, subtitle, data, categories, onRangeChange }) => {
  const [range, setRange] = useState(365);

  const option = useMemo(
    () => ({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: categories },
      yAxis: { type: 'value' },
      grid: { left: 40, right: 20, top: 30, bottom: 24 },
      series: [
        {
          data,
          type: 'line',
          smooth: true,
          areaStyle: {
            color: 'rgba(21, 85, 154, 0.15)',
          },
          lineStyle: {
            color: '#15559a',
          },
          symbol: 'circle',
          symbolSize: 6,
        },
      ],
    }),
    [categories, data],
  );

  const handleRangeChange = value => {
    setRange(value);
    onRangeChange?.(value);
  };

  return (
    <Card
      className="full-height-card"
      style={{ width: 420, marginBottom: 16 }}
      title={title}
      extra={
        <Segmented
          size="small"
          options={ranges}
          value={range}
          onChange={handleRangeChange}
        />
      }
    >
      {subtitle ? <div className="text-muted" style={{ marginBottom: 8 }}>{subtitle}</div> : null}
      <ReactECharts option={option} style={{ height: 240 }} />
    </Card>
  );
};

LineChartCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  data: PropTypes.arrayOf(PropTypes.number),
  categories: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  onRangeChange: PropTypes.func,
};

LineChartCard.defaultProps = {
  data: [],
  categories: [],
  subtitle: '',
  onRangeChange: undefined,
};

export default LineChartCard;

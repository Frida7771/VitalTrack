import PropTypes from 'prop-types';
import { Carousel, Typography } from 'antd';
import { timeAgo } from '@/utils/time.js';

const Banner = ({ items, onSelect }) => (
  <Carousel autoplay dots className="banner-carousel">
    {items.map(item => (
      <div
        key={item.id || item.name}
        onClick={() => onSelect?.(item)}
        style={{
          minHeight: 260,
          borderRadius: 20,
          background: `linear-gradient(135deg, rgba(21,85,154,0.85), rgba(74,194,154,0.85)), url(${item.cover}) center/cover`,
          color: '#fff',
          padding: 32,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          cursor: 'pointer',
        }}
      >
        <Typography.Title level={3} style={{ color: '#fff' }}>
          {item.name}
        </Typography.Title>
        <Typography.Text style={{ color: 'rgba(255,255,255,0.8)' }}>
          {timeAgo(item.createTime)} · {item.tagName}
        </Typography.Text>
      </div>
    ))}
  </Carousel>
);

Banner.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object),
  onSelect: PropTypes.func,
};

Banner.defaultProps = {
  items: [],
  onSelect: undefined,
};

export default Banner;

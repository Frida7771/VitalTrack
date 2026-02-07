import PropTypes from 'prop-types';
import { Tag } from 'antd';

const TagLine = ({ items, activeId, onSelect }) => (
  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', margin: '24px 0' }}>
    {items.map(tag => (
      <Tag
        key={tag.id ?? tag.name}
        color={activeId === tag.id ? 'processing' : 'default'}
        style={{ cursor: 'pointer', padding: '6px 14px', fontSize: 14 }}
        onClick={() => onSelect?.(tag)}
      >
        {tag.name}
      </Tag>
    ))}
  </div>
);

TagLine.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      name: PropTypes.string,
    }),
  ),
  activeId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onSelect: PropTypes.func,
};

TagLine.defaultProps = {
  items: [],
  activeId: null,
  onSelect: undefined,
};

export default TagLine;

import PropTypes from 'prop-types';

const Logo = ({ sysName = 'Health', tagline = 'health is the way', bag = '#15559a' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <div
      style={{
        width: 46,
        height: 46,
        borderRadius: 12,
        background: `linear-gradient(135deg, ${bag}, #67b0f2)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 700,
        fontSize: 22,
        textTransform: 'uppercase',
      }}
    >
      H
    </div>
    <div style={{ lineHeight: 1.2 }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: '#111' }}>{sysName}</div>
      <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>{tagline}</div>
    </div>
  </div>
);

Logo.propTypes = {
  sysName: PropTypes.string,
  tagline: PropTypes.string,
  bag: PropTypes.string,
};

export default Logo;

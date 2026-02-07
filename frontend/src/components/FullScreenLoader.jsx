import { Spin } from 'antd';

const FullScreenLoader = ({ tip = 'Loading...' }) => (
  <div
    style={{
      width: '100%',
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Spin size="large" tip={tip} />
  </div>
);

export default FullScreenLoader;

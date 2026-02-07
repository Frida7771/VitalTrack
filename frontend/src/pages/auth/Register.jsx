import { useState } from 'react';
import { Button, Form, Input, Typography, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import md5 from 'js-md5';
import Logo from '@/components/Logo.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import './authStyles.scss';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleFinish = async values => {
    if (values.userPwd !== values.confirmPwd) {
      message.error('passwords do not match');
      return;
    }
    setLoading(true);
    const payload = {
      userAccount: values.userAccount,
      userName: values.userName,
      userPwd: md5(md5(values.userPwd)),
    };
    try {
      await register(payload);
      message.success('register success, please login');
      navigate('/login');
    } catch (error) {
      message.error(error.message || 'register failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-card__hero">
          <Logo sysName="start your plan" tagline="consistency · balance" />
          <Typography.Title level={2} style={{ color: '#fff', margin: 0 }}>
            join the platform
          </Typography.Title>
          <Typography.Paragraph style={{ color: '#e2e8f0', fontSize: 16 }}>
            collect real-time health records, follow curated content, and
            visualize your personal health model.
          </Typography.Paragraph>
        </div>
        <div className="auth-card__content">
          <Typography.Title level={3}>create account</Typography.Title>
          <Typography.Paragraph type="secondary">
            fill the fields below to start your journey
          </Typography.Paragraph>
          <Form layout="vertical" className="auth-form" onFinish={handleFinish} requiredMark={false}>
            <Form.Item
              label="account"
              name="userAccount"
              rules={[{ required: true, message: 'please input account' }]}
            >
              <Input size="large" placeholder="register account" />
            </Form.Item>
            <Form.Item
              label="user name"
              name="userName"
              rules={[{ required: true, message: 'please input user name' }]}
            >
              <Input size="large" placeholder="user name" />
            </Form.Item>
            <Form.Item
              label="password"
              name="userPwd"
              rules={[{ required: true, message: 'please input password' }]}
            >
              <Input.Password size="large" placeholder="input password" />
            </Form.Item>
            <Form.Item
              label="confirm password"
              name="confirmPwd"
              rules={[{ required: true, message: 'please confirm password' }]}
            >
              <Input.Password size="large" placeholder="confirm password" />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} className="auth-submit" size="large">
              register
            </Button>
          </Form>
          <div className="auth-footer">
            have account? <Link to="/login">return to login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

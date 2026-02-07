import { useState } from 'react';
import { Button, Form, Input, Typography, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import md5 from 'js-md5';
import Logo from '@/components/Logo.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import './authStyles.scss';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleFinish = async values => {
    setLoading(true);
    const payload = {
      userAccount: values.userAccount,
      userPwd: md5(md5(values.userPwd)),
    };
    try {
      const { role } = await login(payload);
      message.success('login success');
      navigate(role === 1 ? '/admin/dashboard' : '/user/record', { replace: true });
    } catch (error) {
      message.error(error.message || 'login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-card__hero">
          <Logo sysName="health manager" tagline="balance · data-driven" />
          <Typography.Title level={2} style={{ color: '#fff', margin: 0 }}>
            welcome back!
          </Typography.Title>
          <Typography.Paragraph style={{ color: '#e2e8f0', fontSize: 16 }}>
            organize health insights, manage members, and keep your wellness
            community connected.
          </Typography.Paragraph>
        </div>
        <div className="auth-card__content">
          <Typography.Title level={3}>login to dashboard</Typography.Title>
          <Typography.Paragraph type="secondary">
            enter your account to continue
          </Typography.Paragraph>
          <Form layout="vertical" className="auth-form" onFinish={handleFinish} requiredMark={false}>
            <Form.Item
              label="account"
              name="userAccount"
              rules={[{ required: true, message: 'please input account' }]}
            >
              <Input size="large" placeholder="input account" autoComplete="username" />
            </Form.Item>
            <Form.Item
              label="password"
              name="userPwd"
              rules={[{ required: true, message: 'please input password' }]}
            >
              <Input.Password size="large" placeholder="input password" autoComplete="current-password" />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} className="auth-submit" size="large">
              login
            </Button>
          </Form>
          <div className="auth-footer">
            no account? <Link to="/register">register here</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

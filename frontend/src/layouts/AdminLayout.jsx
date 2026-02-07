import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ApartmentOutlined,
  CommentOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MessageOutlined,
  PieChartOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Dropdown,
  Form,
  Input,
  Layout,
  Menu,
  Modal,
  Space,
  Typography,
  Upload,
  message,
} from 'antd';
import { useAuth } from '@/context/AuthContext.jsx';
import client from '@/api/client.js';
import { getActivePath, setActivePath } from '@/utils/storage.js';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/admin/dashboard', icon: <PieChartOutlined />, label: 'dashboard' },
  { key: '/admin/users', icon: <TeamOutlined />, label: 'user manage' },
  { key: '/admin/tags', icon: <TagIcon />, label: 'tags manage' },
  { key: '/admin/model-config', icon: <SettingOutlined />, label: 'model manage' },
  { key: '/admin/health-records', icon: <ApartmentOutlined />, label: 'health record' },
  { key: '/admin/messages', icon: <MessageOutlined />, label: 'message manage' },
  { key: '/admin/evaluations', icon: <CommentOutlined />, label: 'comment manage' },
];

function TagIcon() {
  return (
    <span className="anticon" style={{ fontSize: 16, display: 'inline-flex' }}>
      🏷️
    </span>
  );
}

const AdminLayout = () => {
  const savedPath = getActivePath();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useAuth();
  const [collapsed, setCollapsed] = useState(() => sessionStorage.getItem('flag') === 'true');
  const [profileOpen, setProfileOpen] = useState(false);
  const [avatar, setAvatar] = useState(user?.userAvatar || '');
  const [form] = Form.useForm();
  const activeKey = useMemo(() => savedPath || location.pathname, [savedPath, location.pathname]);

  useEffect(() => {
    setActivePath(location.pathname);
  }, [location.pathname]);

  const handleMenuClick = ({ key }) => {
    setActivePath(key);
    if (location.pathname !== key) {
      navigate(key);
    }
  };

  const handleProfileOpen = () => {
    form.setFieldsValue({
      userName: user?.userName,
      userEmail: user?.userEmail,
    });
    setAvatar(user?.userAvatar || '');
    setProfileOpen(true);
  };

  const uploadProps = {
    name: 'file',
    showUploadList: false,
    customRequest: async ({ file, onSuccess, onError }) => {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const { data } = await client.post('/file/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (data.code === 200) {
          setAvatar(data.data);
          message.success('avatar upload success');
          onSuccess(data, file);
        } else {
          throw new Error(data.msg || 'upload failed');
        }
      } catch (error) {
        message.error(error.message || 'upload failed');
        onError(error);
      }
    },
  };

  const handleProfileSave = async () => {
    try {
      const values = await form.validateFields();
      await client.put('/user/update', {
        userAvatar: avatar,
        userName: values.userName,
        userEmail: values.userEmail,
      });
      message.success('profile updated');
      setProfileOpen(false);
      refreshUser();
    } catch (error) {
      if (error?.errorFields) return;
      message.error(error.message || 'update failed');
    }
  };

  const dropdownItems = [
    {
      key: 'profile',
      label: 'personal information',
      icon: <UserOutlined />,
      onClick: handleProfileOpen,
    },
    {
      key: 'logout',
      label: 'logout',
      icon: <LogoutOutlined />,
      onClick: () => logout(true),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        width={260}
        style={{ background: '#f8f9fd', borderRight: '1px solid #eceff5' }}
      >
        <div style={{ padding: 24 }}>
          <Typography.Title
            level={4}
            style={{ color: '#111', textTransform: 'uppercase', letterSpacing: 1 }}
          >
            VitalTrack
          </Typography.Title>
        </div>
        <Menu
          selectedKeys={[activeKey]}
          mode="inline"
          items={menuItems}
          onClick={handleMenuClick}
          style={{ background: '#f8f9fd' }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #eceff5',
          }}
        >
          <Space size="large">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => {
                const next = !collapsed;
                sessionStorage.setItem('flag', String(next));
                setCollapsed(next);
              }}
            />
            <Typography.Text style={{ fontSize: 18, fontWeight: 600, textTransform: 'capitalize' }}>
              admin · {menuItems.find(item => item.key === activeKey)?.label || 'dashboard'}
            </Typography.Text>
          </Space>
          <Dropdown menu={{ items: dropdownItems }} trigger={['click']} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar src={user?.userAvatar} />
              <Typography.Text>{user?.userName}</Typography.Text>
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ padding: 24, background: '#f5f7fb', minHeight: 'calc(100vh - 64px)' }}>
          <Outlet />
        </Content>
      </Layout>
      <Modal
        open={profileOpen}
        title="personal information"
        onOk={handleProfileSave}
        onCancel={() => setProfileOpen(false)}
        okText="update"
      >
        <Form form={form} layout="vertical">
          <Form.Item label="avatar">
            <Upload {...uploadProps}>
              <Button icon={<UserOutlined />}>upload</Button>
            </Upload>
            {avatar ? <Avatar src={avatar} size={64} style={{ marginTop: 12 }} /> : null}
          </Form.Item>
          <Form.Item
            label="user name"
            name="userName"
            rules={[{ required: true, message: 'please input user name' }]}
          >
            <Input placeholder="input" />
          </Form.Item>
          <Form.Item
            label="user email"
            name="userEmail"
            rules={[{ type: 'email', required: true, message: 'please input email' }]}
          >
            <Input placeholder="input" />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default AdminLayout;

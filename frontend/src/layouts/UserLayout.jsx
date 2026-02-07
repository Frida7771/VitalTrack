import { useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  AuditOutlined,
  LogoutOutlined,
  MedicineBoxOutlined,
  MessageOutlined,
  SearchOutlined,
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
  Upload,
  message,
} from 'antd';
import md5 from 'js-md5';
import { useAuth } from '@/context/AuthContext.jsx';
import client from '@/api/client.js';
import { getActivePath, setActivePath } from '@/utils/storage.js';

const { Header, Content } = Layout;

const menuItems = [
  { key: '/user/record', icon: <AuditOutlined />, label: 'health record' },
  { key: '/user/health-model', icon: <MedicineBoxOutlined />, label: 'health visualization' },
  { key: '/user/message', icon: <MessageOutlined />, label: 'message' },
];

const UserLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [avatar, setAvatar] = useState(user?.userAvatar || '');
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const savedPath = getActivePath();
  const activeKey = useMemo(() => {
    const directMatch = menuItems.some(item => item.key === location.pathname);
    if (directMatch) {
      return location.pathname;
    }
    return savedPath || '/user/record';
  }, [location.pathname, savedPath]);

  const handleMenuClick = ({ key }) => {
    setActivePath(key);
    navigate(key);
  };

  const openProfileModal = () => {
    profileForm.setFieldsValue({
      userName: user?.userName,
      userEmail: user?.userEmail,
    });
    setAvatar(user?.userAvatar || '');
    setProfileOpen(true);
  };

  const openPwdModal = () => {
    passwordForm.resetFields();
    setPwdOpen(true);
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
      const values = await profileForm.validateFields();
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

  const handlePasswordReset = async () => {
    try {
      const values = await passwordForm.validateFields();
      if (values.newPwd !== values.againPwd) {
        message.error('password input inconsistent');
        return;
      }
      await client.put('/user/updatePwd', {
        oldPwd: md5(md5(values.oldPwd)),
        newPwd: md5(md5(values.newPwd)),
      });
      message.success('password updated, please login again');
      setPwdOpen(false);
      logout(true);
    } catch (error) {
      if (error?.errorFields) return;
      message.error(error.message || 'update failed');
    }
  };

  const dropdownMenu = {
    items: [
      { key: 'center', label: 'personal center', icon: <UserOutlined />, onClick: openProfileModal },
      { key: 'resetPwd', label: 'reset password', icon: <SearchOutlined />, onClick: openPwdModal },
      { key: 'logout', label: 'logout', icon: <LogoutOutlined />, onClick: () => logout(true) },
    ],
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <Header
        style={{
          background: '#fff',
          borderBottom: '1px solid #eceff5',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Menu
          mode="horizontal"
          selectedKeys={[activeKey]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ flex: 1 }}
        />
        <Dropdown menu={dropdownMenu} trigger={['click']} placement="bottomRight">
          <Space style={{ marginLeft: 24, cursor: 'pointer' }}>
            <Avatar src={user?.userAvatar} />
            <span>{user?.userName}</span>
          </Space>
        </Dropdown>
      </Header>
      <Content style={{ padding: '24px 48px', background: '#f5f7fb', minHeight: 'calc(100vh - 64px)' }}>
        <Outlet />
      </Content>

      <Modal
        open={profileOpen}
        title="personal center"
        onOk={handleProfileSave}
        onCancel={() => setProfileOpen(false)}
        okText="update"
      >
        <Form form={profileForm} layout="vertical">
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

      <Modal
        open={pwdOpen}
        title="reset password"
        onOk={handlePasswordReset}
        onCancel={() => setPwdOpen(false)}
        okText="update"
      >
        <Form form={passwordForm} layout="vertical">
          <Form.Item
            label="original password"
            name="oldPwd"
            rules={[{ required: true, message: 'please input original password' }]}
          >
            <Input.Password placeholder="input" />
          </Form.Item>
          <Form.Item
            label="new password"
            name="newPwd"
            rules={[{ required: true, message: 'please input new password' }]}
          >
            <Input.Password placeholder="input" />
          </Form.Item>
          <Form.Item
            label="confirm password"
            name="againPwd"
            rules={[{ required: true, message: 'please confirm password' }]}
          >
            <Input.Password placeholder="input" />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default UserLayout;

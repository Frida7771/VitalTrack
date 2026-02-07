import { useEffect, useState } from 'react';
import { Avatar, Button, Card, Empty, Input, List, Modal, Segmented, Space, Typography, message } from 'antd';
import client from '@/api/client.js';

const MessageCenter = () => {
  const [userInfo, setUserInfo] = useState(() => JSON.parse(sessionStorage.getItem('userInfo') || 'null'));
  const [messageTypes, setMessageTypes] = useState([]);
  const [activeType, setActiveType] = useState(null);
  const [messageList, setMessageList] = useState([]);
  const [replyModal, setReplyModal] = useState({ open: false, target: null, content: '' });

  useEffect(() => {
    loadTypes();
  }, []);

  useEffect(() => {
    loadMessages();
  }, [activeType]);

  const loadTypes = async () => {
    const { data } = await client.get('/message/types');
    if (data.code === 200) {
      const types = [{ type: null, detail: 'all messages' }, ...data.data];
      setMessageTypes(types);
      setActiveType(types[0].type);
    }
  };

  const loadMessages = async () => {
    if (!userInfo) return;
    const payload = { userId: userInfo.id };
    if (activeType) {
      payload.messageType = activeType;
    }
    const { data } = await client.post('/message/query', payload);
    if (data.code === 200) {
      setMessageList(data.data);
    }
  };

  const clearMessages = async () => {
    const { data } = await client.put('/message/clearMessage');
    if (data.code === 200) {
      message.success('messages marked as read');
      loadMessages();
    }
  };

  const replyUser = target => {
    setReplyModal({ open: true, target, content: '' });
  };

  const handleReplySubmit = async () => {
    const { target, content } = replyModal;
    if (!content.trim()) {
      message.warning('reply content cannot be empty');
      return;
    }
    const parts = target.content.split(';');
    const payload = {
      content,
      parentId: parts[0],
      contentId: parts[1],
      contentType: 'NEWS',
      replierId: target.senderId,
    };
    const { data } = await client.post('/evaluations/insert', payload);
    if (data.code === 200) {
      message.success('reply success');
      setReplyModal({ open: false, target: null, content: '' });
    }
  };

  const renderMessageDescription = msg => {
    if (msg.messageType === 1) {
      const detail = msg.content.split(';');
      return detail[2];
    }
    if (msg.messageType === 2) {
      return `liked your comment【${msg.content}】`;
    }
    return msg.content;
  };

  return (
    <div>
      <Card
        style={{ marginBottom: 16 }}
        title="message center"
        extra={<Button onClick={clearMessages}>mark all read</Button>}
      >
        <Segmented
          value={activeType}
          onChange={setActiveType}
          options={messageTypes.map(type => ({ label: type.detail, value: type.type }))}
        />
      </Card>

      {messageList.length === 0 ? (
        <Empty description="no message" />
      ) : (
        <List
          itemLayout="vertical"
          dataSource={messageList}
          renderItem={item => (
            <List.Item>
              <Space align="start" style={{ width: '100%', justifyContent: 'space-between' }}>
                <Space align="start">
                  <Avatar
                    size={48}
                    src={item.messageType === 3 ? null : item.senderAvatar}
                    style={item.messageType === 3 ? { background: '#6abeee', color: '#fff' } : {}}
                  >
                    {item.messageType === 3 ? 'AI' : null}
                  </Avatar>
                  <div>
                    {item.senderName ? <Typography.Title level={5}>{item.senderName}</Typography.Title> : null}
                    <Typography.Text>{renderMessageDescription(item)}</Typography.Text>
                    <div style={{ marginTop: 8 }}>
                      <Typography.Text type="secondary">{item.createTime}</Typography.Text>
                      {item.messageType === 1 ? (
                        <Button type="link" size="small" onClick={() => replyUser(item)}>
                          reply
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </Space>
              </Space>
            </List.Item>
          )}
        />
      )}

      <Modal
        open={replyModal.open}
        title={replyModal.target ? `reply ${replyModal.target.senderName}` : ''}
        onOk={handleReplySubmit}
        onCancel={() => setReplyModal({ open: false, target: null, content: '' })}
      >
        <Input.TextArea
          rows={3}
          value={replyModal.content}
          onChange={e => setReplyModal(prev => ({ ...prev, content: e.target.value }))}
          placeholder="reply content"
        />
      </Modal>
    </div>
  );
};

export default MessageCenter;

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Avatar,
  Button,
  Comment,
  Input,
  List,
  Popconfirm,
  Space,
  Typography,
  message,
} from 'antd';
import client from '@/api/client.js';
import { timeAgo } from '@/utils/time.js';

const Comments = ({ contentId, contentType }) => {
  const [comments, setComments] = useState([]);
  const [count, setCount] = useState(0);
  const [content, setContent] = useState('');
  const [replyingParent, setReplyingParent] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyingChild, setReplyingChild] = useState(null);
  const [childReplyText, setChildReplyText] = useState('');
  const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || 'null');

  useEffect(() => {
    if (!contentId || !contentType) return;
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentId, contentType]);

  const loadComments = async () => {
    const { data } = await client.get(`/evaluations/list/${contentId}/${contentType}`);
    if (data.code === 200) {
      const formatted = data.data.data.map(parent => ({
        ...parent,
        time: timeAgo(parent.createTime),
        commentChildVOS: parent.commentChildVOS.map(child => ({
          ...child,
          time: timeAgo(child.createTime),
        })),
      }));
      setComments(formatted);
      setCount(data.data.evaluationsCount);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      message.warning('comment content is empty');
      return;
    }
    const payload = {
      content,
      contentId,
      contentType,
    };
    const { data } = await client.post('/evaluations/insert', payload);
    if (data.code === 200) {
      setContent('');
      loadComments();
    }
  };

  const handleReplyParent = async parent => {
    if (!replyText.trim()) {
      message.warning('comment content is empty');
      return;
    }
    const payload = {
      content: replyText,
      contentId,
      contentType,
      parentId: parent.id,
    };
    const { data } = await client.post('/evaluations/insert', payload);
    if (data.code === 200) {
      setReplyText('');
      setReplyingParent(null);
      loadComments();
    }
  };

  const handleReplyChild = async child => {
    if (!childReplyText.trim()) {
      message.warning('comment content is empty');
      return;
    }
    const payload = {
      content: childReplyText,
      contentId,
      contentType,
      parentId: child.parentId,
      replierId: child.userId,
    };
    const { data } = await client.post('/evaluations/insert', payload);
    if (data.code === 200) {
      setChildReplyText('');
      setReplyingChild(null);
      loadComments();
    }
  };

  const handleDelete = async comment => {
    await client.delete(`/evaluations/delete/${comment.id}`);
    message.success('comment deleted');
    loadComments();
  };

  const handleLike = async comment => {
    const { data } = await client.put('/evaluations/update', { id: comment.id });
    if (data.code === 200) {
      loadComments();
    }
  };

  const renderActions = (comment, isChild = false) => {
    const actions = [
      <Button type="link" size="small" onClick={() => handleLike(comment)} key="like">
        {comment.upvoteFlag ? `liked · ${comment.upvoteCount}` : 'like'}
      </Button>,
      <Button
        type="link"
        size="small"
        onClick={() => {
          if (isChild) {
            setReplyingChild(comment.id);
            setReplyingParent(null);
          } else {
            setReplyingParent(comment.id);
            setReplyingChild(null);
          }
        }}
        key="reply"
      >
        reply
      </Button>,
    ];
    if (userInfo && comment.userId === userInfo.id) {
      actions.push(
        <Popconfirm title="delete comment?" onConfirm={() => handleDelete(comment)} key="delete">
          <Button type="link" danger size="small">
            delete
          </Button>
        </Popconfirm>,
      );
    }
    return actions;
  };

  return (
    <div style={{ marginTop: 32 }}>
      <Typography.Title level={3}>Comments · {count}</Typography.Title>
      <Comment
        avatar={<Avatar src={userInfo?.userAvatar} alt={userInfo?.userName} />}
        content={
          <div>
            <Input.TextArea
              rows={3}
              maxLength={300}
              placeholder="Please be friendly"
              value={content}
              onChange={e => setContent(e.target.value)}
            />
            <Button type="primary" style={{ marginTop: 12 }} onClick={handleSubmit}>
              comment
            </Button>
          </div>
        }
      />
      <List
        dataSource={comments}
        locale={{ emptyText: 'no comments' }}
        renderItem={item => (
          <Comment
            key={item.id}
            author={
              <Space>
                <span>{item.userName}</span>
                {userInfo && item.userId === userInfo.id ? <Typography.Text type="secondary">(myself)</Typography.Text> : null}
              </Space>
            }
            avatar={<Avatar src={item.userAvatar} />}
            content={<Typography.Paragraph>{item.content}</Typography.Paragraph>}
            datetime={item.time}
            actions={renderActions(item)}
          >
            {replyingParent === item.id && (
              <div style={{ margin: '12px 0' }}>
                <Input.TextArea
                  rows={2}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder={`reply ${item.userName}...`}
                />
                <Button type="link" onClick={() => handleReplyParent(item)}>
                  submit reply
                </Button>
              </div>
            )}
            {item.commentChildVOS.map(child => (
              <Comment
                key={child.id}
                author={
                  <Space>
                    <span>{child.userName}</span>
                    {child.replierName ? <Typography.Text type="secondary">reply {child.replierName}</Typography.Text> : null}
                  </Space>
                }
                avatar={<Avatar src={child.userAvatar} size="small" />}
                content={<Typography.Text>{child.content}</Typography.Text>}
                datetime={child.time}
                actions={renderActions(child, true)}
              >
                {replyingChild === child.id && (
                  <div style={{ margin: '12px 0' }}>
                    <Input.TextArea
                      rows={2}
                      value={childReplyText}
                      onChange={e => setChildReplyText(e.target.value)}
                      placeholder={`reply ${child.userName}...`}
                    />
                    <Button type="link" onClick={() => handleReplyChild(child)}>
                      submit reply
                    </Button>
                  </div>
                )}
              </Comment>
            ))}
          </Comment>
        )}
      />
    </div>
  );
};

Comments.propTypes = {
  contentId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  contentType: PropTypes.string.isRequired,
};

export default Comments;

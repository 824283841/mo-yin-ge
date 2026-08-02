import React, { useState } from 'react';
import { Card, Input, Button, message } from 'antd';
import { apiFetch } from '../api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  async function onLogin() {
    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      localStorage.setItem('token', res.access_token);
      message.success('登录成功');
      window.location.href = '/';
    } catch (e: any) {
      message.error(e.message || '登录失败');
    }
  }

  async function onRegister() {
    try {
      const res = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      message.success('注册成功，已获得初始额度');
      // 自动登录（可选)
      const login = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      localStorage.setItem('token', login.access_token);
      window.location.href = '/';
    } catch (e: any) {
      message.error(e.message || '注册失败');
    }
  }

  return (
    <Card title="登录 / 注册" style={{ maxWidth: 480, margin: '48px auto' }}>
      <Input placeholder="用户名" value={username} onChange={e=>setUsername(e.target.value)} style={{ marginBottom: 12 }} />
      <Input.Password placeholder="密码" value={password} onChange={e=>setPassword(e.target.value)} style={{ marginBottom: 12 }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <Button type="primary" onClick={onLogin} block>登录</Button>
        <Button onClick={onRegister} block>注册</Button>
      </div>
    </Card>
  );
}

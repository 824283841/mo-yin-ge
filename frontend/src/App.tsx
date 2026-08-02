import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
const { Header, Content } = Layout;

export default function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header>
        <div style={{ float: 'left', color: 'white', marginRight: 16, fontWeight: 700 }}>墨隐阁</div>
        <Menu theme="dark" mode="horizontal" selectable={false}>
          <Menu.Item key="writer"><Link to="/">写作</Link></Menu.Item>
          <Menu.Item key="login"><Link to="/login">登录</Link></Menu.Item>
        </Menu>
      </Header>
      <Content style={{ padding: 24 }}>
        <Outlet />
      </Content>
    </Layout>
  );
}

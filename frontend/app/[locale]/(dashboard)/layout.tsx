'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Layout, Menu, Button, Avatar, Dropdown, Typography, Space, Grid } from 'antd';
import {
  DashboardOutlined, CalendarOutlined, TeamOutlined, UserOutlined,
  ShoppingCartOutlined, DollarOutlined, BarChartOutlined, SettingOutlined,
  LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, GlobalOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/lib/store/auth-store';
import { api } from '@/lib/api/client';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('dashboard');
  const c = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, setUser, logout: storeLogout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/${locale}/login`);
    }
  }, [isLoading, isAuthenticated, locale, router]);

  useEffect(() => {
    if (isAuthenticated && !user) {
      api.me().then((res) => {
        if (res.success) setUser(res.data);
      });
    }
  }, [isAuthenticated, user, setUser]);

  const handleLogout = () => {
    storeLogout();
    router.push(`/${locale}/login`);
  };

  const toggleLanguage = () => {
    const newLocale = locale === 'en' ? 'ar' : 'en';
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  const menuItems = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: t('overview'), href: `/${locale}/dashboard` },
    { key: 'appointments', icon: <CalendarOutlined />, label: t('appointments'), href: `/${locale}/dashboard/appointments` },
    { key: 'clients', icon: <TeamOutlined />, label: t('clients'), href: `/${locale}/dashboard/clients` },
    { key: 'staff', icon: <UserOutlined />, label: t('staff'), href: `/${locale}/dashboard/staff` },
    { key: 'inventory', icon: <ShoppingCartOutlined />, label: t('inventory'), href: `/${locale}/dashboard/inventory` },
    { key: 'accounts', icon: <DollarOutlined />, label: t('accounts'), href: `/${locale}/dashboard/accounts` },
    { key: 'reports', icon: <BarChartOutlined />, label: t('reports'), href: `/${locale}/dashboard/reports` },
    { key: 'settings', icon: <SettingOutlined />, label: t('settings'), href: `/${locale}/dashboard/settings` },
  ];

  const selectedKey = menuItems.find((item) => pathname.startsWith(item.href))?.key || 'dashboard';

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Text>{c('loading')}</Text></div>;
  }

  if (!isAuthenticated) return null;

  return (
    <Layout className="min-h-screen">
      {!isMobile && (
        <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} theme="light" className="border-r border-gray-200" width={240}>
          <div className={`p-4 flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
            <Avatar size={collapsed ? 28 : 32} style={{ backgroundColor: '#4c6ef5' }}>G</Avatar>
            {!collapsed && <Text strong className="text-lg">Glamora</Text>}
          </div>
          <Menu mode="inline" selectedKeys={[selectedKey]} items={menuItems.map((item) => ({ key: item.key, icon: item.icon, label: item.label, onClick: () => router.push(item.href) }))} />
        </Sider>
      )}

      <Layout>
        <Header className="bg-white px-4 flex items-center justify-between border-b border-gray-200" style={{ padding: '0 16px' }}>
          <Space>
            {isMobile && <Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={() => setCollapsed(!collapsed)} />}
            {isMobile && <Text strong>Glamora</Text>}
          </Space>

          <Space size="middle">
            <Button type="text" icon={<GlobalOutlined />} onClick={toggleLanguage}>
              {locale === 'en' ? 'عربي' : 'English'}
            </Button>

            <Dropdown menu={{ items: [
              { key: 'profile', icon: <UserOutlined />, label: user?.name_en || '' },
              { type: 'divider' },
              { key: 'logout', icon: <LogoutOutlined />, label: t('logout') || 'Logout', danger: true, onClick: handleLogout },
            ]}}>
              <Space className="cursor-pointer">
                <Avatar src={null} style={{ backgroundColor: '#4c6ef5' }}>{user?.name_en?.charAt(0)?.toUpperCase() || 'G'}</Avatar>
                {!isMobile && <Text>{user?.name_en}</Text>}
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content className="p-6 bg-gray-50">{children}</Content>
      </Layout>
    </Layout>
  );
}

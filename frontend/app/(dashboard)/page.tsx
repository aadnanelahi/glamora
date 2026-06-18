'use client';

import { useTranslations } from 'next-intl';
import { Row, Col, Card, Statistic, Typography } from 'antd';
import {
  DollarOutlined,
  CalendarOutlined,
  TeamOutlined,
  UserOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons';

const { Title } = Typography;

export default function DashboardPage() {
  const t = useTranslations('dashboard');

  const stats = [
    { title: t('todayRevenue'), value: 'AED 0', icon: <DollarOutlined />, color: '#4c6ef5' },
    { title: t('pendingAppointments'), value: '0', icon: <CalendarOutlined />, color: '#e64980' },
    { title: t('totalClients'), value: '0', icon: <TeamOutlined />, color: '#20c997' },
    { title: t('activeStaff'), value: '0', icon: <UserOutlined />, color: '#fab005' },
  ];

  return (
    <div>
      <Title level={4} className="mb-6">{t('title')}</Title>

      <Row gutter={[16, 16]}>
        {stats.map((stat) => (
          <Col xs={24} sm={12} lg={6} key={stat.title}>
            <Card hoverable>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.icon}
                valueStyle={{ color: stat.color }}
              />
              <div className="mt-2 text-xs text-gray-400">
                <ArrowUpOutlined /> 0% {t('compareLastPeriod')}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24} lg={16}>
          <Card title={t('appointments')}>
            <div className="h-64 flex items-center justify-center text-gray-400">
              {t('noData')}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={t('reports')}>
            <div className="h-64 flex items-center justify-center text-gray-400">
              {t('noData')}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

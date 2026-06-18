'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Card, Form, Input, Button, Typography, Divider, message, Space } from 'antd';
import { MailOutlined, LockOutlined, GlobalOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { api } from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/auth-store';

const { Title, Text } = Typography;

export default function LoginPage() {
  const t = useTranslations('auth');
  const c = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleLogin = async (values: { email: string; password: string; subdomain?: string }) => {
    setLoading(true);
    try {
      const res = await api.login(values.email, values.password, values.subdomain);
      if (res.success) {
        const meRes = await api.me();
        if (meRes.success) {
          setUser(meRes.data);
          message.success(t('signIn'));
          router.push(`/${locale}/dashboard`);
        }
      } else {
        message.error(res.error || c('error'));
      }
    } catch {
      message.error(c('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      className="shadow-lg"
      styles={{ body: { padding: '2rem' } }}
    >
      <div className="text-center mb-8">
        <Title level={2} className="mb-1">{t('login')}</Title>
        <Text type="secondary">Glamora</Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleLogin}
        autoComplete="off"
        requiredMark={false}
      >
        <Form.Item
          name="email"
          label={t('email')}
          rules={[
            { required: true, message: c('required') },
            { type: 'email', message: 'validation.email' },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="owner@salon.com"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={t('password')}
          rules={[{ required: true, message: c('required') }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="••••••••"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="subdomain"
          label={t('subdomain')}
        >
          <Input
            prefix={<GlobalOutlined />}
            placeholder="yoursalon"
            size="large"
          />
        </Form.Item>

        <Form.Item className="mb-0">
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={loading}
          >
            {loading ? t('signingIn') : t('signIn')}
          </Button>
        </Form.Item>
      </Form>

      <Divider plain>{t('or')}</Divider>

      <div className="text-center">
        <Text>{t('noAccount')}</Text>{' '}
        <Link href={`/${locale}/register`}>{t('signUp')}</Link>
      </div>
    </Card>
  );
}

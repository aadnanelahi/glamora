'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Card, Form, Input, Button, Typography, Divider, message } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined, PhoneOutlined, BuildOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { api } from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/auth-store';

const { Title, Text } = Typography;

export default function RegisterPage() {
  const t = useTranslations('auth');
  const c = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleRegister = async (values: {
    email: string;
    password: string;
    confirmPassword: string;
    name_en: string;
    name_ar?: string;
    phone?: string;
    company_name_en: string;
    company_name_ar?: string;
  }) => {
    setLoading(true);
    try {
      const res = await api.register({
        email: values.email,
        password: values.password,
        name_en: values.name_en,
        name_ar: values.name_ar,
        phone: values.phone,
        company_name_en: values.company_name_en,
        company_name_ar: values.company_name_ar,
        locale,
      });
      if (res.success) {
        setUser(res.data);
        message.success(t('signUp'));
        router.push(`/${locale}/dashboard`);
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
    <Card className="shadow-lg" styles={{ body: { padding: '2rem' } }}>
      <div className="text-center mb-6">
        <Title level={2} className="mb-1">{t('register')}</Title>
        <Text type="secondary">Glamora</Text>
      </div>

      <Form form={form} layout="vertical" onFinish={handleRegister} autoComplete="off" requiredMark={false} size="large">
        <Form.Item name="name_en" label={t('nameEn')} rules={[{ required: true, message: c('required') }]}>
          <Input prefix={<UserOutlined />} placeholder="John Doe" />
        </Form.Item>

        <Form.Item name="name_ar" label={t('nameAr')}>
          <Input placeholder="جون دو" />
        </Form.Item>

        <Form.Item name="company_name_en" label={t('companyNameEn')} rules={[{ required: true, message: c('required') }]}>
          <Input prefix={<BuildOutlined />} placeholder="My Golden Salon" />
        </Form.Item>

        <Form.Item name="company_name_ar" label={t('companyNameAr')}>
          <Input placeholder="صالوني الذهبي" />
        </Form.Item>

        <Form.Item name="email" label={t('email')} rules={[{ required: true, message: c('required') }, { type: 'email', message: 'validation.email' }]}>
          <Input prefix={<MailOutlined />} placeholder="owner@salon.com" />
        </Form.Item>

        <Form.Item name="phone" label={t('phone')}>
          <Input prefix={<PhoneOutlined />} placeholder="+971 50 123 4567" />
        </Form.Item>

        <Form.Item name="password" label={t('password')} rules={[{ required: true, message: c('required') }, { min: 8, message: 'validation.minLength' }]}>
          <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
        </Form.Item>

        <Form.Item name="confirmPassword" label={t('confirmPassword')} dependencies={['password']} rules={[{ required: true, message: c('required') }, ({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue('password') === value) return Promise.resolve(); return Promise.reject(new Error('validation.passwordMatch')); } })]}>
          <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
        </Form.Item>

        <Form.Item className="mb-0">
          <Button type="primary" htmlType="submit" block size="large" loading={loading}>
            {loading ? t('signingUp') : t('signUp')}
          </Button>
        </Form.Item>
      </Form>

      <Divider plain>{t('or')}</Divider>

      <div className="text-center">
        <Text>{t('haveAccount')}</Text>{' '}
        <Link href={`/${locale}/login`}>{t('signIn')}</Link>
      </div>
    </Card>
  );
}

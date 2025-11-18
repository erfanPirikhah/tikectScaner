'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showToast } from '@/lib/toast';
import { Loader2 } from 'lucide-react';
import Logo from '@/components/Logo';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Basic validation
    if (!username.trim()) {
      showToast.error('نام کاربری الزامی است');
      setLoading(false);
      return;
    }

    if (!password.trim()) {
      showToast.error('رمز عبور الزامی است');
      setLoading(false);
      return;
    }

    if (!websiteUrl.trim()) {
      showToast.error('آدرس وب‌سایت الزامی است');
      setLoading(false);
      return;
    }

    // Ensure URL ends with a slash
    const normalizedUrl = websiteUrl.endsWith('/') ? websiteUrl : `${websiteUrl}/`;

    try {
      const result = await login(username, password, normalizedUrl);

      if (result.success) {
        showToast.success('ورود با موفقیت انجام شد');
        router.push('/events');
      } else {
        showToast.error(result.message);
      }
    } catch (err) {
      showToast.error('خطای غیرمنتظره رخ داد. لطفاً دوباره تلاش کنید.');
      console.error('خطای ورود:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center text-center">
          <div className="mb-4">
            <Logo size="xl" showText={false} />
          </div>
          <CardTitle className="text-2xl font-bold mb-1">iticket</CardTitle>
          <CardDescription>ورود به حساب کاربری</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="websiteUrl">آدرس وب‌سایت</Label>
              <Input
                id="websiteUrl"
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://your-website.com"
                required
              />
              <p className="text-xs text-muted-foreground mt-2">
                آدرس سایت وردپرس خود را وارد کنید
              </p>
            </div>

            <div>
              <Label htmlFor="username">نام کاربری</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="password">رمز عبور</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  در حال ورود...
                </>
              ) : (
                'ورود'
              )}
            </Button>
          </CardFooter>
        </form>
        <div className="pb-6 text-center text-sm text-muted-foreground">
          ساخته شده با{' '}
          <span className="text-primary font-medium">Next.js PWA</span>
        </div>
      </Card>
    </div>
  );
}
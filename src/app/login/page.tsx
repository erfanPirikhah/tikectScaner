'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showToast } from '@/lib/toast';
import { Loader2, LogIn, Globe, User, Lock, Eye, EyeOff } from 'lucide-react';
import Logo from '@/components/Logo';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

    // Get the current domain URL from window.location
    const currentDomain = typeof window !== 'undefined' ? window.location.origin : '';

    if (!currentDomain) {
      showToast.error('آدرس وب‌سایت قابل شناسایی نیست');
      setLoading(false);
      return;
    }

    // Ensure URL ends with a slash
    const normalizedUrl = currentDomain.endsWith('/') ? currentDomain : `${currentDomain}/`;

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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 p-4">
      {/* Mobile Full Screen Card */}
      <div className="sm:hidden w-full h-full">
        <Card className="w-full h-full rounded-none border-none shadow-2xl flex flex-col">
          <CardHeader className="flex-shrink-0 pt-12 pb-8 px-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-lg">
                <Logo size="xl" showText={false} className="text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  نرم افزار اختصاصی CheckIn بلیت
                </CardTitle>
                <CardDescription className="text-lg mt-2">
                  ورود به پنل چک این
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 px-6 pb-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div className="space-y-3">
                <Label htmlFor="username" className="text-base font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  نام کاربری
                </Label>
                <div className="relative">
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="h-12 text-lg pr-12 border-2 focus:border-primary transition-colors"
                  />
                  <User className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                </div>
                <p className="text-sm text-muted-foreground">
                  نام کاربری اپراتور چک‌این را وارد کنید.
                </p>
              </div>

              {/* Password Field */}
              <div className="space-y-3">
                <Label htmlFor="password" className="text-base font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  رمز عبور
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 text-lg pr-12 border-2 focus:border-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">
                  رمزعبور اپراتور چک‌این را وارد کنید.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    در حال ورود...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="w-5 h-5" />
                    ورود به سیستم
                  </span>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex-shrink-0 pb-8 px-6">
            <div className="w-full text-center">
              <p className="text-sm text-muted-foreground">
                سیستم مدیریت بلیت‌های رویداد
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Desktop Card */}
      <Card className="hidden sm:flex w-full max-w-lg mx-auto shadow-2xl border-0 overflow-hidden">
        <div className="flex-1 p-8 bg-gradient-to-br from-blue-50 to-purple-50">
          <CardHeader className="px-0 pt-4 pb-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-lg">
                <Logo size="xl" showText={false} className="text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  نرم افزار اختصاصی CheckIn بلیت
                </CardTitle>
                <CardDescription className="text-lg mt-2">
                  ورود به پنل چک این
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-0 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div className="space-y-3">
                <Label htmlFor="username-desktop" className="text-base font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  نام کاربری
                </Label>
                <div className="relative">
                  <Input
                    id="username-desktop"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="h-12 text-lg pr-12 border-2 focus:border-primary transition-colors"
                  />
                  <User className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                </div>
                <p className="text-sm text-muted-foreground">
                  نام کاربری اپراتور چک‌این را وارد کنید.
                </p>
              </div>

              {/* Password Field */}
              <div className="space-y-3">
                <Label htmlFor="password-desktop" className="text-base font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  رمز عبور
                </Label>
                <div className="relative">
                  <Input
                    id="password-desktop"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 text-lg pr-12 border-2 focus:border-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">
                  رمزعبور اپراتور چک‌این را وارد کنید.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    در حال ورود...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="w-5 h-5" />
                    ورود به سیستم
                  </span>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="px-0 pb-4">
            <div className="w-full text-center">
              <p className="text-sm text-muted-foreground">
                پیشرفته‌ترین سیستم اسکن و اعتبارسنجی بلیت
              </p>
            </div>
          </CardFooter>
        </div>
      </Card>
    </div>
  );
}
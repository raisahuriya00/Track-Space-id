import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Layers, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError(null);

    const res = await signIn(email, password);
    setIsLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      navigate('/');
    }
  };

  const handleQuickDemo = async () => {
    setIsLoading(true);
    await signIn('demo@trackspace.dev');
    setIsLoading(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white mx-auto shadow-md shadow-brand-500/20">
            <Layers className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">TrackSpace</h1>
          <p className="text-xs text-slate-500">
            Masuk ke workspace modular Anda untuk mengelola project & habit.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs font-medium border border-red-200">
                  {error}
                </div>
              )}

              <Input
                label="Email"
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                label="Password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isLoading}
              >
                Masuk
              </Button>
            </form>

            <div className="mt-5 pt-5 border-t border-slate-100 space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full text-xs"
                onClick={handleQuickDemo}
              >
                Masuk Cepat Demo / Instant Mode
              </Button>

              <p className="text-center text-xs text-slate-500">
                Belum punya akun?{' '}
                <Link to="/register" className="font-semibold text-brand-600 hover:underline">
                  Daftar di sini
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

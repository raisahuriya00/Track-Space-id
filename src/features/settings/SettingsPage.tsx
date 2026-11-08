import React, { useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Check, User, Database, Shield } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';

export const SettingsPage: React.FC = () => {
  const { profile, updateProfile, isDemoMode } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [timezone, setTimezone] = useState(profile?.timezone || 'Asia/Jakarta');
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    await updateProfile({
      display_name: displayName.trim(),
      timezone,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pengaturan Akun</h1>
        <p className="text-sm text-slate-500 mt-1">
          Kelola profil pengguna dan preferensi workspace Anda.
        </p>
      </div>

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <User className="w-4 h-4 text-brand-600" />
            Profil Pengguna
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Nama Tampilan"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Zona Waktu</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="block w-full rounded-input border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="Asia/Jakarta">WIB (Asia/Jakarta - UTC+7)</option>
                <option value="Asia/Makassar">WITA (Asia/Makassar - UTC+8)</option>
                <option value="Asia/Jayapura">WIT (Asia/Jayapura - UTC+9)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>

            <div className="pt-2 flex items-center justify-between">
              {saved && (
                <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <Check className="w-4 h-4" /> Profil berhasil diperbarui
                </span>
              )}
              <div className="ml-auto">
                <Button type="submit" variant="primary" size="sm">
                  Simpan Profil
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Backend & Supabase Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="w-4 h-4 text-slate-600" />
            Status Koneksi Backend
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
            <div>
              <p className="text-xs font-semibold text-slate-900">Supabase Connection</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isSupabaseConfigured
                  ? 'Terhubung ke server Supabase PostgreSQL & Auth.'
                  : 'Mode lokal / preview browser. Konfigurasi file .env untuk menghubungkan ke Supabase.'}
              </p>
            </div>
            <Badge variant={isSupabaseConfigured ? 'success' : 'warning'} size="sm">
              {isSupabaseConfigured ? 'Online' : 'Local Preview'}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
            <div>
              <p className="text-xs font-semibold text-slate-900">Row Level Security (RLS)</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Aturan isolasi data siap di skema database PostgreSQL.
              </p>
            </div>
            <Badge variant="success" size="sm">
              Terkonfigurasi
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

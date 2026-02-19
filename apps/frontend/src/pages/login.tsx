import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Backend expects email and sifre
      const response = await apiClient.post('/auth/login', {
        email,
        sifre: password,
      });

      // Handle successful login
      const { accessToken, refreshToken, kullanici } = response.data;

      // Store tokens (Basic implementation, should use a proper store/hook later)
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(kullanici));

      alert(`Giriş Başarılı: Hoş geldiniz, ${kullanici.ad}`);

      navigate('/');
    } catch (error: any) {
      alert(error.message || 'E-posta veya şifre hatalı.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-sans">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000"
        style={{ backgroundImage: "url('/assets/images/campus.png')" }}
      />

      {/* Blue Overlay Filter */}
      <div className="absolute inset-0 bg-[#0F172A]/70 backdrop-brightness-50" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-[450px] p-8 mx-4">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[24px] p-8 shadow-2xl flex flex-col items-center">

          {/* Logo */}
          <div className="mb-6">
            <img
              src="/assets/images/logo.png"
              alt="İSTÜN Logo"
              className="h-24 object-contain drop-shadow-md"
            />
          </div>

          {/* Titles */}
          <div className="text-center mb-10">
            <h1 className="text-white text-xl md:text-2xl font-bold tracking-wide uppercase leading-tight mb-2">
              İSTANBUL SAĞLIK VE TEKNOLOJİ ÜNİVERSİTESİ
            </h1>
            <p className="text-white/80 text-sm font-medium">
              Sınav Gözetmen Atama Sistemi
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="w-full space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/90 ml-1 text-xs">Kullanıcı Adı / E-posta</Label>
              <Input
                id="email"
                type="email"
                placeholder="E-posta / Username"
                className="bg-white/90 border-transparent h-12 rounded-[8px] focus:ring-2 focus:ring-[#A71E2B] transition-all text-gray-900 placeholder:text-gray-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/90 ml-1 text-xs">Şifre / Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Şifre / Password"
                className="bg-white/90 border-transparent h-12 rounded-[8px] focus:ring-2 focus:ring-[#A71E2B] transition-all text-gray-900 placeholder:text-gray-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-[#A71E2B] hover:bg-[#8B1824] text-white font-bold text-lg rounded-[8px] shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 mt-4"
              disabled={isLoading}
            >
              {isLoading ? 'Giriş Yapılıyor...' : 'GİRİŞ / LOGIN'}
            </Button>
          </form>

          {/* Links */}
          <div className="mt-8 text-center space-y-4">
            <button className="text-white/70 hover:text-white text-xs underline-offset-4 hover:underline transition-colors">
              Şifremi Unuttum? / Forgot Password?
            </button>

            <div className="pt-4 border-t border-white/10 w-full">
              <p className="text-white/40 text-[10px] uppercase tracking-widest">
                © 2026 Sınav Sistemi
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

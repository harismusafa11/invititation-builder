
import React, { useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { Mail, Lock, Heart, ShieldAlert, Sparkles, UserPlus, LogIn, User, AtSign } from 'lucide-react';

export default function AuthPortal() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Extra fields only for registration
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const saveProfile = async (userId: string, userEmail: string, name: string, uname: string) => {
    try {
      await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: userId,
          email: userEmail,
          fullName: name.trim(),
          username: uname.toLowerCase().trim()
        })
      });
    } catch (e) {
      console.error('Failed to save profile after registration:', e);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    // Validate registration extra fields
    if (isRegister) {
      if (!fullName.trim()) {
        setErrorMsg('Nama lengkap wajib diisi.');
        return;
      }
      const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9_.-]/g, '');
      if (cleanUsername.length < 3) {
        setErrorMsg('Username minimal 3 karakter (huruf kecil, angka, _ . -).');
        return;
      }

      // Check username availability
      try {
        const checkRes = await fetch(`/api/profiles/username/${encodeURIComponent(cleanUsername)}`);
        const checkData = await checkRes.json();
        if (checkData.success && checkData.taken) {
          setErrorMsg('Username sudah digunakan, silakan pilih yang lain.');
          return;
        }
      } catch {
        // Continue even if check fails (will be caught at save)
      }
    }

    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    try {
      if (isRegister) {
        const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9_.-]/g, '');
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
        });
        if (error) throw error;

        // Save profile right after registration
        if (data.user) {
          await saveProfile(data.user.id, data.user.email || email.trim(), fullName, cleanUsername);
        }

        if (data.user && !data.session) {
          setInfoMsg('Registrasi berhasil! Silakan periksa kotak masuk email Anda untuk verifikasi sebelum melakukan login.');
        } else {
          setInfoMsg('Registrasi berhasil! Anda telah masuk secara otomatis.');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: email.trim() === 'admin@wedding.com' ? password.trim() : password.trim(),
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal login menggunakan akun Google.');
      setLoading(false);
    }
  };

  const switchMode = (toRegister: boolean) => {
    setIsRegister(toRegister);
    setErrorMsg(null);
    setInfoMsg(null);
    setFullName('');
    setUsername('');
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans select-none">
      
      {/* Light Luxury Gold & Ivory Background Ornaments */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Fine golden dots pattern */}
      <div className="absolute inset-0 opacity-[0.2] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#D4AF37 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

      {/* Main Auth Card Container */}
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-[32px] p-8 shadow-[0_20px_50px_rgba(212,175,55,0.06)] relative z-10 space-y-6">
        
        {/* Branding header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#0B132B] border border-[#D4AF37] rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
            <Heart className="w-6 h-6 text-[#D4AF37] fill-[#D4AF37]" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-[#0B132B] uppercase mt-4">
            Invitation <span className="text-blue-600 font-extrabold">Studio</span>
          </h2>
          <p className="text-xs text-slate-400 max-w-[280px] mx-auto leading-relaxed mt-1 font-medium">
            {isRegister
              ? 'Buat akun untuk mulai mendesain undangan pernikahan digital premium.'
              : 'Masuk untuk mendesain undangan pernikahan digital premium Anda sendiri.'}
          </p>
        </div>

        {/* Info or Error Alerts */}
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold rounded-xl flex items-start space-x-2 animate-in fade-in duration-200">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}
        {infoMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-semibold rounded-xl flex items-start space-x-2 animate-in fade-in duration-200">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleAuth} className="space-y-3.5">

          {/* --- REGISTRATION-ONLY FIELDS --- */}
          {isRegister && (
            <>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block pl-1">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Masukkan nama lengkap Anda"
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-blue-500 focus:bg-white text-slate-800 placeholder-slate-400 rounded-xl pl-10 pr-4 py-3.5 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block pl-1">Username Unik</label>
                <div className="relative">
                  <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                    placeholder="username_anda"
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-blue-500 focus:bg-white text-slate-800 placeholder-slate-400 rounded-xl pl-10 pr-4 py-3.5 outline-none transition-all"
                  />
                </div>
                <span className="text-[9px] text-slate-400 block pl-1 leading-normal">
                  Huruf kecil, angka, titik (.), dash (-), atau underscore (_). Min. 3 karakter.
                </span>
              </div>

              {/* Divider before email/password */}
              <div className="flex items-center space-x-3 py-0.5">
                <div className="h-[1px] bg-slate-200 flex-1"></div>
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Informasi Akun</span>
                <div className="h-[1px] bg-slate-200 flex-1"></div>
              </div>
            </>
          )}

          {/* --- EMAIL FIELD --- */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block pl-1">Alamat Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-blue-500 focus:bg-white text-slate-800 placeholder-slate-400 rounded-xl pl-10 pr-4 py-3.5 outline-none transition-all"
              />
            </div>
          </div>

          {/* --- PASSWORD FIELD --- */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block pl-1">Kata Sandi</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 karakter"
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-blue-500 focus:bg-white text-slate-800 placeholder-slate-400 rounded-xl pl-10 pr-4 py-3.5 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs tracking-wider transition-all transform active:scale-98 shadow-md shadow-blue-500/10 cursor-pointer flex items-center justify-center gap-2 uppercase mt-1"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isRegister ? (
              <>
                <UserPlus className="w-4 h-4 stroke-[2.5]" />
                <span>Buat Akun Sekarang</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 stroke-[2.5]" />
                <span>Masuk Sekarang</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center justify-center space-x-3 py-1.5 text-slate-300">
          <div className="h-[1px] bg-slate-200 flex-1"></div>
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">atau</span>
          <div className="h-[1px] bg-slate-200 flex-1"></div>
        </div>

        {/* OAuth Google button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs tracking-wide transition-all transform active:scale-98 flex items-center justify-center gap-2.5 cursor-pointer shadow-xs"
        >
          {/* Flat Google logo */}
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5.04c1.78 0 3.39.61 4.65 1.8l3.47-3.47C17.98 1.19 15.22 0 12 0 7.35 0 3.36 2.67 1.45 6.57l3.89 3.01C6.27 6.87 8.9 5.04 12 5.04z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.89 3.01c2.27-2.09 3.54-5.17 3.54-8.74z"
            />
            <path
              fill="#FBBC05"
              d="M5.34 14.73c-.24-.73-.38-1.5-.38-2.31s.14-1.58.38-2.31L1.45 7.1C.53 8.94 0 11.01 0 13.18c0 2.17.53 4.24 1.45 6.08l3.89-3.01s-.38-.72-.38-1.52z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.97-1.09 7.96-2.96l-3.89-3.01c-1.1.74-2.51 1.18-4.07 1.18-3.1 0-5.73-1.83-6.66-4.51l-3.89 3.01C3.36 21.33 7.36 24 12 24z"
            />
          </svg>
          <span>{isRegister ? 'Daftar dengan Google' : 'Masuk dengan Google'}</span>
        </button>

        {/* Toggle register/login mode */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => switchMode(!isRegister)}
            className="text-xs text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
          >
            {isRegister ? (
              <span>Sudah punya akun? <strong className="text-blue-600 font-bold">Masuk disini</strong></span>
            ) : (
              <span>Belum punya akun? <strong className="text-blue-600 font-bold">Daftar sekarang</strong></span>
            )}
          </button>
        </div>

        {/* Sandbox simulator active message */}
        {supabase.isSimulator && (
          <div className="pt-3.5 border-t border-slate-100 text-center space-y-1">
            <span className="inline-block px-3 py-1 bg-amber-50 border border-amber-100 rounded-full text-[9px] font-bold text-amber-600 uppercase tracking-widest">
              ⚡ Simulator Sandbox Aktif
            </span>
            <p className="text-[9px] text-slate-400 font-semibold leading-relaxed mt-1 max-w-[280px] mx-auto">
              Tidak ada Supabase keys terdeteksi. Silakan masuk menggunakan email dan password apa saja untuk pengujian instan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

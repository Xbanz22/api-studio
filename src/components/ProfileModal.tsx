import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Building2,
  Image as ImageIcon,
  Check,
  X,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { UserProfile } from '../types';

const originalFetch = window.fetch;
const fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  let url = typeof input === 'string' ? input : (input instanceof URL ? input.href : input.url);
  const savedUserStr = localStorage.getItem('api_studio_current_user');
  if (savedUserStr && url.startsWith('/api/')) {
    try {
      const user = JSON.parse(savedUserStr);
      if (user && user.email) {
        const customInit = init ? { ...init } : {};
        const headers = new Headers(customInit.headers || {});
        if (!headers.has('x-user-email')) {
          headers.set('x-user-email', user.email);
        }
        if (!headers.has('x-user-role')) {
          headers.set('x-user-role', user.role || 'user');
        }
        customInit.headers = headers;
        return originalFetch(input, customInit);
      }
    } catch (e) {
      console.error(e);
    }
  }
  return originalFetch(input, init);
};

interface ProfileModalProps {
  user?: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (updatedUser: UserProfile) => void;
  lang: 'id' | 'en';
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onProfileUpdated,
  lang,
}) => {
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [company, setCompany] = useState(user?.company || '');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAvatar(user.avatar || '');
      setCompany(user.company || '');
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback(null);

    const finalAvatar = customAvatarUrl.trim() || avatar;

    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: name.trim(),
          avatar: finalAvatar,
          company: company.trim()
        })
      });

      const data = await res.json();
      if (data.success && data.user) {
        if (onProfileUpdated) onProfileUpdated(data.user);
        setFeedback(lang === 'id' ? 'Profil berhasil diperbarui!' : 'Profile updated successfully!');
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        alert(data.error || 'Gagal memperbarui profil.');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl border border-slate-800 bg-slate-900 p-1.5 text-slate-400 hover:text-white transition"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>{lang === 'id' ? 'Pengaturan Profil Pengguna' : 'User Profile Settings'}</span>
              <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-500/30">
                {user.tier} Tier
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'id' ? 'Ubah nama, foto avatar, dan identitas akun Anda' : 'Customize your name, avatar picture, and account details'}
            </p>
          </div>
        </div>

        {feedback && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-indigo-400" />
              <span>{lang === 'id' ? 'Pilih Foto Avatar' : 'Select Avatar Picture'}</span>
            </label>

            <div className="flex items-center gap-4">
              <img
                src={customAvatarUrl.trim() || avatar}
                alt="Preview Avatar"
                className="h-16 w-16 rounded-2xl border-2 border-indigo-500 object-cover shadow-lg shrink-0"
              />

              <div className="grid grid-cols-4 gap-2 flex-1">
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAvatar(url);
                      setCustomAvatarUrl('');
                    }}
                    className={`relative overflow-hidden rounded-xl border transition h-10 w-10 ${
                      avatar === url && !customAvatarUrl
                        ? 'border-indigo-500 ring-2 ring-indigo-500/40'
                        : 'border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <img src={url} alt={`Preset ${idx}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Custom URL Input */}
            <input
              type="text"
              placeholder={lang === 'id' ? 'Atau masukkan Custom Image URL (https://...)' : 'Or enter custom Image URL (https://...)'}
              value={customAvatarUrl}
              onChange={(e) => setCustomAvatarUrl(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Name Field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-indigo-400" />
              <span>{lang === 'id' ? 'Nama Lengkap Developer' : 'Developer Full Name'}</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Email Field (Disabled) */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-slate-500" />
              <span>{lang === 'id' ? 'Email Terdaftar (Terhubung Key)' : 'Registered Email'}</span>
            </label>
            <input
              type="email"
              disabled
              value={user.email}
              className="w-full rounded-xl border border-slate-800/60 bg-slate-900/50 px-3.5 py-2.5 text-xs text-slate-400 cursor-not-allowed font-mono"
            />
          </div>

          {/* Company Field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-indigo-400" />
              <span>{lang === 'id' ? 'Perusahaan / Peran Project' : 'Company / Organization'}</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Cloud Innovators Inc."
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
            >
              {lang === 'id' ? 'Batal' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition shadow-md shadow-indigo-600/30"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              <span>{lang === 'id' ? 'Simpan Perubahan' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Globe,
  Sliders,
  Image as ImageIcon,
  Check,
  X,
  Sparkles,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { SiteSettings } from '../types';

interface SiteSettingsModalProps {
  settings?: SiteSettings | null;
  isOpen: boolean;
  onClose: () => void;
  onSettingsUpdated?: (newSettings: SiteSettings) => void;
  onSaved?: () => void;
  lang: 'id' | 'en';
}

const FAVICON_OPTIONS = ['⚡', '🚀', '👑', '🔥', '💻', '🌐', '🛠️', '🎯', '✨'];
const LOGO_ICONS = ['Zap', 'Crown', 'Sparkles', 'Code2', 'Flame', 'Terminal'];

export const SiteSettingsModal: React.FC<SiteSettingsModalProps> = ({
  settings,
  isOpen,
  onClose,
  onSettingsUpdated,
  onSaved,
  lang,
}) => {
  const [title, setTitle] = useState(settings?.title || 'REST API Studio');
  const [tagline, setTagline] = useState(settings?.tagline || 'Developer Infrastructure & Interactive API Hub');
  const [description, setDescription] = useState(settings?.description || 'Platform REST API interaktif dengan live runner, dokumentasi OpenAPI, mock engine, dan API key manager.');
  const [faviconUrl, setFaviconUrl] = useState(settings?.faviconUrl || '⚡');
  const [thumbnailUrl, setThumbnailUrl] = useState(settings?.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200');
  const [logoIcon, setLogoIcon] = useState(settings?.logoIcon || 'Zap');
  const [supportWhatsapp, setSupportWhatsapp] = useState(settings?.supportWhatsapp || '');
  const [supportTelegram, setSupportTelegram] = useState(settings?.supportTelegram || '');
  const [heroVideoUrl, setHeroVideoUrl] = useState(settings?.heroVideoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-code-animation-on-a-computer-screen-1241-large.mp4');
  const [enableHeroVideo, setEnableHeroVideo] = useState(settings?.enableHeroVideo ?? true);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      if (settings.title) setTitle(settings.title);
      if (settings.tagline) setTagline(settings.tagline);
      if (settings.description) setDescription(settings.description);
      if (settings.faviconUrl) setFaviconUrl(settings.faviconUrl);
      if (settings.thumbnailUrl) setThumbnailUrl(settings.thumbnailUrl);
      if (settings.logoIcon) setLogoIcon(settings.logoIcon);
      setSupportWhatsapp(settings.supportWhatsapp || '');
      setSupportTelegram(settings.supportTelegram || '');
      setHeroVideoUrl(settings.heroVideoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-code-animation-on-a-computer-screen-1241-large.mp4');
      setEnableHeroVideo(settings.enableHeroVideo ?? true);
    }
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/site/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          tagline: tagline.trim(),
          description: description.trim(),
          faviconUrl: faviconUrl.trim(),
          thumbnailUrl: thumbnailUrl.trim(),
          logoIcon,
          supportWhatsapp: supportWhatsapp.trim(),
          supportTelegram: supportTelegram.trim(),
          heroVideoUrl: heroVideoUrl.trim(),
          enableHeroVideo
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        if (onSettingsUpdated) onSettingsUpdated(data.data);
        if (onSaved) onSaved();

        // Dynamically update document title & meta tags in browser!
        document.title = `${data.data.title} - ${data.data.tagline}`;
        
        // Update favicon if emoji or link
        let faviconElem = document.getElementById('dynamic-favicon') as HTMLLinkElement;
        if (!faviconElem) {
          faviconElem = document.createElement('link');
          faviconElem.id = 'dynamic-favicon';
          faviconElem.rel = 'icon';
          document.head.appendChild(faviconElem);
        }
        if (data.data.faviconUrl.startsWith('http')) {
          faviconElem.href = data.data.faviconUrl;
        } else {
          // Data URI SVG for emoji
          faviconElem.href = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${data.data.faviconUrl}</text></svg>`;
        }

        setFeedback(lang === 'id' ? 'Konfigurasi Web & Branding berhasil disimpan!' : 'Web & Branding configuration saved!');
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        alert(data.error || 'Gagal menyimpan konfigurasi web.');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl border border-slate-800 bg-slate-900 p-1.5 text-slate-400 hover:text-white transition"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Sliders className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>{lang === 'id' ? 'Konfigurasi Website & Branding Studio' : 'Web Branding & Site Settings'}</span>
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                Admin Settings
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'id' ? 'Atur judul web, icon tab/favicon, deskripsi meta, dan thumbnail preview' : 'Customize website title, favicon tab icon, meta description, and share thumbnail'}
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
          {/* Web Title */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-amber-400" />
              <span>{lang === 'id' ? 'Judul Web (Website Title)' : 'Website Title'}</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. REST API Studio"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Web Tagline */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>{lang === 'id' ? 'Tagline Platform' : 'Platform Tagline'}</span>
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Developer Infrastructure & Interactive API Hub"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Web Icon / Favicon Emoji / Link */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <span>{lang === 'id' ? 'Favicon / Ikon Tab Browser' : 'Favicon / Browser Tab Icon'}</span>
            </label>

            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 border border-slate-700 text-xl font-bold">
                {faviconUrl.startsWith('http') ? (
                  <img src={faviconUrl} alt="Favicon" className="h-6 w-6 object-contain" />
                ) : (
                  faviconUrl
                )}
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {FAVICON_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setFaviconUrl(emoji)}
                    className={`h-9 w-9 rounded-xl border text-base flex items-center justify-center transition ${
                      faviconUrl === emoji ? 'border-amber-500 bg-amber-500/20 text-white' : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <input
              type="text"
              placeholder={lang === 'id' ? 'Atau masukkan URL Ikon / Favicon (.png / .ico)' : 'Or enter custom Favicon URL (.png / .ico)'}
              value={faviconUrl}
              onChange={(e) => setFaviconUrl(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Social Thumbnail URL (OG Image) */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-amber-400" />
              <span>{lang === 'id' ? 'Gambar Banner / Thumbnail Web (OG Image)' : 'Social Share Thumbnail URL (OG Image)'}</span>
            </label>
            <input
              type="text"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              {lang === 'id' ? 'Deskripsi SEO & Meta Tag' : 'SEO & Meta Description'}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Support Contacts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-800/60 pt-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <span>WhatsApp Owner (Bantuan)</span>
              </label>
              <input
                type="text"
                value={supportWhatsapp}
                onChange={(e) => setSupportWhatsapp(e.target.value)}
                placeholder="e.g. 628123456789"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-500 font-normal">Gunakan format internasional (tanpa + atau 0 di depan, misal: 62812...)</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <span>Telegram Owner (Bantuan)</span>
              </label>
              <input
                type="text"
                value={supportTelegram}
                onChange={(e) => setSupportTelegram(e.target.value)}
                placeholder="e.g. apistudio_owner"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-500 font-normal">Masukkan username Telegram tanpa tanda @</p>
            </div>
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
              className="flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2 text-xs font-bold text-white hover:bg-amber-700 transition shadow-md shadow-amber-600/30"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              <span>{lang === 'id' ? 'Simpan Branding' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  Terminal,
  Send,
  Sparkles,
  Key,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
  Bot,
  FileCode,
  Sliders,
  ShieldAlert
} from 'lucide-react';
import { ApiKeyItem } from '../types';

interface BotPluginModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeys: ApiKeyItem[];
  defaultKey?: string;
  lang?: 'id' | 'en';
}

type PluginType = 'checklimit' | 'stalktiktok' | 'tiktok' | 'nftoken';

export const BotPluginModal: React.FC<BotPluginModalProps> = ({
  isOpen,
  onClose,
  apiKeys,
  defaultKey = '',
  lang = 'id'
}) => {
  const [activePlugin, setActivePlugin] = useState<PluginType>('checklimit');
  const [selectedApiKey, setSelectedApiKey] = useState<string>(() => {
    if (defaultKey) return defaultKey;
    if (apiKeys.length > 0) return apiKeys[0].key;
    return 'sk_live_demo123';
  });
  const [baseUrl, setBaseUrl] = useState<string>(() => window.location.origin);
  const [copied, setCopied] = useState(false);
  const [simTab, setSimTab] = useState<'code' | 'simulator'>('simulator');

  // Simulator state
  const [simInput, setSimInput] = useState('.checklimit');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; image?: string; timestamp: string }>>([
    {
      sender: 'bot',
      text: '🤖 *Bani Bot WA Gateway Connected*\nKetikan *.checklimit* atau *.stalktiktok jessnolimit* untuk ngetes limit API Key real-time.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [simLoading, setSimLoading] = useState(false);

  useEffect(() => {
    if (defaultKey) {
      setSelectedApiKey(defaultKey);
    } else if (apiKeys.length > 0 && !selectedApiKey) {
      setSelectedApiKey(apiKeys[0].key);
    }
  }, [defaultKey, apiKeys]);

  if (!isOpen) return null;

  const getPluginCode = (plugin: PluginType): string => {
    const keyToUse = selectedApiKey || 'YOUR_API_KEY';
    const hostToUse = baseUrl || window.location.origin;

    if (plugin === 'checklimit') {
      return `// plugins/checklimit.js
// Plugin Bot WA untuk Memeriksa Status Limit & Sisa Kuota API Key
const axios = require('axios');
const chalk = require('chalk');

function getJid(msg) { return msg?.key?.remoteJid; }

// ============================================================================
//  MAIN HANDLER
// ============================================================================
let handler = async (m, { bani, args, command, pushname }) => {
    try {
        const sock = bani;
        const jid = getJid(m);

        if (!sock || !jid) {
            await m.reply('❌ Bot belum terhubung!');
            return;
        }

        const apiKey = '${keyToUse}';
        const targetUrl = \`${hostToUse}/api/keys/check?apikey=\${apiKey}\`;

        await m.reply('⏳ *Memeriksa sisa limit API Key...*');

        const { data: res } = await axios.get(targetUrl, { timeout: 10000 });

        if (!res.success) {
            await m.reply(\`❌ *Gagal Cek Limit!*\\n\\n📌 Error: \${res.error || 'Terjadi kesalahan'}\`);
            return;
        }

        const d = res.data;
        const u = d.usage;
        const r = d.rateLimits;

        let txt = \`🔑 *API KEY LIMIT STATUS*\\n\\n\`;
        txt += \`👤 *Pemilik:* \${d.ownerEmail || d.name}\\n\`;
        txt += \`🏷️ *Tier:* \${d.tier} (\${d.status.toUpperCase()})\\n\`;
        txt += \`🔑 *Key:* \${d.key.slice(0, 12)}...\\n\\n\`;

        txt += \`📊 *KONSUMSI KUOTA*\\n\`;
        txt += \`  • Total Dipakai: \${u.requestCount.toLocaleString()} request\\n\`;
        txt += \`  • Batas Maksimal: \${u.totalLimit === 'unlimited' ? 'Unlimited' : u.totalLimit.toLocaleString() + ' req'}\\n\`;
        txt += \`  • Sisa Kuota: \${u.remainingTotalRequests === 'unlimited' ? '∞ Unlimited' : u.remainingTotalRequests.toLocaleString() + ' req'}\\n\`;
        txt += \`  • Penggunaan: \${u.percentUsed}%\\n\\n\`;

        txt += \`⏱️ *RATE LIMIT*\\n\`;
        txt += \`  • Per Menit: \${r.perMinute.used} / \${r.perMinute.limit} (Sisa: \${r.perMinute.remaining})\\n\`;
        txt += \`  • Per Hari: \${r.perDay.used} / \${r.perDay.limit} (Sisa: \${r.perDay.remaining})\\n\\n\`;

        txt += \`📅 *Kadaluarsa:* \${d.expiresAt}\\n\`;
        txt += \`📱 *By Bani Bot*\`;

        await m.reply(txt);

    } catch (error) {
        console.error(chalk.red('[CheckLimit Error]:'), error.message);
        const errMsg = error.response?.data?.error || error.message;
        await m.reply(\`❌ *Gagal Cek Limit!*\\n\\n📌 Error: \${errMsg}\`);
    }
};

handler.command = ['checklimit', 'limit', 'ceklimit', 'keylimit', 'apilimit'];
handler.tags = ['tools', 'info'];
handler.help = ['checklimit'];
handler.description = 'Cek sisa limit kuota dan rate limit API Key';

module.exports = handler;`;
    }

    if (plugin === 'stalktiktok') {
      return `// plugins/stalktiktok.js
// Plugin Bot WA untuk Stalking Profil TikTok & Metrics
const axios = require('axios');
const chalk = require('chalk');

function getJid(msg) { return msg?.key?.remoteJid; }

async function stalkTikTok(username) {
    const cleanUsername = username.trim().replace(/^@/, '');
    const apiKey = '${keyToUse}';
    const targetUrl = \`${hostToUse}/api/tools/stalktiktok?username=\${encodeURIComponent(cleanUsername)}&apikey=\${apiKey}\`;

    try {
        console.log(chalk.blue(\`[TikTokStalk] 🔍 Searching: \${cleanUsername}\`));
        const { data } = await axios.get(targetUrl, { timeout: 12000 });
        return data;
    } catch (error) {
        console.error('[TikTokStalk] Error:', error.message);
        return {
            success: false,
            error: error.response?.data?.error || error.message || 'Terjadi kesalahan',
        };
    }
}

function formatResult(result) {
    if (!result.success) {
        return \`❌ *Gagal Stalk TikTok!*\\n\\n📌 Error: \${result.error}\`;
    }

    const d = result.data;

    let msg = \`📱 *TikTok Profile*\\n\\n\`;
    msg += \`👤 *Nama:* \${d.name || 'Tidak diketahui'}\\n\`;
    msg += \`📌 *Username:* @\${d.username || 'Tidak diketahui'}\\n\\n\`;

    msg += \`📊 *STATISTIK*\\n\`;
    msg += \`  👥 Followers: \${d.followers || '0'}\\n\`;
    msg += \`  👣 Following: \${d.following || '0'}\\n\`;
    msg += \`  ❤️ Hearts: \${d.hearts || '0'}\\n\`;
    msg += \`  🎬 Videos: \${d.videos || '0'}\\n\`;
    if (d.friends && d.friends !== '0') {
        msg += \`  🤝 Friends: \${d.friends}\\n\`;
    }

    msg += \`\\n📅 *INFORMASI AKUN*\\n\`;
    msg += \`  📆 Dibuat: \${d.accountCreated || 'N/A'}\\n\`;
    msg += \`  ✏️ Nickname diubah: \${d.nicknameLastModified || 'N/A'}\\n\`;

    msg += \`\\n📱 *By Bani Bot*\`;
    return msg;
}

let handler = async (m, { bani, args, command }) => {
    try {
        const sock = bani;
        const jid = getJid(m);

        if (!sock || !jid) {
            await m.reply('❌ Bot belum terhubung!');
            return;
        }

        if (!args || args.length === 0 || args[0] === 'help') {
            let helpText = \`📱 *TikTok Stalker*\\n\\n\`;
            helpText += \`📌 *Cara Penggunaan:*\\n  .\${command} <username>\\n\\n\`;
            helpText += \`📌 *Contoh:*\\n  .\${command} jessnolimit\\n\\n\`;
            helpText += \`📱 *By Bani Bot*\`;
            await m.reply(helpText);
            return;
        }

        const username = args.join(' ').trim();
        await m.reply(\`⏳ *Mencari akun TikTok @\${username.replace(/^@/, '')}...*\`);

        const result = await stalkTikTok(username);

        if (!result.success) {
            await m.reply(\`❌ *Gagal Stalk!*\\n\\n📌 Error: \${result.error}\`);
            return;
        }

        if (result.data.photoProfile) {
            try {
                await sock.sendMessage(jid, {
                    image: { url: result.data.photoProfile },
                    caption: formatResult(result),
                }, { quoted: m });
                return;
            } catch (e) {
                console.log('[TikTokStalk] Photo send error:', e.message);
            }
        }

        await m.reply(formatResult(result));

    } catch (error) {
        console.error(chalk.red('[TikTokStalk Error]:'), error);
        await m.reply(\`❌ *Error:* \${error.message}\`);
    }
};

handler.command = ['stalktiktok', 'stalktt', 'stt', 'ttstalk'];
handler.tags = ['tools', 'stalker'];
handler.help = ['stalktiktok <username>'];
handler.description = 'Stalk akun TikTok';

module.exports = handler;`;
    }

    if (plugin === 'tiktok') {
      return `// plugins/tiktok.js
// Plugin Bot WA untuk TikTok Video & Image Slide Downloader
const axios = require('axios');
const chalk = require('chalk');

function getJid(msg) { return msg?.key?.remoteJid; }

let handler = async (m, { bani, args, command }) => {
    try {
        const sock = bani;
        const jid = getJid(m);
        const apiKey = '${keyToUse}';

        if (!args || args.length === 0) {
            await m.reply(\`📌 *Cara Penggunaan:*\\n  .\${command} <url>\\n\\n📌 *Contoh:*\\n  .\${command} https://vt.tiktok.com/ZSqJGDDKP/\`);
            return;
        }

        const inputUrl = args[0].trim();
        await m.reply('⏳ *Mengunduh TikTok...*');

        const apiUrl = \`${hostToUse}/api/tools/tiktok?url=\${encodeURIComponent(inputUrl)}&apikey=\${apiKey}\`;
        const { data: res } = await axios.get(apiUrl, { timeout: 20000 });

        if (!res.success || !res.data) {
            throw new Error(res.error || 'Gagal mengekstrak TikTok.');
        }

        const data = res.data;

        if (!data.isVideo) {
            const total = data.download.length;
            await m.reply(\`🖼️ *Image Slide TikTok detected!* (Total: \${total} foto)\`);
            for (let i = 0; i < total; i++) {
                await sock.sendMessage(jid, {
                    image: { url: data.download[i] },
                    caption: \`🖼️ *Slide \${i+1}/\${total}*\\n👤 \${data.author.nickname}\`
                }, { quoted: m });
            }
            return;
        }

        let caption = \`🎬 *TikTok Downloader*\\n\\n\`;
        caption += \`👤 *Author:* \${data.author.nickname || data.author.username}\\n\`;
        caption += \`📝 *Title:* \${data.title || '-'}\\n\`;
        caption += \`❤️ *Likes:* \${data.stats.likeFormatted || data.stats.like}\\n\`;
        caption += \`📱 *By Bani Bot*\`;

        await sock.sendMessage(jid, {
            video: { url: data.download[0] },
            caption: caption,
            mimetype: 'video/mp4'
        }, { quoted: m });

    } catch (error) {
        console.error(chalk.red('[TikTok Error]:'), error.message);
        await m.reply(\`❌ *Gagal Download TikTok!*\\n\\n📌 Error: \${error.response?.data?.error || error.message}\`);
    }
};

handler.command = ['tiktok', 'tt', 'ttdl'];
handler.tags = ['downloader', 'tools'];
handler.help = ['tiktok <url>'];
handler.description = 'Download TikTok Video & Photo Slide';

module.exports = handler;`;
    }

    // NFToken
    return `// plugins/nftoken.js
// Plugin Bot WA untuk Netflix NFToken Premium Generator
const axios = require('axios');
const chalk = require('chalk');

let handler = async (m, { bani, args, command }) => {
    try {
        const apiKey = '${keyToUse}';
        await m.reply('⏳ *Generating Netflix NFToken...*');

        const apiUrl = \`${hostToUse}/api/tools/nftoken?action=generate&apikey=\${apiKey}\`;
        const { data: res } = await axios.get(apiUrl, { timeout: 15000 });

        if (!res.success || !res.data) {
            throw new Error(res.error || 'Gagal generate NFToken');
        }

        const d = res.data;
        let txt = \`🎬 *NETFLIX NFTOKEN GENERATOR*\\n\\n\`;
        txt += \`🔑 *Token:* \\\`\${d.token.slice(0, 30)}...\\\`\\n\`;
        txt += \`📅 *Kadaluarsa:* \${d.expiry}\\n\`;
        txt += \`⏱️ *Sisa Waktu:* \${d.remainingTime}\\n\`;
        txt += \`🌐 *Region/Plan:* \${d.profile.country} - \${d.profile.plan}\\n\\n\`;
        txt += \`🔗 *Direct Login Links:*\\n\`;
        txt += \`💻 *PC:* \${d.links.pc}\\n\`;
        txt += \`📱 *Android:* \${d.links.android}\\n\`;
        txt += \`📺 *Smart TV:* \${d.links.tv}\\n\`;
        txt += \`📺 *TV8:* \${d.links.tv8}\\n\\n\`;
        txt += \`📱 *By Bani Bot*\`;

        await m.reply(txt);
    } catch (error) {
        console.error(chalk.red('[NFToken Error]:'), error.message);
        await m.reply(\`❌ *Gagal Generate NFToken!*\\n\\n📌 Error: \${error.response?.data?.error || error.message}\`);
    }
};

handler.command = ['nftoken', 'netflix', 'nftokengen'];
handler.tags = ['tools', 'premium'];
handler.help = ['nftoken'];
handler.description = 'Generate NFToken Netflix Premium';

module.exports = handler;`;
  };

  const handleCopyCode = () => {
    const code = getPluginCode(activePlugin);
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCode = () => {
    const code = getPluginCode(activePlugin);
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activePlugin}.js`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Run real API call when user types in WhatsApp Simulator
  const handleSendSimMessage = async () => {
    if (!simInput.trim() || simLoading) return;

    const userMsg = simInput.trim();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages(prev => [...prev, { sender: 'user', text: userMsg, timestamp }]);
    setSimInput('');
    setSimLoading(true);

    try {
      if (userMsg.startsWith('.checklimit') || userMsg.startsWith('.limit') || userMsg.startsWith('.ceklimit')) {
        const apiUrl = `${baseUrl}/api/keys/check?apikey=${encodeURIComponent(selectedApiKey)}`;
        const res = await fetch(apiUrl);
        const json = await res.json();

        if (!json.success) {
          setMessages(prev => [
            ...prev,
            {
              sender: 'bot',
              text: `❌ *Gagal Cek Limit!*\n\n📌 Error: ${json.error || 'API Key tidak valid'}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        } else {
          const d = json.data;
          const u = d.usage;
          const r = d.rateLimits;

          let txt = `🔑 *API KEY LIMIT STATUS*\n\n`;
          txt += `👤 *Pemilik:* ${d.ownerEmail || d.name}\n`;
          txt += `🏷️ *Tier:* ${d.tier} (${d.status.toUpperCase()})\n`;
          txt += `🔑 *Key:* ${d.key.slice(0, 14)}...\n\n`;

          txt += `📊 *KONSUMSI KUOTA*\n`;
          txt += `  • Total Dipakai: ${u.requestCount.toLocaleString()} request\n`;
          txt += `  • Batas Maksimal: ${u.totalLimit === 'unlimited' ? 'Unlimited' : u.totalLimit.toLocaleString() + ' req'}\n`;
          txt += `  • Sisa Kuota: ${u.remainingTotalRequests === 'unlimited' ? '∞ Unlimited' : u.remainingTotalRequests.toLocaleString() + ' req'}\n`;
          txt += `  • Persentase: ${u.percentUsed}%\n\n`;

          txt += `⏱️ *RATE LIMIT*\n`;
          txt += `  • Per Menit: ${r.perMinute.used} / ${r.perMinute.limit} (Sisa: ${r.perMinute.remaining})\n`;
          txt += `  • Per Hari: ${r.perDay.used} / ${r.perDay.limit} (Sisa: ${r.perDay.remaining})\n\n`;

          txt += `📅 *Kadaluarsa:* ${d.expiresAt}\n`;
          txt += `📱 *By Bani Bot*`;

          setMessages(prev => [
            ...prev,
            {
              sender: 'bot',
              text: txt,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }
      } else if (userMsg.startsWith('.stalktiktok') || userMsg.startsWith('.stalktt') || userMsg.startsWith('.ttstalk') || userMsg.startsWith('.stt')) {
        const parts = userMsg.split(' ');
        const username = parts[1] || 'jessnolimit';

        const apiUrl = `${baseUrl}/api/tools/stalktiktok?username=${encodeURIComponent(username)}&apikey=${encodeURIComponent(selectedApiKey)}`;
        const res = await fetch(apiUrl);
        const json = await res.json();

        if (!json.success) {
          setMessages(prev => [
            ...prev,
            {
              sender: 'bot',
              text: `❌ *Gagal Stalk TikTok!*\n\n📌 Error: ${json.error || 'User tidak ditemukan'}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        } else {
          const d = json.data;
          let txt = `📱 *TikTok Profile*\n\n`;
          txt += `👤 *Nama:* ${d.name || 'Tidak diketahui'}\n`;
          txt += `📌 *Username:* @${d.username || 'Tidak diketahui'}\n\n`;

          txt += `📊 *STATISTIK*\n`;
          txt += `  👥 Followers: ${d.followers || '0'}\n`;
          txt += `  👣 Following: ${d.following || '0'}\n`;
          txt += `  ❤️ Hearts: ${d.hearts || '0'}\n`;
          txt += `  🎬 Videos: ${d.videos || '0'}\n`;

          txt += `\n📅 *INFORMASI AKUN*\n`;
          txt += `  📆 Dibuat: ${d.accountCreated || 'N/A'}\n`;
          txt += `  ✏️ Nickname diubah: ${d.nicknameLastModified || 'N/A'}\n`;
          txt += `\n📱 *By Bani Bot*`;

          setMessages(prev => [
            ...prev,
            {
              sender: 'bot',
              text: txt,
              image: d.photoProfile,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }
      } else if (userMsg.startsWith('.nftoken') || userMsg.startsWith('.netflix')) {
        const apiUrl = `${baseUrl}/api/tools/nftoken?action=generate&apikey=${encodeURIComponent(selectedApiKey)}`;
        const res = await fetch(apiUrl);
        const json = await res.json();

        if (!json.success) {
          setMessages(prev => [
            ...prev,
            {
              sender: 'bot',
              text: `❌ *Gagal NFToken!*\n\n📌 Error: ${json.error}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        } else {
          const d = json.data;
          let txt = `🎬 *NETFLIX NFTOKEN GENERATOR*\n\n`;
          txt += `🔑 *Token:* \`${d.token ? d.token.slice(0, 30) : 'eyJ...'}\`...\n`;
          txt += `📅 *Kadaluarsa:* ${d.expiry}\n`;
          txt += `⏱️ *Sisa Waktu:* ${d.remainingTime}\n\n`;
          txt += `🔗 *Direct Login Links:*\n`;
          txt += `💻 PC: ${d.links?.pc}\n`;
          txt += `📺 Smart TV: ${d.links?.tv}\n\n`;
          txt += `📱 *By Bani Bot*`;

          setMessages(prev => [
            ...prev,
            {
              sender: 'bot',
              text: txt,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }
      } else if (userMsg.startsWith('.tiktok') || userMsg.startsWith('.tt')) {
        const parts = userMsg.split(' ');
        const url = parts[1] || 'https://vt.tiktok.com/ZSqJGDDKP/';

        const apiUrl = `${baseUrl}/api/tools/tiktok?url=${encodeURIComponent(url)}&apikey=${encodeURIComponent(selectedApiKey)}`;
        const res = await fetch(apiUrl);
        const json = await res.json();

        if (!json.success) {
          setMessages(prev => [
            ...prev,
            {
              sender: 'bot',
              text: `❌ *Gagal Download TikTok!*\n\n📌 Error: ${json.error}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        } else {
          const d = json.data;
          let txt = `🎬 *TikTok Downloader*\n\n`;
          txt += `👤 *Author:* ${d.author?.nickname || d.author?.username}\n`;
          txt += `📝 *Title:* ${d.title || '-'}\n`;
          txt += `❤️ *Likes:* ${d.stats?.likeFormatted || d.stats?.like}\n`;
          txt += `🔗 *Download URL:* ${d.download?.[0] || 'N/A'}\n\n`;
          txt += `📱 *By Bani Bot*`;

          setMessages(prev => [
            ...prev,
            {
              sender: 'bot',
              text: txt,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }
      } else {
        setMessages(prev => [
          ...prev,
          {
            sender: 'bot',
            text: `❓ *Perintah Tidak Dikenal*\n\nTry:\n• *.checklimit* (Cek sisa limit API key)\n• *.stalktiktok jessnolimit* (Stalk TikTok profile)\n• *.tiktok https://vt.tiktok.com/ZSqJGDDKP/*\n• *.nftoken* (Netflix token)`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (e: any) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: `❌ *System Error:* ${e.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setSimLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl my-6 text-slate-800 dark:text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">WhatsApp Bot Plugin & Limit Tester</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                  Ready to Deploy
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate plugin bot WA instan & uji real-time sisa limit API Key di simulator
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700/60 p-2 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Toolbar */}
        <div className="bg-slate-100/80 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Select API Key */}
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Gunakan API Key:</span>
              <select
                value={selectedApiKey}
                onChange={e => setSelectedApiKey(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              >
                {apiKeys.length === 0 ? (
                  <option value="sk_live_demo123">sk_live_demo123 (Demo Key)</option>
                ) : (
                  apiKeys.map(k => (
                    <option key={k.key} value={k.key}>
                      {k.name} ({k.key.slice(0, 10)}...) - {k.tier}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Base URL */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Host API:</span>
              <input
                type="text"
                value={baseUrl}
                onChange={e => setBaseUrl(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono w-48"
              />
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-200 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-300 dark:border-slate-700">
            <button
              onClick={() => setSimTab('simulator')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                simTab === 'simulator'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Simulasi Bot WA
            </button>
            <button
              onClick={() => setSimTab('code')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                simTab === 'code'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              Kode Plugin (.js)
            </button>
          </div>
        </div>

        {/* Plugin Selector Tabs */}
        <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-2.5 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => {
              setActivePlugin('checklimit');
              setSimInput('.checklimit');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activePlugin === 'checklimit'
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800/50'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Check Limit API Key
          </button>

          <button
            onClick={() => {
              setActivePlugin('stalktiktok');
              setSimInput('.stalktiktok jessnolimit');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activePlugin === 'stalktiktok'
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800/50'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            TikTok Stalker
          </button>

          <button
            onClick={() => {
              setActivePlugin('tiktok');
              setSimInput('.tiktok https://vt.tiktok.com/ZSqJGDDKP/');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activePlugin === 'tiktok'
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800/50'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            TikTok Downloader
          </button>

          <button
            onClick={() => {
              setActivePlugin('nftoken');
              setSimInput('.nftoken');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activePlugin === 'nftoken'
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800/50'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Netflix NFToken
          </button>
        </div>

        {/* Main Content Area */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">

          {/* SIMULATOR TAB */}
          {simTab === 'simulator' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* WhatsApp UI Screen */}
              <div className="lg:col-span-7 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-300 dark:border-slate-800 overflow-hidden shadow-xl flex flex-col h-[520px]">
                {/* Chat Top Bar */}
                <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow">
                        B
                      </div>
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Bani Bot WA Gateway</h4>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        Online (Connected to API Studio)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMessages([
                      {
                        sender: 'bot',
                        text: '🤖 *Bani Bot WA Gateway Connected*\nKetikan *.checklimit* atau *.stalktiktok jessnolimit* untuk ngetes limit API Key real-time.',
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      }
                    ])}
                    className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Clear Chat
                  </button>
                </div>

                {/* Messages Body */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-100/80 dark:bg-slate-950/90 font-sans text-xs">
                  {messages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${
                          m.sender === 'user'
                            ? 'bg-emerald-600 text-white rounded-tr-none'
                            : 'bg-white dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700/80 rounded-tl-none'
                        }`}
                      >
                        {m.image && (
                          <div className="mb-2 rounded-xl overflow-hidden max-h-48 border border-slate-200 dark:border-slate-700">
                            <img src={m.image} alt="Profil" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className={`whitespace-pre-wrap font-sans text-xs leading-relaxed ${
                          m.sender === 'user' ? '!text-white font-bold' : 'text-slate-900 dark:text-slate-100'
                        }`}>
                          {m.text}
                        </div>
                        <span className={`text-[9px] mt-1 block text-right font-mono ${
                          m.sender === 'user' ? 'text-emerald-100' : 'text-slate-400'
                        }`}>
                          {m.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}

                  {simLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-none p-3 text-slate-700 dark:text-slate-300 flex items-center gap-2 text-xs">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                        <span>Bot sedang memproses request via REST API...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input Bar */}
                <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-3 flex items-center gap-2">
                  <input
                    type="text"
                    value={simInput}
                    onChange={e => setSimInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendSimMessage()}
                    placeholder="Ketik perintah (contoh: .checklimit atau .stalktiktok jessnolimit)"
                    className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                  <button
                    onClick={handleSendSimMessage}
                    disabled={simLoading}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white p-2.5 rounded-xl transition-colors shadow-md shadow-emerald-600/20"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Information & Quick Test Hints */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>Uji Cepat Perintah Bot</span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Klik tombol di bawah untuk mengisi perintah WhatsApp dan menguji respon real-time dari API Key <code className="bg-slate-200 dark:bg-slate-900 px-1.5 py-0.5 rounded text-emerald-700 dark:text-emerald-400 font-mono text-[11px]">{selectedApiKey.slice(0, 12)}...</code>:
                  </p>

                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setSimInput('.checklimit');
                        setTimeout(handleSendSimMessage, 50);
                      }}
                      className="w-full text-left bg-white dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500/50 p-3 rounded-xl transition-all group shadow-sm"
                    >
                      <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-500">
                        <span>.checklimit</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans font-normal bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">Real API Check</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Cek sisa kuota total, per menit, per hari, dan tier API Key ini.</p>
                    </button>

                    <button
                      onClick={() => {
                        setSimInput('.stalktiktok jessnolimit');
                        setTimeout(handleSendSimMessage, 50);
                      }}
                      className="w-full text-left bg-white dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500/50 p-3 rounded-xl transition-all group shadow-sm"
                    >
                      <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-500">
                        <span>.stalktiktok jessnolimit</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans font-normal bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">Stalk Profile</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Stalk pengikut, suka, video, foto profil & riwayat akun TikTok.</p>
                    </button>

                    <button
                      onClick={() => {
                        setSimInput('.tiktok https://vt.tiktok.com/ZSqJGDDKP/');
                        setTimeout(handleSendSimMessage, 50);
                      }}
                      className="w-full text-left bg-white dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500/50 p-3 rounded-xl transition-all group shadow-sm"
                    >
                      <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-500">
                        <span>.tiktok https://vt.tiktok.com/...</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans font-normal bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">Downloader</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Ekstrak video MP4 tanpa watermark & slide foto TikTok.</p>
                    </button>

                    <button
                      onClick={() => {
                        setSimInput('.nftoken');
                        setTimeout(handleSendSimMessage, 50);
                      }}
                      className="w-full text-left bg-white dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500/50 p-3 rounded-xl transition-all group shadow-sm"
                    >
                      <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-500">
                        <span>.nftoken</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans font-normal bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">Generator</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Generate login token Netflix & link multi-device (PC, TV, Mobile).</p>
                    </button>
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-700 dark:text-amber-300">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Catatan Integrasi:</span> Setiap request yang dikirim dari simulator ini mengonsumsi limit API Key <span className="font-mono font-bold">{selectedApiKey.slice(0, 8)}...</span> secara langsung di backend API Gateway.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CODE TAB */}
          {simTab === 'code' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/30">
                    plugins/{activePlugin}.js
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Format Baileys / Bani Bot WA standard
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Tersalin!' : 'Salin Kode'}
                  </button>

                  <button
                    onClick={handleDownloadCode}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Unduh .js
                  </button>
                </div>
              </div>

              {/* Code display */}
              <div className="relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
                <pre className="p-4 text-xs font-mono text-emerald-400 leading-relaxed overflow-x-auto max-h-[480px]">
                  <code>{getPluginCode(activePlugin)}</code>
                </pre>
              </div>

              {/* Steps */}
              <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  Cara Memasang Plugin di Bot WhatsApp Anda:
                </h4>
                <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-1 list-decimal list-inside leading-relaxed">
                  <li>Klik <strong>Salin Kode</strong> atau <strong>Unduh .js</strong> di atas.</li>
                  <li>Simpan file sebagai <code className="text-emerald-600 dark:text-emerald-400 font-mono">plugins/{activePlugin}.js</code> di folder bot WhatsApp Anda.</li>
                  <li>Pastikan package <code className="text-emerald-600 dark:text-emerald-400 font-mono">axios</code> dan <code className="text-emerald-600 dark:text-emerald-400 font-mono">chalk</code> sudah terinstall (<code className="font-mono">npm i axios chalk</code>).</li>
                  <li>Jalankan bot Anda, lalu ketik perintah seperti <code className="text-emerald-600 dark:text-emerald-400 font-mono">.checklimit</code> atau <code className="text-emerald-600 dark:text-emerald-400 font-mono">.stalktiktok jessnolimit</code>!</li>
                </ol>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

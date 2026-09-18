import React, { useState } from 'react';
import { Copy, Check, Eye, Code } from 'lucide-react';

interface JsonViewerProps {
  data: any;
  maxHeight?: string;
  allowRawToggle?: boolean;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({
  data,
  maxHeight = '420px',
  allowRawToggle = true
}) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'pretty' | 'raw'>('pretty');

  const jsonString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Syntax highlighter for formatted JSON
  const highlightJson = (json: string) => {
    if (!json) return '';
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = 'text-amber-700 dark:text-amber-300 font-medium'; // number
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'text-cyan-800 dark:text-cyan-400 font-bold'; // key
          } else {
            cls = 'text-emerald-800 dark:text-emerald-300 font-medium'; // string
          }
        } else if (/true|false/.test(match)) {
          cls = 'text-purple-800 dark:text-purple-400 font-bold'; // boolean
        } else if (/null/.test(match)) {
          cls = 'text-rose-800 dark:text-rose-400 font-bold'; // null
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
  };

  return (
    <div className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-xs shadow-inner">
      {/* Top action bar */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 bg-slate-100 dark:bg-slate-900/60 px-3 py-1.5 text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
          <span className="text-[11px] font-sans font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">application/json</span>
        </div>
        
        <div className="flex items-center gap-1.5">
          {allowRawToggle && (
            <button
              onClick={() => setViewMode(viewMode === 'pretty' ? 'raw' : 'pretty')}
              className="flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:text-slate-400 transition hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
              title="Toggle View Mode"
            >
              {viewMode === 'pretty' ? <Code className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              <span>{viewMode === 'pretty' ? 'Raw' : 'Pretty'}</span>
            </button>
          )}
          
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Display Body */}
      <div
        className="overflow-auto p-3.5 leading-relaxed text-slate-900 dark:text-slate-200"
        style={{ maxHeight }}
      >
        {viewMode === 'pretty' ? (
          <pre
            className="font-mono text-xs"
            dangerouslySetInnerHTML={{ __html: highlightJson(jsonString) }}
          />
        ) : (
          <pre className="font-mono text-xs text-slate-800 dark:text-slate-300 whitespace-pre-wrap break-all">
            {jsonString}
          </pre>
        )}
      </div>
    </div>
  );
};

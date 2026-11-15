import React, { useState, useEffect } from 'react';
import { Terminal, Send, Check, Copy, X, Loader2 } from 'lucide-react';
import { getLocalizedRestEndpoints } from '../data/mockData';
import { FrontendFramework } from '../types';
import { useAppSettings } from '../contexts/AppSettingsContext';

interface ApiSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFramework: FrontendFramework;
  totalPods: number;
}

export const ApiSimulatorModal: React.FC<ApiSimulatorModalProps> = ({
  isOpen,
  onClose,
  currentFramework,
  totalPods,
}) => {
  const { language, t } = useAppSettings();
  const endpoints = getLocalizedRestEndpoints(language);

  const [selectedEndpointId, setSelectedEndpointId] = useState<string>('metrics');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [responseOutput, setResponseOutput] = useState<any>(
    endpoints[0].getResponse(currentFramework, totalPods)
  );
  const [statusCode, setStatusCode] = useState<number>(200);
  const [latency, setLatency] = useState<number>(18);
  const [copied, setCopied] = useState<boolean>(false);

  const currentEndpoint = endpoints.find((e) => e.id === selectedEndpointId) || endpoints[0];

  useEffect(() => {
    setResponseOutput(currentEndpoint.getResponse(currentFramework, totalPods));
    setLatency(currentEndpoint.defaultLatencyMs);
  }, [language, selectedEndpointId, currentFramework, totalPods]);

  if (!isOpen) return null;

  const handleExecute = () => {
    setIsLoading(true);
    setTimeout(() => {
      const res = currentEndpoint.getResponse(currentFramework, totalPods);
      setResponseOutput(res);
      setStatusCode(200);
      setLatency(Math.floor(currentEndpoint.defaultLatencyMs * (0.85 + Math.random() * 0.3)));
      setIsLoading(false);
    }, 450);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(responseOutput, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-zinc-900/60 dark:bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center border border-teal-200 dark:border-teal-800">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{t.apiModal.title}</h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{t.apiModal.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
              {t.apiModal.selectLabel}
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={selectedEndpointId}
                onChange={(e) => {
                  setSelectedEndpointId(e.target.value);
                }}
                className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-teal-600"
              >
                {endpoints.map((ep) => (
                  <option key={ep.id} value={ep.id}>
                    {ep.method} {ep.path} ({ep.name})
                  </option>
                ))}
              </select>

              <button
                onClick={handleExecute}
                disabled={isLoading}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors shrink-0 cursor-pointer whitespace-nowrap"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{t.apiModal.invoking}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{t.apiModal.executeBtn}</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1.5">{currentEndpoint.description}</p>
          </div>

          <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono flex items-center justify-between text-zinc-700 dark:text-zinc-300 gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-emerald-700 dark:text-emerald-400 font-bold text-[10px]">{currentEndpoint.method}</span>
              <span className="text-zinc-800 dark:text-zinc-200 truncate max-w-xs">{currentEndpoint.path}</span>
            </div>
            <span className="text-zinc-500 dark:text-zinc-400">
              {t.apiModal.headerLabel}{' '}
              <span className="text-teal-700 dark:text-teal-400">Authorization: Bearer eyJhb...</span>
            </span>
          </div>

          <div className="bg-zinc-900 dark:bg-zinc-950 rounded-xl border border-zinc-300 dark:border-zinc-800 p-3 font-mono text-xs">
            <div className="flex justify-between items-center pb-2.5 border-b border-zinc-800 text-[11px]">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-emerald-400 font-bold">{statusCode} OK</span>
                <span className="text-zinc-500">·</span>
                <span className="text-zinc-400 font-mono tabular-nums">
                  {t.apiModal.latencyLabel} <strong className="text-emerald-400">{latency} ms</strong>
                </span>
                <span className="text-zinc-500">·</span>
                <span className="text-zinc-400 font-mono">{t.apiModal.tlsLabel}</span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-teal-400 transition-colors cursor-pointer"
                title={t.apiModal.copyJsonTitle}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? t.common.copied : t.common.copy}</span>
              </button>
            </div>

            <pre className="pt-3 text-zinc-300 overflow-x-auto max-h-60 custom-scrollbar leading-relaxed text-[11px]">
              {JSON.stringify(responseOutput, null, 2)}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span>{t.apiModal.footerServer}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
          >
            {t.common.close}
          </button>
        </div>
      </div>
    </div>
  );
};

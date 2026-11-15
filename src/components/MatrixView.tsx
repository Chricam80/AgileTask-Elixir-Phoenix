import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Award,
  RefreshCw,
  Columns,
  Code,
  CheckCircle,
} from 'lucide-react';
import { MATRIX_ITEMS } from '../data/mockData';
import { MatrixItem } from '../types';
import { useAppSettings } from '../contexts/AppSettingsContext';

interface MatrixViewProps {
  items?: MatrixItem[];
}

export const MatrixView: React.FC<MatrixViewProps> = ({ items = MATRIX_ITEMS }) => {
  const { t } = useAppSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.objective.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.methodology.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.outcome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.technology.some((tech) => tech.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.quantitativeImpact.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [items, searchQuery, selectedCategory]);

  const handleExportCsv = () => {
    const headers = [...t.matrix.csvHeaders];
    const rows = items.map((item) => [
      `"${item.code}"`,
      `"${item.objective.replace(/"/g, '""')}"`,
      `"${item.methodology.replace(/"/g, '""')}"`,
      `"${item.technology.join(', ')}"`,
      `"${item.outcome.replace(/"/g, '""')}"`,
      `"${item.quantitativeImpact.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', t.matrix.csvFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getMethodologyIcon = (iconName: string) => {
    switch (iconName) {
      case 'refresh-cw':
        return <RefreshCw className="w-3 h-3" />;
      case 'columns':
        return <Columns className="w-3 h-3" />;
      case 'code':
        return <Code className="w-3 h-3" />;
      default:
        return <CheckCircle className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Methodology Context */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm dark:shadow-none">
        <div>
          <span className="text-teal-700 dark:text-teal-400 font-mono text-xs font-semibold uppercase tracking-wider">
            {t.matrix.docBadge}
          </span>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 mt-1">{t.matrix.title}</h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">{t.matrix.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-mono text-zinc-700 dark:text-zinc-300 tabular-nums">
            {items.length} {t.matrix.countBadge}
          </span>
        </div>
      </div>

      {/* Dynamic Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-none">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.matrix.searchPlaceholder}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-xs rounded-lg pl-9 pr-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-teal-600"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-zinc-600 dark:text-zinc-400 whitespace-nowrap">{t.matrix.filterLabel}</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-xs rounded-lg px-2.5 py-1.5 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-teal-600"
          >
            <option value="all">{t.matrix.filterAll}</option>
            <option value="metodologico">{t.matrix.filterMethod}</option>
            <option value="arquitectura">{t.matrix.filterArch}</option>
            <option value="calidad">{t.matrix.filterQuality}</option>
          </select>
        </div>
      </div>

      {/* Interactive Data Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 uppercase font-mono text-[10px] tracking-wider">
                <th className="p-3.5 pl-5">{t.matrix.colObjective}</th>
                <th className="p-3.5">{t.matrix.colMethodology}</th>
                <th className="p-3.5">{t.matrix.colTech}</th>
                <th className="p-3.5">{t.matrix.colOutcome}</th>
                <th className="p-3.5 pr-5">{t.matrix.colImpact}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
              {filteredItems.map((item: MatrixItem) => (
                <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="p-3.5 pl-5 font-semibold text-zinc-900 dark:text-zinc-50 max-w-xs">
                    <span className="text-teal-700 dark:text-teal-400 font-mono mr-1.5 font-bold">{item.code}:</span>
                    <span>{item.objective}</span>
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-mono text-[11px] font-semibold">
                      {getMethodologyIcon(item.methodologyIcon)}
                      <span>{item.methodology}</span>
                    </span>
                  </td>
                  <td className="p-3.5">
                    <div className="flex flex-col gap-1">
                      {item.technology.map((tech, i) => (
                        <span key={i} className="text-zinc-700 dark:text-zinc-300 font-mono text-[11px] whitespace-nowrap">
                          · {tech}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3.5 text-zinc-600 dark:text-zinc-300 max-w-xs leading-relaxed">{item.outcome}</td>
                  <td className="p-3.5 pr-5 whitespace-nowrap">
                    <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold text-[11px]">
                      {item.quantitativeImpact}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500 font-mono text-xs">
                    {t.matrix.emptySearch}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 gap-2 flex-wrap">
          <span>{t.matrix.footerSource}</span>
          <button
            onClick={handleExportCsv}
            className="text-teal-700 dark:text-teal-400 hover:text-teal-600 dark:hover:text-teal-300 flex items-center gap-1.5 font-medium cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.matrix.exportCsvBtn}</span>
          </button>
        </div>
      </div>

      {/* Research Conclusion Card */}
      <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-none">
        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2 mb-2">
          <Award className="w-4 h-4 text-teal-700 dark:text-teal-400" />
          <span>{t.matrix.conclusionTitle}</span>
        </h4>
        <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed italic">{t.matrix.conclusionQuote}</p>
      </div>
    </div>
  );
};

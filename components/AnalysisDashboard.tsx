
import React, { useState, useMemo, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { SentimentAnalysisResult } from '../types';
import { Sentiment } from '../types';
import { DownloadIcon } from './icons';

const SENTIMENT_CONFIG = {
  [Sentiment.Positive]: { color: '#22c55e', bgColor: 'bg-green-100', textColor: 'text-green-800', emoji: '😊' },
  [Sentiment.Negative]: { color: '#ef4444', bgColor: 'bg-red-100', textColor: 'text-red-800', emoji: '😠' },
  [Sentiment.Neutral]: { color: '#64748b', bgColor: 'bg-slate-100', textColor: 'text-slate-800', emoji: '😐' },
  [Sentiment.Mixed]: { color: '#f97316', bgColor: 'bg-orange-100', textColor: 'text-orange-800', emoji: '🤔' },
};

const escapeCsvCell = (cell: string | number): string => {
  const cellStr = String(cell);
  if (/[",\n]/.test(cellStr)) {
    const escapedStr = cellStr.replace(/"/g, '""');
    return `"${escapedStr}"`;
  }
  return cellStr;
};

const EmotionPill: React.FC<{ emotion: string }> = ({ emotion }) => (
  <span className="text-xs font-medium bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
    {emotion}
  </span>
);

const ResultCard: React.FC<{ result: SentimentAnalysisResult }> = ({ result }) => {
  const config = SENTIMENT_CONFIG[result.sentiment];
  return (
    <div className={`p-4 rounded-lg border ${config.bgColor.replace('bg-', 'border-')} animate-fade-in`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase">{result.source}</p>
          <p className="mt-2 text-slate-700 text-sm">"{result.text}"</p>
        </div>
        <div className={`text-sm font-bold px-2.5 py-1 rounded-full ${config.bgColor} ${config.textColor}`}>
          {result.sentiment}
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-slate-200/80">
        <p className="text-sm text-slate-600"><span className="font-semibold text-slate-800">Explanation:</span> {result.explanation}</p>
        <div className="flex items-center justify-between mt-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Emotions:</span>
            <div className="flex gap-1.5 flex-wrap">
              {result.emotions.length > 0 ? result.emotions.map(e => <EmotionPill key={e} emotion={e} />) : <span className="text-xs text-slate-500">None detected</span>}
            </div>
          </div>
          <div className="text-right">
            <span className="font-semibold text-slate-800">Confidence: </span>
            <span className={`${config.textColor} font-bold`}>
              {(result.confidence * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AnalysisDashboard: React.FC<{ results: SentimentAnalysisResult[] }> = ({ results }) => {
  const [filter, setFilter] = useState<Sentiment | 'ALL'>('ALL');

  const summary = useMemo(() => {
    const total = results.length;
    if (total === 0) return {
      positive: 0, negative: 0, neutral: 0, mixed: 0, mostCommon: Sentiment.Neutral,
      avgConfidence: 0,
    };
    
    const counts = results.reduce((acc, r) => {
        acc[r.sentiment] = (acc[r.sentiment] || 0) + 1;
        return acc;
    }, {} as Record<Sentiment, number>);

    const mostCommon = (Object.keys(counts) as Sentiment[]).reduce((a, b) => counts[a] > counts[b] ? a : b, Sentiment.Neutral);
    const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / total;

    return {
      positive: ((counts[Sentiment.Positive] || 0) / total) * 100,
      negative: ((counts[Sentiment.Negative] || 0) / total) * 100,
      neutral: ((counts[Sentiment.Neutral] || 0) / total) * 100,
      mixed: ((counts[Sentiment.Mixed] || 0) / total) * 100,
      mostCommon,
      avgConfidence
    };
  }, [results]);

  const chartData = useMemo(() => {
    return Object.values(Sentiment).map(s => ({
      name: s,
      count: results.filter(r => r.sentiment === s).length
    }));
  }, [results]);
  
  const filteredResults = useMemo(() => {
    if (filter === 'ALL') return results;
    return results.filter(r => r.sentiment === filter);
  }, [results, filter]);

  const handleExport = useCallback(() => {
    if (results.length === 0) return;

    const headers = ['id', 'source', 'text', 'sentiment', 'confidence', 'emotions', 'explanation'];
    const csvRows = [headers.join(',')];

    results.forEach(result => {
      const emotions = result.emotions.join('; ');
      const row = [
        result.id,
        result.source,
        result.text,
        result.sentiment,
        result.confidence,
        emotions,
        result.explanation,
      ].map(escapeCsvCell);
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'sentiment-analysis-results.csv');
    document.body.appendChild(link);
    link.click();
    
    URL.revokeObjectURL(url);
    document.body.removeChild(link);
  }, [results]);

  const formatXAxisTick = (tick: string) => {
    if (!tick) return '';
    return tick.charAt(0).toUpperCase() + tick.slice(1).toLowerCase();
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800">Analysis Summary</h2>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 text-sm font-medium text-white bg-brand-secondary hover:bg-brand-secondary/90 px-3 py-1.5 rounded-md transition-colors shadow-sm"
          >
            <DownloadIcon className="w-4 h-4" />
            <span>Export Results</span>
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-sm font-medium text-slate-500">Total Inputs</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{results.length}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-sm font-medium text-slate-500">Overall Sentiment</p>
                <div className="flex items-center mt-1">
                    <span className="text-3xl">{SENTIMENT_CONFIG[summary.mostCommon].emoji}</span>
                    <p className={`text-xl font-bold ml-2 ${SENTIMENT_CONFIG[summary.mostCommon].textColor}`}>{summary.mostCommon}</p>
                </div>
            </div>
             <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-sm font-medium text-slate-500">Avg. Confidence</p>
                <p className="text-3xl font-bold text-brand-primary mt-1">{(summary.avgConfidence * 100).toFixed(1)}%</p>
            </div>
             <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-sm font-medium text-slate-500">Positive vs Negative</p>
                <div className="flex items-center mt-2 w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                    <div className="bg-green-500 h-4" style={{ width: `${summary.positive}%`}}></div>
                    <div className="bg-red-500 h-4" style={{ width: `${summary.negative}%`}}></div>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow min-h-0">
          <div className="lg:col-span-1 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-4">Sentiment Distribution</h3>
              <div className="w-full h-64">
                <ResponsiveContainer>
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} tickFormatter={formatXAxisTick} />
                        <YAxis allowDecimals={false} />
                        <Tooltip cursor={{fill: 'rgba(238, 242, 255, 0.6)'}}/>
                        <Bar dataKey="count" name="Inputs" >
                          {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={SENTIMENT_CONFIG[entry.name as Sentiment].color} />
                          ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
              </div>
          </div>
          <div className="lg:col-span-2 flex flex-col min-h-0">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800">Detailed Results ({filteredResults.length})</h3>
                <div className="flex items-center text-sm gap-2">
                    <span className="font-medium text-slate-600">Filter:</span>
                    <select 
                      value={filter}
                      onChange={(e) => setFilter(e.target.value as Sentiment | 'ALL')}
                      className="bg-white border border-slate-300 rounded-md py-1 px-2 text-sm focus:ring-brand-primary focus:border-brand-primary"
                    >
                        <option value="ALL">All</option>
                        {Object.values(Sentiment).map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
            </div>
             <div className="flex-grow overflow-y-auto space-y-4 pr-2 -mr-2">
                 {filteredResults.map(result => (
                    <ResultCard key={result.id} result={result} />
                 ))}
             </div>
          </div>
      </div>
    </div>
  );
};

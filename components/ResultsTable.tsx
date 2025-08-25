import React, { useState } from 'react';
import type { SentimentAnalysisResult } from '../types';
import { Sentiment } from '../types';
import { KeywordIcon, TagIcon, ChevronDownIcon } from './icons';

interface ResultsTableProps {
  data: SentimentAnalysisResult[];
}

const sentimentStyles: Record<Sentiment, { bg: string, text: string, border: string }> = {
  [Sentiment.Positive]: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200'},
  [Sentiment.Negative]: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  [Sentiment.Neutral]: { bg: 'bg-slate-200', text: 'text-slate-600', border: 'border-slate-300' },
  [Sentiment.Mixed]: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
};

const ConfidenceBar: React.FC<{ value: number }> = ({ value }) => {
    const percentage = (value * 100).toFixed(0);
    const color = value > 0.75 ? 'bg-green-500' : value > 0.5 ? 'bg-yellow-500' : 'bg-red-500';
    return (
        <div className="flex items-center gap-2">
            <div className="w-full bg-slate-200 rounded-full h-2">
                <div className={`${color} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
            </div>
            <span className="text-sm font-medium text-slate-600 w-12 text-right">{percentage}%</span>
        </div>
    );
};


export const ResultsTable: React.FC<ResultsTableProps> = ({ data }) => {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const handleRowClick = (id: string) => {
    setExpandedRowId(currentId => (currentId === id ? null : id));
  };

  return (
    <div className="h-full w-full overflow-auto bg-white rounded-lg border border-slate-200 animate-fade-in">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-100 sticky top-0 z-[1]">
          <tr>
            <th scope="col" className="relative px-2 py-3"><span className="sr-only">Expand row</span></th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Text Sample</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Source</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Sentiment</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Confidence</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Keywords</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Explanation</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {data.map((result) => {
            const styles = sentimentStyles[result.sentiment];
            const isExpanded = expandedRowId === result.id;

            return (
              <React.Fragment key={result.id}>
                <tr onClick={() => handleRowClick(result.id)} className="cursor-pointer hover:bg-slate-50 transition-colors" aria-expanded={isExpanded}>
                  <td className="px-2 py-4 text-center">
                    <ChevronDownIcon aria-hidden="true" className={`w-5 h-5 mx-auto text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-700 max-w-xs truncate" title={result.text}>{result.text}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                   <div className="flex items-center gap-2 text-sm text-slate-600">
                        <TagIcon className="w-4 h-4 text-slate-400" />
                        <span>{result.source}</span>
                   </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${styles.bg} ${styles.text}`}>
                      {result.sentiment}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                      <ConfidenceBar value={result.confidence} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-2 max-w-xs">
                      {result.keywords.map((kw, i) => (
                        <span key={i} className={`flex items-center gap-1 px-2 py-1 text-xs rounded border ${styles.bg} ${styles.text} ${styles.border}`}>
                            <KeywordIcon className="w-3 h-3"/> {kw}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600 max-w-sm truncate" title={result.explanation}>{result.explanation}</div>
                  </td>
                </tr>
                {isExpanded && (
                    <tr>
                        <td colSpan={7} className="p-4 bg-slate-50">
                           <div className="space-y-3 animate-fade-in">
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Full Text</h4>
                                    <p className="text-sm text-slate-800 whitespace-normal">{result.text}</p>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Full Explanation</h4>
                                    <p className="text-sm text-slate-800 whitespace-normal">{result.explanation}</p>
                                </div>
                            </div>
                        </td>
                    </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

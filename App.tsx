
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { TextInput } from './components/TextInput';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { Loader } from './components/Loader';
import { analyzeSentimentBatch } from './services/geminiService';
import type { AnalysisInput, SentimentAnalysisResult } from './types';
import { ErrorIcon, FileTextIcon, ListIcon, TagIcon } from './components/icons';

const App: React.FC = () => {
  const [analysisInputs, setAnalysisInputs] = useState<Omit<AnalysisInput, 'id'>[]>([]);
  const [analysisResults, setAnalysisResults] = useState<SentimentAnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async () => {
    const validInputs = analysisInputs.filter(i => i.text.trim() !== '');
    if (validInputs.length === 0) {
      setError("Please add some text to analyze.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const results = await analyzeSentimentBatch(validInputs);
      const resultsWithIds: SentimentAnalysisResult[] = results.map((r, index) => ({
        ...r,
        // Ensure original data is used as a fallback if API misses it
        text: r.text || validInputs[index].text, 
        source: r.source || validInputs[index].source,
        id: crypto.randomUUID(),
      }));
      setAnalysisResults(resultsWithIds);
    } catch (e) {
      console.error(e);
      setError("An error occurred during analysis. The AI model may be temporarily unavailable or the input format is incorrect. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [analysisInputs]);

  const handleClear = () => {
    setAnalysisInputs([]);
    setAnalysisResults([]);
    setError(null);
  }

  const renderContent = () => {
    if (isLoading) {
      return <Loader />;
    }
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center text-red-600 animate-fade-in">
          <ErrorIcon className="w-16 h-16 mb-4"/>
          <h3 className="text-xl font-semibold">Analysis Failed</h3>
          <p className="mt-2 max-w-md">{error}</p>
        </div>
      );
    }
    if (analysisResults.length > 0) {
      return <AnalysisDashboard results={analysisResults} />;
    }
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-slate-600 animate-fade-in">
        <ListIcon className="w-20 h-20 mb-4 text-slate-400"/>
        <h2 className="text-2xl font-bold text-slate-800">MEDI MIND Sentiment Analysis Dashboard</h2>
        <p className="mt-2 max-w-lg">
          Add text with its source, upload a file, and click 'Analyze' to see a breakdown of sentiment,
          confidence scores, and key topics.
        </p>
        <div className="mt-6 text-left space-y-2">
            <p className="flex items-center"><FileTextIcon className="w-5 h-5 mr-2 text-brand-secondary"/> Compare sentiment across sources like social media or surveys.</p>
            <p className="flex items-center"><TagIcon className="w-5 h-5 mr-2 text-brand-secondary"/> Identify key topics and keywords for each entry.</p>
            <p className="flex items-center"><ListIcon className="w-5 h-5 mr-2 text-brand-secondary"/> View results in an expandable table with detailed explanations.</p>
        </div>
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header onLogoClick={handleClear} />
      <main className="flex-grow flex flex-col md:flex-row p-4 lg:p-6 gap-6">
        <div className="md:w-1/3 lg:w-1/4 flex-shrink-0 animate-slide-in-left">
           <TextInput 
            onInputsChange={setAnalysisInputs}
            onAnalyze={handleAnalyze}
            onClear={handleClear}
            isLoading={isLoading}
            initialInputs={analysisInputs}
          />
        </div>
        <div className="flex-grow bg-white rounded-lg border border-slate-200 shadow-lg p-6 min-h-[400px] md:min-h-0">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;

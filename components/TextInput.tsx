import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AnalyzeIcon, ClearIcon, UploadIcon, PlusIcon, TrashIcon, TagIcon, FlaskIcon } from './icons';
import type { AnalysisInput } from '../types';

interface TextInputProps {
  onInputsChange: (inputs: Omit<AnalysisInput, 'id'>[]) => void;
  onAnalyze: () => void;
  onClear: () => void;
  isLoading: boolean;
  initialInputs: Omit<AnalysisInput, 'id'>[];
}

const createNewEntry = (text = '', source = ''): AnalysisInput => ({
  id: crypto.randomUUID(),
  text,
  source,
});

const sampleEntries = [
  { text: "The new phone has an incredible camera and the battery life is amazing. Best purchase this year!", source: "Product Review" },
  { text: "I'm very disappointed with the customer service. I was on hold for over an hour and my issue is still not resolved.", source: "Support Ticket" },
  { text: "The package arrived today, three days earlier than expected. Everything was in order.", source: "Shipping Feedback" },
  { text: "The user interface is a bit confusing to navigate. It took me a while to find the settings menu.", source: "User Survey" },
];

export const TextInput: React.FC<TextInputProps> = ({ onInputsChange, onAnalyze, onClear, isLoading, initialInputs }) => {
  const [entries, setEntries] = useState<AnalysisInput[]>(() => 
    initialInputs.length > 0 ? initialInputs.map(i => ({...i, id: crypto.randomUUID()})) : [createNewEntry()]
  );
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onInputsChange(entries.map(({ id, ...rest }) => rest));
  }, [entries, onInputsChange]);
  
  const updateEntry = (id: string, newValues: Partial<Omit<AnalysisInput, 'id'>>) => {
    setEntries(currentEntries =>
      currentEntries.map(entry =>
        entry.id === id ? { ...entry, ...newValues } : entry
      )
    );
  };
  
  const addEntry = () => {
    setEntries(currentEntries => [...currentEntries, createNewEntry('', currentEntries[currentEntries.length -1]?.source || '')]);
  };

  const removeEntry = (id: string) => {
    setEntries(currentEntries => currentEntries.filter(entry => entry.id !== id));
  };
  
  const loadSampleData = () => {
    setEntries(sampleEntries.map(e => ({ ...e, id: crypto.randomUUID() })));
  };

  const handleLocalClear = () => {
    setEntries([createNewEntry()]);
    onClear();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, entryId: string) => {
      const paste = e.clipboardData.getData('text');
      const lines = paste.split('\n').filter(line => line.trim() !== '');
      if (lines.length > 1) {
          e.preventDefault();
          const currentEntryIndex = entries.findIndex(entry => entry.id === entryId);
          if (currentEntryIndex === -1) return;

          const source = entries[currentEntryIndex].source;
          const newEntries = lines.map(line => createNewEntry(line, source));
          
          setEntries(currentEntries => [
              ...currentEntries.slice(0, currentEntryIndex),
              ...newEntries,
              ...currentEntries.slice(currentEntryIndex + 1)
          ]);
      }
  };

  const handleFileChange = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const source = file.name || 'File Upload';
        const lines = content.split('\n').filter(line => line.trim() !== '');
        if (lines.length > 0) {
          setEntries(lines.map(line => createNewEntry(line, source)));
        }
      };
      reader.readAsText(file);
    }
  };

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e.target.files?.[0] || null);
    e.target.value = '';
  };
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }, []);
  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      handleFileChange(e.dataTransfer.files?.[0] || null);
  }, []);

  const hasContent = entries.some(e => e.text.trim() !== '');

  return (
    <div className="bg-white rounded-lg p-6 border border-slate-200 h-full flex flex-col shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Input Data</h2>
        <button 
          onClick={loadSampleData} 
          className="flex items-center gap-1.5 text-sm text-brand-secondary hover:text-brand-primary font-medium transition-colors"
          title="Load sample data"
        >
          <FlaskIcon className="w-4 h-4" />
          Load Samples
        </button>
      </div>
      <p className="text-sm text-slate-600 mb-4">
        Add entries for each piece of text and its source. Pasting multiple lines in a text field will automatically create new entries.
      </p>
      
      <div className="flex-grow overflow-y-auto pr-2 space-y-3">
        {entries.map((entry, index) => (
            <div key={entry.id} className="flex items-start gap-2 animate-fade-in">
                <div className="flex-grow space-y-2">
                    <input
                        type="text"
                        value={entry.text}
                        onPaste={(e) => handlePaste(e, entry.id)}
                        onChange={(e) => updateEntry(entry.id, { text: e.target.value })}
                        placeholder={`Text to analyze (e.g., "The product is amazing!")`}
                        className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-700 placeholder-slate-400 focus:ring-1 focus:ring-brand-secondary focus:border-brand-secondary transition"
                    />
                    <div className="relative">
                       <TagIcon className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
                       <input
                           type="text"
                           value={entry.source}
                           onChange={(e) => updateEntry(entry.id, { source: e.target.value })}
                           placeholder="Source (e.g., 'Social Media')"
                           className="w-full bg-slate-50 border border-slate-300 rounded-md pl-8 p-2 text-sm text-slate-600 placeholder-slate-400 focus:ring-1 focus:ring-brand-secondary focus:border-brand-secondary transition"
                       />
                    </div>
                </div>
                <button 
                    onClick={() => removeEntry(entry.id)} 
                    disabled={entries.length <= 1}
                    className="p-2 mt-1 text-slate-400 hover:text-red-500 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors" 
                    title="Remove Entry">
                    <TrashIcon className="w-5 h-5"/>
                </button>
            </div>
        ))}
      </div>

      <button onClick={addEntry} className="mt-4 w-full flex items-center justify-center gap-2 text-sm py-2 px-4 rounded-md border border-dashed border-slate-300 text-slate-500 hover:bg-slate-50 hover:border-slate-400 transition">
          <PlusIcon className="w-4 h-4" /> Add Entry
      </button>

      <label
        htmlFor="file-upload"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`mt-4 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors duration-300 ${isDragging ? 'border-brand-secondary bg-blue-50' : 'border-slate-300 hover:border-slate-400'}`}
      >
        <UploadIcon className="w-6 h-6 mx-auto text-slate-400 mb-1"/>
        <span className="text-sm text-slate-500">
          <span className="font-semibold text-brand-secondary">Upload a file</span> or drag and drop
        </span>
        <input id="file-upload" ref={fileInputRef} type="file" className="hidden" accept=".txt,.csv" onChange={onFileSelected} />
      </label>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          onClick={onAnalyze}
          disabled={isLoading || !hasContent}
          className="w-full flex items-center justify-center gap-2 bg-brand-secondary hover:bg-brand-primary disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition duration-300 shadow-lg"
        >
          <AnalyzeIcon className="w-5 h-5"/>
          {isLoading ? 'Analyzing...' : 'Analyze'}
        </button>
        <button
          onClick={handleLocalClear}
          disabled={isLoading}
          className="w-full sm:w-auto bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 px-4 rounded-md transition duration-300"
        >
          <ClearIcon className="w-5 h-5"/>
        </button>
      </div>
    </div>
  );
};

export interface AnalysisInput {
  id: string;
  text: string;
  source: string;
}

export enum Sentiment {
  Positive = 'POSITIVE',
  Negative = 'NEGATIVE',
  Neutral = 'NEUTRAL',
  Mixed = 'MIXED',
}

export interface SentimentAnalysisResult {
  id: string;
  text: string;
  source: string;
  sentiment: Sentiment;
  confidence: number; // 0 to 1
  keywords: string[];
  explanation: string;
  emotions: string[];
}


import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisInput, SentimentAnalysisResult } from "../types";
import { Sentiment } from "../types";

// Ensure API_KEY is available in the environment
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  // In a real app, you'd want to handle this more gracefully,
  // but for this context, throwing an error is clear.
  throw new Error("API_KEY environment variable not set.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    results: {
      type: Type.ARRAY,
      description: "An array of sentiment analysis results for each input text.",
      items: {
        type: Type.OBJECT,
        properties: {
          text: {
            type: Type.STRING,
            description: "The original text that was analyzed."
          },
          source: {
            type: Type.STRING,
            description: "The original source identifier for the text."
          },
          sentiment: {
            type: Type.STRING,
            enum: ['POSITIVE', 'NEGATIVE', 'NEUTRAL', 'MIXED'],
            description: "The overall sentiment of the text. Can be POSITIVE, NEGATIVE, NEUTRAL, or MIXED."
          },
          confidence: {
            type: Type.NUMBER,
            description: "A score from 0.0 to 1.0 representing the model's confidence in its sentiment assessment."
          },
          keywords: {
            type: Type.ARRAY,
            description: "A list of up to three keywords or topics that are central to the sentiment of the text.",
            items: {
              type: Type.STRING
            }
          },
          explanation: {
            type: Type.STRING,
            description: "A brief, one-sentence explanation for the sentiment analysis, highlighting key phrases or tones."
          },
          emotions: {
            type: Type.ARRAY,
            description: "A list of up to three emotions detected in the text (e.g., joy, anger, surprise). If no specific emotion is detected, return an empty array.",
            items: {
              type: Type.STRING
            }
          }
        },
        required: ["text", "source", "sentiment", "confidence", "keywords", "explanation", "emotions"]
      }
    }
  },
  required: ["results"]
};

export const analyzeSentimentBatch = async (
  inputs: Omit<AnalysisInput, 'id'>[]
): Promise<Omit<SentimentAnalysisResult, 'id'>[]> => {

  const prompt = `
    Perform a sentiment analysis on the following batch of text inputs. For each input, provide a detailed analysis.

    Analyze the following JSON array of texts:
    ${JSON.stringify(inputs, null, 2)}

    For each object in the array, determine the sentiment, a confidence score, key keywords, a list of detected emotions (like joy, sadness, anger), and a brief explanation.
    Follow the provided JSON schema for the output. Ensure the sentiment value is one of the following uppercase strings: 'POSITIVE', 'NEGATIVE', 'NEUTRAL', 'MIXED'. If no specific emotions are detected, provide an empty array for the 'emotions' field.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.2,
      },
    });

    const responseText = response.text.trim();
    const parsedResponse = JSON.parse(responseText);

    if (parsedResponse && parsedResponse.results && Array.isArray(parsedResponse.results)) {
       return parsedResponse.results.map((result: any) => ({
        ...result,
        emotions: result.emotions || [],
        sentiment: result.sentiment.toUpperCase() as Sentiment,
      }));
    } else {
        throw new Error("Invalid response structure from Gemini API.");
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini API request failed: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the Gemini API.");
  }
};

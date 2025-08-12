import { useMutation } from '@tanstack/react-query';
import { aiAPI } from '@/utils/api';
import { useState, useCallback } from 'react';

// Classify email intent
export const useClassifyIntent = () => {
  return useMutation({
    mutationFn: aiAPI.classifyIntent,
  });
};

// Generate email content
export const useGenerateEmail = () => {
  return useMutation({
    mutationFn: ({ prompt, assistantType, recipientContext }) => 
      aiAPI.generateEmail(prompt, assistantType, recipientContext),
  });
};

// Stream email generation
export const useStreamEmail = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState({ subject: '', body: '' });
  const [error, setError] = useState(null);

  const startStreaming = useCallback((prompt, type) => {
    setIsStreaming(true);
    setError(null);
    setStreamedContent({ subject: '', body: '' });

    const cleanup = aiAPI.streamEmailGeneration(
      prompt,
      type,
      // onChunk
      (data) => {
        if (data.type === 'subject') {
          setStreamedContent(prev => ({ ...prev, subject: data.content }));
        } else if (data.type === 'body') {
          setStreamedContent(prev => ({ ...prev, body: data.content }));
        }
      },
      // onComplete
      () => {
        setIsStreaming(false);
      },
      // onError
      (err) => {
        setError(err);
        setIsStreaming(false);
      }
    );

    return cleanup;
  }, []);

  return {
    startStreaming,
    isStreaming,
    streamedContent,
    error,
  };
};
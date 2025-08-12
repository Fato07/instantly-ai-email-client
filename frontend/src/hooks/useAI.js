import { useMutation } from '@tanstack/react-query';
import { aiAPI } from '@/utils/api';
import { useState, useCallback } from 'react';

export const useClassifyIntent = () => {
  return useMutation({
    mutationFn: aiAPI.classifyIntent,
  });
};

export const useGenerateEmail = () => {
  return useMutation({
    mutationFn: ({ prompt, assistantType, recipientContext }) => 
      aiAPI.generateEmail(prompt, assistantType, recipientContext),
  });
};

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
      (data) => {
        if (data.type === 'subject') {
          setStreamedContent(prev => ({ ...prev, subject: data.content }));
        } else if (data.type === 'body') {
          setStreamedContent(prev => ({ ...prev, body: data.content }));
        }
      },
      () => {
        setIsStreaming(false);
      },
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
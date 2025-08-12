import { aiService } from '../services/aiService.js';

export default async function aiRoutes(fastify, options) {
  // Classify email intent
  fastify.post('/api/ai/classify', async (request, reply) => {
    try {
      const { prompt } = request.body;
      
      if (!prompt) {
        return reply.code(400).send({ error: 'Prompt is required' });
      }
      
      const assistantType = aiService.classifyIntent(prompt);
      
      return {
        prompt,
        assistantType,
        confidence: 0.85 // Mock confidence score
      };
    } catch (error) {
      console.error('Error classifying intent:', error);
      reply.code(500).send({ error: 'Failed to classify intent' });
    }
  });

  // Generate email content with streaming
  fastify.get('/api/ai/generate', async (request, reply) => {
    try {
      const { prompt, type = 'general' } = request.query;
      
      if (!prompt) {
        return reply.code(400).send({ error: 'Prompt is required' });
      }

      // Set up SSE headers
      reply.raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Credentials': 'true'
      });

      // Generate email content
      const emailContent = await aiService.generateEmail(prompt, type);
      
      // Simulate streaming by sending content in chunks
      const chunks = [
        { type: 'subject', content: emailContent.subject },
        { type: 'body', content: emailContent.body }
      ];

      for (const chunk of chunks) {
        // Send each chunk with a small delay to simulate streaming
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const data = JSON.stringify(chunk);
        reply.raw.write(`data: ${data}\n\n`);
      }

      // Send completion event
      reply.raw.write('data: {"type":"complete"}\n\n');
      reply.raw.end();
      
    } catch (error) {
      console.error('Error generating email:', error);
      reply.code(500).send({ error: 'Failed to generate email' });
    }
  });

  // Alternative POST endpoint for AI generation (non-streaming)
  fastify.post('/api/ai/generate', async (request, reply) => {
    try {
      const { prompt, assistantType = 'general', recipientContext } = request.body;
      
      if (!prompt) {
        return reply.code(400).send({ error: 'Prompt is required' });
      }
      
      const emailContent = await aiService.generateEmail(prompt, assistantType, recipientContext);
      
      return {
        ...emailContent,
        assistantType,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating email:', error);
      reply.code(500).send({ error: 'Failed to generate email' });
    }
  });
}
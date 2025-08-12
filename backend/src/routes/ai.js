import { aiService } from '../services/aiService.js';
import { openaiService } from '../services/openaiService.js';

export default async function aiRoutes(fastify, options) {
  fastify.post('/api/ai/classify', async (request, reply) => {
    try {
      const { prompt } = request.body;
      
      if (!prompt) {
        return reply.code(400).send({ error: 'Prompt is required' });
      }
      
      const assistantType = await aiService.classifyIntent(prompt);
      
      return {
        prompt,
        assistantType,
        confidence: 0.85
      };
    } catch (error) {
      reply.code(500).send({ error: 'Failed to classify intent' });
    }
  });

  fastify.get('/api/ai/generate', async (request, reply) => {
    try {
      const { prompt, type = 'general' } = request.query;
      
      if (!prompt) {
        return reply.code(400).send({ error: 'Prompt is required' });
      }

      reply.raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Credentials': 'true'
      });

      if (openaiService.isConfigured()) {
        try {
          for await (const chunk of openaiService.streamEmail(prompt, type)) {
            const data = JSON.stringify(chunk);
            reply.raw.write(`data: ${data}\n\n`);
          }
        } catch (error) {
          console.error('OpenAI streaming failed, using fallback:', error);
          const emailContent = await aiService.generateEmail(prompt, type);
          
          const chunks = [
            { type: 'subject', content: emailContent.subject },
            { type: 'body', content: emailContent.body }
          ];

          for (const chunk of chunks) {
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const data = JSON.stringify(chunk);
            reply.raw.write(`data: ${data}\n\n`);
          }

          reply.raw.write('data: {"type":"complete"}\n\n');
        }
      } else {
        const emailContent = await aiService.generateEmail(prompt, type);
        
        const chunks = [
          { type: 'subject', content: emailContent.subject },
          { type: 'body', content: emailContent.body }
        ];

        for (const chunk of chunks) {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const data = JSON.stringify(chunk);
          reply.raw.write(`data: ${data}\n\n`);
        }

        reply.raw.write('data: {"type":"complete"}\n\n');
      }
      
      reply.raw.end();
      
    } catch (error) {
      reply.code(500).send({ error: 'Failed to generate email' });
    }
  });

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
      reply.code(500).send({ error: 'Failed to generate email' });
    }
  });
}
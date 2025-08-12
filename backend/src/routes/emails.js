import { emailService } from '../services/emailService.js';

export default async function emailRoutes(fastify, options) {
  fastify.get('/api/emails', async (request, reply) => {
    try {
      const emails = await emailService.getAllEmails();
      return { emails };
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch emails' });
    }
  });

  fastify.get('/api/emails/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const email = await emailService.getEmailById(id);
      
      if (!email) {
        return reply.code(404).send({ error: 'Email not found' });
      }
      
      return { email };
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch email' });
    }
  });

  fastify.post('/api/emails', async (request, reply) => {
    try {
      const { to, cc, bcc, subject, body, sendImmediately = false } = request.body;
      
      if (!to || !subject) {
        return reply.code(400).send({ error: 'To and Subject fields are required' });
      }
      
      const email = await emailService.createEmail({
        to,
        cc,
        bcc,
        subject,
        body
      }, sendImmediately);
      
      reply.code(201).send({ email });
    } catch (error) {
      if (error.message.includes('Invalid email')) {
        return reply.code(400).send({ error: error.message });
      }
      
      reply.code(500).send({ error: 'Failed to create email' });
    }
  });

  fastify.post('/api/emails/:id/send', async (request, reply) => {
    try {
      const { id } = request.params;
      const result = await emailService.sendEmail(id);
      
      return { 
        email: result,
        message: result.status === 'sent' ? 'Email sent successfully' : 'Failed to send email'
      };
    } catch (error) {
      if (error.message === 'Email not found') {
        return reply.code(404).send({ error: error.message });
      }
      
      if (error.message === 'Email has already been sent') {
        return reply.code(400).send({ error: error.message });
      }
      
      reply.code(500).send({ error: 'Failed to send email' });
    }
  });

  fastify.delete('/api/emails/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const deleted = await emailService.deleteEmail(id);
      
      if (!deleted) {
        return reply.code(404).send({ error: 'Email not found' });
      }
      
      return { message: 'Email deleted successfully' };
    } catch (error) {
      reply.code(500).send({ error: 'Failed to delete email' });
    }
  });
}
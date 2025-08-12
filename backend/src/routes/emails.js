import { emailService } from '../services/emailService.js';

export default async function emailRoutes(fastify, options) {
  // Get all emails
  fastify.get('/api/emails', async (request, reply) => {
    try {
      const emails = await emailService.getAllEmails();
      return { emails };
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch emails' });
    }
  });

  // Get email by ID
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

  // Create new email
  fastify.post('/api/emails', async (request, reply) => {
    try {
      const { to, cc, bcc, subject, body } = request.body;
      
      if (!to || !subject) {
        return reply.code(400).send({ error: 'To and Subject fields are required' });
      }
      
      const email = await emailService.createEmail({
        to,
        cc,
        bcc,
        subject,
        body
      });
      
      reply.code(201).send({ email });
    } catch (error) {
      console.error('Error creating email:', error);
      reply.code(500).send({ error: 'Failed to create email' });
    }
  });

  // Delete email
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
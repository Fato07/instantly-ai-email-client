import db from '../db/index.js';

export const emailService = {
  async getAllEmails() {
    return await db('emails')
      .select('*')
      .orderBy('created_at', 'desc');
  },

  async getEmailById(id) {
    return await db('emails')
      .where({ id })
      .first();
  },

  async createEmail(emailData) {
    const [id] = await db('emails')
      .insert({
        to: emailData.to,
        cc: emailData.cc || null,
        bcc: emailData.bcc || null,
        subject: emailData.subject,
        body: emailData.body,
      })
      .returning('id');
    
    return await this.getEmailById(id);
  },

  async deleteEmail(id) {
    return await db('emails')
      .where({ id })
      .del();
  }
};
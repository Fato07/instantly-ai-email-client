import db from '../db/index.js';
import { mailerService } from './mailerService.js';

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

  async createEmail(emailData, sendImmediately = false) {
    const toValidation = mailerService.validateEmailList(emailData.to);
    if (!toValidation.valid) {
      throw new Error(`Invalid email addresses in To field: ${toValidation.invalidEmails.join(', ')}`);
    }
    
    if (emailData.cc) {
      const ccValidation = mailerService.validateEmailList(emailData.cc);
      if (!ccValidation.valid) {
        throw new Error(`Invalid email addresses in CC field: ${ccValidation.invalidEmails.join(', ')}`);
      }
    }
    
    if (emailData.bcc) {
      const bccValidation = mailerService.validateEmailList(emailData.bcc);
      if (!bccValidation.valid) {
        throw new Error(`Invalid email addresses in BCC field: ${bccValidation.invalidEmails.join(', ')}`);
      }
    }
    
    const insertResult = await db('emails')
      .insert({
        to: emailData.to,
        cc: emailData.cc || null,
        bcc: emailData.bcc || null,
        subject: emailData.subject,
        body: emailData.body,
        status: sendImmediately ? 'sending' : 'draft',
        from_email: emailData.from_email || process.env.DEFAULT_FROM_EMAIL || 'noreply@example.com',
        from_name: emailData.from_name || 'Email App'
      })
      .returning('id');
    
    const id = insertResult[0]?.id || insertResult[0];
    
    if (sendImmediately) {
      const email = await this.getEmailById(id);
      if (!email) {
        throw new Error('Failed to retrieve created email');
      }
      const sendResult = await mailerService.sendEmail(email);
      
      await db('emails')
        .where({ id })
        .update({
          status: sendResult.success ? 'sent' : 'failed',
          sent_at: sendResult.success ? new Date() : null,
          error_message: sendResult.error || null
        });
      
      return await this.getEmailById(id);
    }
    
    return await this.getEmailById(id);
  },

  async sendEmail(id) {
    const email = await this.getEmailById(id);
    if (!email) {
      throw new Error('Email not found');
    }
    
    if (email.status === 'sent') {
      throw new Error('Email has already been sent');
    }
    
    await db('emails')
      .where({ id })
      .update({ status: 'sending' });
    
    const sendResult = await mailerService.sendEmail(email);
    
    await db('emails')
      .where({ id })
      .update({
        status: sendResult.success ? 'sent' : 'failed',
        sent_at: sendResult.success ? new Date() : null,
        error_message: sendResult.error || null
      });
    
    return {
      ...await this.getEmailById(id),
      sendResult
    };
  },

  async deleteEmail(id) {
    return await db('emails')
      .where({ id })
      .del();
  }
};
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const mailerService = {
  async sendEmail(emailData) {
    try {
      const toAddresses = emailData.to.split(',').map(e => e.trim()).filter(e => e);
      const ccAddresses = emailData.cc ? emailData.cc.split(',').map(e => e.trim()).filter(e => e) : [];
      const bccAddresses = emailData.bcc ? emailData.bcc.split(',').map(e => e.trim()).filter(e => e) : [];
      
      if (toAddresses.length === 0) {
        throw new Error('At least one recipient email address is required');
      }
      
      const allEmails = [...toAddresses, ...ccAddresses, ...bccAddresses];
      const invalidEmails = allEmails.filter(email => !this.validateEmail(email));
      
      if (invalidEmails.length > 0) {
        throw new Error(`Invalid email addresses: ${invalidEmails.join(', ')}`);
      }

      const result = await resend.emails.send({
        from: emailData.from_email || process.env.DEFAULT_FROM_EMAIL || 'onboarding@resend.dev',
        to: toAddresses,
        cc: ccAddresses.length > 0 ? ccAddresses : undefined,
        bcc: bccAddresses.length > 0 ? bccAddresses : undefined,
        subject: emailData.subject || '(No Subject)',
        text: emailData.body || '',
        html: emailData.body ? emailData.body.replace(/\n/g, '<br>') : ''
      });
      
      return {
        success: true,
        id: result.data?.id,
        messageId: result.data?.id,
        error: null
      };
    } catch (error) {
      if (error.message?.includes('API key')) {
        return {
          success: false,
          error: 'Invalid or missing Resend API key. Please set RESEND_API_KEY environment variable.',
          devMessage: 'Get your API key from https://resend.com/api-keys'
        };
      }
      
      return {
        success: false,
        error: error.message || 'Failed to send email'
      };
    }
  },
  
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  validateEmailList(emailList) {
    if (!emailList) return { valid: true, emails: [] };
    
    const emails = emailList.split(',').map(e => e.trim()).filter(e => e);
    const invalid = emails.filter(email => !this.validateEmail(email));
    
    return {
      valid: invalid.length === 0,
      emails: emails,
      invalidEmails: invalid
    };
  }
};
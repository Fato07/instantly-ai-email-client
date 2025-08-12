import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

export const openaiService = {
  isConfigured() {
    return !!openai && !!process.env.OPENAI_API_KEY;
  },

  async classifyEmailIntent(prompt) {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an email intent classifier. Classify the user's email request into one of these categories:
            - sales: For sales pitches, product offers, business proposals
            - follow-up: For follow-up emails, checking in, reminders
            - general: For all other types of emails
            
            Respond with only the category name (sales, follow-up, or general).`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 10,
      });

      const classification = completion.choices[0].message.content.trim().toLowerCase();
      return ['sales', 'follow-up', 'general'].includes(classification) ? classification : 'general';
    } catch (error) {
      console.error('OpenAI classification error:', error);
      throw error;
    }
  },

  async generateEmail(prompt, assistantType, recipientContext = '') {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompts = {
      sales: `You are a professional sales email writer. Create concise, compelling sales emails that:
      - Are under 40 words total (excluding greeting and signature)
      - Have sentences of 7-10 words maximum
      - Focus on value to the recipient
      - Include a clear call to action
      - Sound natural and conversational`,
      
      'follow-up': `You are a professional follow-up email writer. Create polite, friendly follow-up emails that:
      - Reference previous conversation or context
      - Are brief and to the point
      - Show genuine interest without being pushy
      - Include a specific next step or question`,
      
      general: `You are a professional email writer. Create clear, professional emails that:
      - Are concise and well-structured
      - Have a clear purpose
      - Use appropriate tone for business communication
      - Include relevant details without being verbose`
    };

    try {
      const systemPrompt = systemPrompts[assistantType] || systemPrompts.general;
      
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `${systemPrompt}
            
            Generate an email with these parts:
            1. A clear, specific subject line
            2. Email body with appropriate greeting, content, and signature
            
            Format your response as JSON with 'subject' and 'body' fields.`
          },
          {
            role: "user",
            content: `Write an email about: ${prompt}${recipientContext ? `\nRecipient context: ${recipientContext}` : ''}`
          }
        ],
        temperature: 0.7,
        max_tokens: 300,
      });

      const response = completion.choices[0].message.content;
      
      try {
        const parsed = JSON.parse(response);
        return {
          subject: parsed.subject || 'No Subject',
          body: parsed.body || ''
        };
      } catch (parseError) {
        // Fallback: try to extract subject and body from text
        const lines = response.split('\n').filter(line => line.trim());
        const subjectLine = lines.find(line => line.toLowerCase().includes('subject:'));
        const subject = subjectLine ? subjectLine.replace(/subject:/i, '').trim() : 'Email Request';
        
        const bodyStart = lines.findIndex(line => line.toLowerCase().includes('body:'));
        const body = bodyStart >= 0 
          ? lines.slice(bodyStart + 1).join('\n').trim()
          : lines.filter(line => !line.toLowerCase().includes('subject:')).join('\n').trim();
        
        return { subject, body };
      }
    } catch (error) {
      console.error('OpenAI generation error:', error);
      throw error;
    }
  },

  async *streamEmail(prompt, assistantType, recipientContext = '') {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompts = {
      sales: `You are a professional sales email writer. Create concise, compelling sales emails that are under 40 words total.`,
      'follow-up': `You are a professional follow-up email writer. Create polite, friendly follow-up emails.`,
      general: `You are a professional email writer. Create clear, professional emails.`
    };

    try {
      const systemPrompt = systemPrompts[assistantType] || systemPrompts.general;
      
      const stream = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `${systemPrompt}
            
            First, write "SUBJECT: " followed by the subject line.
            Then write "BODY: " followed by the email body.`
          },
          {
            role: "user",
            content: `Write an email about: ${prompt}${recipientContext ? `\nRecipient context: ${recipientContext}` : ''}`
          }
        ],
        temperature: 0.7,
        max_tokens: 300,
        stream: true,
      });

      let buffer = '';
      let inSubject = false;
      let inBody = false;
      let subject = '';
      let body = '';

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        buffer += content;

        if (buffer.includes('SUBJECT:') && !inSubject) {
          inSubject = true;
          buffer = buffer.split('SUBJECT:')[1] || '';
        }

        if (buffer.includes('BODY:') && !inBody) {
          inBody = true;
          subject = buffer.split('BODY:')[0].trim();
          buffer = buffer.split('BODY:')[1] || '';
          yield { type: 'subject', content: subject };
        }

        if (inBody && content) {
          body += content;
          yield { type: 'body-chunk', content: content };
        }
      }

      if (!inBody && buffer) {
        // If we never found BODY:, treat entire content as body
        yield { type: 'subject', content: 'Email Request' };
        yield { type: 'body', content: buffer.trim() };
      } else if (inBody) {
        yield { type: 'body-complete', content: body.trim() };
      }

      yield { type: 'complete' };
    } catch (error) {
      console.error('OpenAI streaming error:', error);
      throw error;
    }
  }
};
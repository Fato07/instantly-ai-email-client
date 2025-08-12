import { openaiService } from './openaiService.js';

export const aiService = {
  async classifyIntent(prompt) {
    if (openaiService.isConfigured()) {
      try {
        return await openaiService.classifyEmailIntent(prompt);
      } catch (error) {
        console.error('OpenAI classification failed, using fallback:', error);
      }
    }
    
    // Fallback to template-based classification
    const lowerPrompt = prompt.toLowerCase();
    
    if (
      lowerPrompt.includes('sales') ||
      lowerPrompt.includes('pitch') ||
      lowerPrompt.includes('product') ||
      lowerPrompt.includes('offer') ||
      lowerPrompt.includes('proposal') ||
      lowerPrompt.includes('deal')
    ) {
      return 'sales';
    }
    
    if (
      lowerPrompt.includes('follow up') ||
      lowerPrompt.includes('follow-up') ||
      lowerPrompt.includes('checking in') ||
      lowerPrompt.includes('reminder') ||
      lowerPrompt.includes('touching base') ||
      lowerPrompt.includes('circling back')
    ) {
      return 'follow-up';
    }
    
    return 'general';
  },

  async generateEmail(prompt, assistantType, recipientContext = '') {
    if (openaiService.isConfigured()) {
      try {
        return await openaiService.generateEmail(prompt, assistantType, recipientContext);
      } catch (error) {
        console.error('OpenAI generation failed, using fallback:', error);
      }
    }
    
    // Fallback to template-based generation
    const templates = {
      sales: {
        subjects: [
          'Quick question about {{topic}}',
          'Helping {{company}} with {{topic}}',
          '{{topic}} - quick chat?',
          'Re: {{topic}} solution'
        ],
        bodies: [
          'Hi {{name}},\n\nNoticed {{company}} might benefit from {{topic}}. We help similar companies save time.\n\nWorth a quick chat?\n\nBest,\n{{sender}}',
          'Hey {{name}},\n\nSaw {{company}} is growing. Our {{topic}} solution helps teams like yours scale faster.\n\nFree to connect this week?\n\n{{sender}}',
          'Hi {{name}},\n\nQuick note - we specialize in {{topic}} for companies like {{company}}.\n\n15-min call to explore?\n\nThanks,\n{{sender}}'
        ]
      },
      'follow-up': {
        subjects: [
          'Following up on {{topic}}',
          'Re: {{topic}} - checking in',
          'Quick follow-up: {{topic}}',
          'Circling back on {{topic}}'
        ],
        bodies: [
          'Hi {{name}},\n\nHope you\'re doing well! Just wanted to follow up on our conversation about {{topic}}.\n\nAny thoughts or questions?\n\nBest regards,\n{{sender}}',
          'Hey {{name}},\n\nJust checking in on {{topic}} we discussed. Happy to answer any questions you might have.\n\nLet me know if you need anything!\n\n{{sender}}',
          'Hi {{name}},\n\nWanted to circle back on {{topic}}. Is this still a priority for you?\n\nHappy to help if needed.\n\nBest,\n{{sender}}'
        ]
      },
      general: {
        subjects: [
          'Regarding {{topic}}',
          '{{topic}} - Update',
          'About {{topic}}',
          '{{topic}}'
        ],
        bodies: [
          'Hi {{name}},\n\nI wanted to reach out regarding {{topic}}.\n\n{{details}}\n\nPlease let me know if you have any questions.\n\nBest regards,\n{{sender}}',
          'Hello {{name}},\n\nI hope this email finds you well.\n\n{{details}}\n\nLooking forward to hearing from you.\n\nBest,\n{{sender}}'
        ]
      }
    };

    const topic = this.extractTopic(prompt);
    
    const templateSet = templates[assistantType] || templates.general;
    const subject = templateSet.subjects[Math.floor(Math.random() * templateSet.subjects.length)];
    const body = templateSet.bodies[Math.floor(Math.random() * templateSet.bodies.length)];
    
    const replacements = {
      topic: topic,
      name: 'there',
      company: 'your company',
      details: prompt,
      sender: 'Your Name'
    };
    
    let finalSubject = subject;
    let finalBody = body;
    
    Object.keys(replacements).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      finalSubject = finalSubject.replace(regex, replacements[key]);
      finalBody = finalBody.replace(regex, replacements[key]);
    });
    
    return {
      subject: finalSubject,
      body: finalBody
    };
  },

  extractTopic(prompt) {
    const words = prompt.split(' ');
    if (words.length <= 3) return prompt;
    
    if (prompt.toLowerCase().includes('meeting')) return 'meeting request';
    if (prompt.toLowerCase().includes('proposal')) return 'business proposal';
    if (prompt.toLowerCase().includes('update')) return 'project update';
    if (prompt.toLowerCase().includes('introduction')) return 'introduction';
    
    return words.slice(0, 3).join(' ');
  }
};
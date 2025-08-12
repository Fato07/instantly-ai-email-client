export const aiService = {
  // Classify the intent of the user's email request
  classifyIntent(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    
    // Check for sales-related keywords
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
    
    // Check for follow-up related keywords
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
    
    // Default to general if no specific intent detected
    return 'general';
  },

  // Generate email content based on the assistant type
  async generateEmail(prompt, assistantType, recipientContext = '') {
    // In a real implementation, this would call an AI API (OpenAI, Claude, etc.)
    // For this demo, we'll create template-based responses
    
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

    // Extract topic from prompt
    const topic = this.extractTopic(prompt);
    
    // Select random template
    const templateSet = templates[assistantType] || templates.general;
    const subject = templateSet.subjects[Math.floor(Math.random() * templateSet.subjects.length)];
    const body = templateSet.bodies[Math.floor(Math.random() * templateSet.bodies.length)];
    
    // Replace placeholders
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
    // Simple topic extraction - in production, use NLP
    const words = prompt.split(' ');
    if (words.length <= 3) return prompt;
    
    // Try to find key phrases
    if (prompt.toLowerCase().includes('meeting')) return 'meeting request';
    if (prompt.toLowerCase().includes('proposal')) return 'business proposal';
    if (prompt.toLowerCase().includes('update')) return 'project update';
    if (prompt.toLowerCase().includes('introduction')) return 'introduction';
    
    // Return first few meaningful words
    return words.slice(0, 3).join(' ');
  }
};
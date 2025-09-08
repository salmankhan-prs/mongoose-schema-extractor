module.exports = {
  bootstrap: async () => {
    const mongoose = require('mongoose');
    
    // Load your models here
    // require('./src/models/User');
    // require('./src/models/Post');
    
    // For TypeScript models, uncomment:
    // require('ts-node/register');
    // require('./src/models/user.model.ts');
    
    return mongoose;
  },

  output: {
    path: './schemas',
    formats: ['llm-compact', 'json'],
    fileName: 'schema',
  },

  options: {
    include: ['defaults', 'validators', 'timestamps', 'virtuals', 'indexes'],
    exclude: [],
    depth: 10,
  }
};



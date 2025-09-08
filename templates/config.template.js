module.exports = {
  bootstrap: async () => {
    const mongoose = require('mongoose');
    
    // Load your models here
    // require('./src/models/User');
    // require('./src/models/Post');
    
    // For TypeScript models with path aliases (@/*, etc.):
    // Note: ts-node and tsconfig-paths are auto-detected and registered
    // Just require your TypeScript model files directly:
    // require('./src/models/user.model.ts');
    // require('./src/models/post.model.ts');
    
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



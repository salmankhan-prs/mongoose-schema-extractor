module.exports = {
  bootstrap: async () => {
    const mongoose = require('mongoose');
    
    // Load your models here
    // For JavaScript models:
    // require('./src/models/User');
    // require('./src/models/Post');
    
    // For TypeScript models:
    // Note: ts-node and tsconfig-paths are auto-detected and registered if installed.
    // If not installed, you need to install them manually:
    //   npm install --save-dev ts-node tsconfig-paths
    //   # or
    //   yarn add --dev ts-node tsconfig-paths
    //
    // Then you can require TypeScript files directly (including with path aliases):
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



#!/usr/bin/env node
/**
 * Compact Code Index Generator for Claude Code
 * Generates optimized codebase index within 40k token limit
 * 
 * Usage: node code_index_generator.js [project-path]
 */

const fs = require('fs');
const path = require('path');

// Babel parser for JavaScript/TypeScript
let parser, traverse;
try {
  parser = require('@babel/parser');
  traverse = require('@babel/traverse').default;
} catch (e) {
  console.error('Please install Babel dependencies: npm install @babel/parser @babel/traverse');
  process.exit(1);
}

class CompactCodeIndexGenerator {
  constructor(projectPath = '.') {
    this.projectPath = path.resolve(projectPath);
    this.packageJson = this.loadPackageJson();
    this.index = {
      meta: {
        generated: new Date().toISOString(),
        framework: this.detectFramework()
      },
      structure: {},
      modules: {},
      exports: {},
      patterns: {}
    };
    this.maxTokens = 35000; // Leave buffer for Claude Code context
    this.currentTokens = 0;
  }

  loadPackageJson() {
    try {
      return JSON.parse(fs.readFileSync(path.join(this.projectPath, 'package.json'), 'utf8'));
    } catch (e) {
      return { dependencies: {}, devDependencies: {} };
    }
  }

  detectFramework() {
    const deps = { ...this.packageJson.dependencies, ...this.packageJson.devDependencies };
    if (deps.next) return `Next.js ${deps.next}`;
    if (deps.react) return `React ${deps.react}`;
    return 'JavaScript';
  }

  estimateTokens(obj) {
    return JSON.stringify(obj).length / 3; // Rough token estimation
  }

  async generate() {
    console.log('🚀 Generating compact code index for Claude Code...');
    
    // Priority order for analysis
    this.analyzeProject();
    await this.analyzeKeyFiles();
    this.detectPatterns();
    
    this.saveIndex();
    console.log(`✅ Compact index generated! (~${this.currentTokens} tokens)`);
    return this.index;
  }

  analyzeProject() {
    console.log('📁 Analyzing project structure...');
    
    const criticalDirs = [
      'app', 'src/app', 'pages', 'src/pages',
      'components', 'src/components',
      'lib', 'src/lib', 'utils', 'src/utils',
      'hooks', 'src/hooks'
    ];

    criticalDirs.forEach(dir => {
      const fullPath = path.join(this.projectPath, dir);
      if (fs.existsSync(fullPath)) {
        const info = this.analyzeDirCompact(fullPath);
        if (info.files > 0) {
          this.index.structure[dir] = info;
        }
      }
    });
  }

  analyzeDirCompact(dirPath) {
    const files = this.getRelevantFiles(dirPath);
    const types = {};
    
    files.forEach(file => {
      const ext = path.extname(file);
      types[ext] = (types[ext] || 0) + 1;
    });

    return {
      files: files.length,
      types,
      purpose: this.inferPurpose(path.basename(dirPath))
    };
  }

  getRelevantFiles(dir) {
    const files = [];
    try {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const item of items) {
        if (item.name.startsWith('.') || item.name === 'node_modules') continue;
        
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
          files.push(...this.getRelevantFiles(fullPath));
        } else if (this.isRelevantFile(item.name)) {
          files.push(fullPath);
        }
      }
    } catch (e) {
      // Skip inaccessible directories
    }
    return files;
  }

  isRelevantFile(filename) {
    return /\.(js|jsx|ts|tsx)$/.test(filename);
  }

  async analyzeKeyFiles() {
    console.log('🔍 Analyzing key source files...');
    
    const sourceFiles = this.getRelevantFiles(this.projectPath)
      .filter(file => 
        !file.includes('node_modules') && 
        !file.includes('.next') &&
        !file.includes('dist/')
      )
      .slice(0, 50); // Limit to most important files

    let analyzed = 0;
    for (const file of sourceFiles) {
      if (this.currentTokens > this.maxTokens * 0.8) break; // Stop before hitting limit
      
      try {
        const analysis = await this.analyzeFileCompact(file);
        if (analysis) {
          const relativePath = path.relative(this.projectPath, file);
          this.index.modules[relativePath] = analysis;
          analyzed++;
        }
      } catch (error) {
        // Skip problematic files
      }
    }
    
    console.log(`📊 Analyzed ${analyzed} key files`);
  }

  async analyzeFileCompact(filePath) {
    const code = fs.readFileSync(filePath, 'utf8');
    if (code.length > 10000) return null; // Skip very large files
    
    const relativePath = path.relative(this.projectPath, filePath);
    
    // Parse with appropriate plugins
    const plugins = ['jsx'];
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      plugins.push('typescript');
    }

    let ast;
    try {
      ast = parser.parse(code, {
        sourceType: 'module',
        plugins,
        errorRecovery: true
      });
    } catch (error) {
      return null;
    }

    const analysis = {
      type: this.classifyFile(relativePath),
      exports: [],
      imports: [],
      features: []
    };

    traverse(ast, {
      ImportDeclaration: (path) => {
        const source = path.node.source.value;
        if (!source.startsWith('.') && !source.startsWith('/')) {
          analysis.imports.push(source); // Only external imports
        }
      },

      ExportDefaultDeclaration: (path) => {
        const name = this.getExportName(path.node);
        if (name) analysis.exports.push(name);
      },

      ExportNamedDeclaration: (path) => {
        if (path.node.specifiers) {
          path.node.specifiers.forEach(spec => {
            analysis.exports.push(spec.exported.name);
          });
        }
      },

      FunctionDeclaration: (path) => {
        const name = path.node.id?.name;
        if (name && this.isExported(path)) {
          this.index.exports[`${relativePath}:${name}`] = {
            name,
            type: this.classifyFunction(name),
            params: path.node.params.length
          };
        }
      },

      // Detect Next.js features
      CallExpression: (path) => {
        const callee = path.node.callee;
        if (callee.name === 'getServerSideProps') analysis.features.push('SSR');
        if (callee.name === 'getStaticProps') analysis.features.push('SSG');
        if (callee.name === 'getStaticPaths') analysis.features.push('ISR');
      }
    });

    // Keep only unique imports and limit count
    analysis.imports = [...new Set(analysis.imports)].slice(0, 10);
    analysis.exports = analysis.exports.slice(0, 10);

    // Calculate rough size
    const size = this.estimateTokens(analysis);
    this.currentTokens += size;

    return analysis;
  }

  getExportName(declaration) {
    if (declaration.declaration) {
      return declaration.declaration.name || 
             declaration.declaration.id?.name || 
             'default';
    }
    return 'default';
  }

  isExported(path) {
    let current = path;
    while (current) {
      if (current.isExportDefaultDeclaration() || current.isExportNamedDeclaration()) {
        return true;
      }
      current = current.parentPath;
    }
    return false;
  }

  classifyFile(filePath) {
    if (filePath.includes('/api/')) return 'api';
    if (filePath.includes('/pages/')) return 'page';
    if (filePath.includes('/app/') && filePath.includes('/page.')) return 'page';
    if (filePath.includes('/app/') && filePath.includes('/layout.')) return 'layout';
    if (filePath.includes('/components/')) return 'component';
    if (filePath.includes('/hooks/')) return 'hook';
    if (filePath.includes('/lib/') || filePath.includes('/utils/')) return 'util';
    return 'source';
  }

  classifyFunction(name) {
    if (!name) return 'function';
    if (name[0] === name[0].toUpperCase()) return 'component';
    if (name.startsWith('use') && name[3] === name[3].toUpperCase()) return 'hook';
    if (['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(name)) return 'handler';
    return 'function';
  }

  detectPatterns() {
    console.log('🏗️ Detecting architectural patterns...');
    
    this.index.patterns = {
      router: this.detectRouter(),
      typescript: fs.existsSync(path.join(this.projectPath, 'tsconfig.json')),
      tailwind: this.hasPackage('tailwindcss'),
      testing: this.hasPackage('jest') || this.hasPackage('@testing-library/react'),
      stateManagement: this.detectStateManagement(),
      styling: this.detectStyling(),
      dataFetching: this.detectDataFetching()
    };
  }

  detectRouter() {
    if (fs.existsSync(path.join(this.projectPath, 'app'))) return 'app';
    if (fs.existsSync(path.join(this.projectPath, 'src/app'))) return 'app';
    if (fs.existsSync(path.join(this.projectPath, 'pages'))) return 'pages';
    if (fs.existsSync(path.join(this.projectPath, 'src/pages'))) return 'pages';
    return 'unknown';
  }

  detectStateManagement() {
    if (this.hasPackage('zustand')) return 'zustand';
    if (this.hasPackage('@reduxjs/toolkit')) return 'redux-toolkit';
    if (this.hasPackage('redux')) return 'redux';
    if (this.hasPackage('jotai')) return 'jotai';
    return 'context';
  }

  detectStyling() {
    if (this.hasPackage('tailwindcss')) return 'tailwind';
    if (this.hasPackage('styled-components')) return 'styled-components';
    if (this.hasPackage('@emotion/react')) return 'emotion';
    if (this.hasPackage('@mui/material')) return 'mui';
    return 'css';
  }

  detectDataFetching() {
    if (this.hasPackage('@tanstack/react-query')) return 'tanstack-query';
    if (this.hasPackage('react-query')) return 'react-query';
    if (this.hasPackage('swr')) return 'swr';
    if (this.hasPackage('apollo-client')) return 'apollo';
    return 'fetch';
  }

  hasPackage(packageName) {
    return !!(this.packageJson.dependencies?.[packageName] || 
              this.packageJson.devDependencies?.[packageName]);
  }

  inferPurpose(dirName) {
    const purposes = {
      'app': 'App Router pages and layouts',
      'pages': 'Pages Router routes',
      'components': 'Reusable UI components',
      'lib': 'Utility libraries',
      'utils': 'Helper functions',
      'hooks': 'Custom React hooks',
      'api': 'API route handlers'
    };
    return purposes[dirName] || 'Source files';
  }

  saveIndex() {
    // Save compact JSON version
    const jsonPath = path.join(this.projectPath, 'code-index.json');
    fs.writeFileSync(jsonPath, JSON.stringify(this.index, null, 2));
    console.log(`💾 Compact index saved to ${jsonPath}`);
    
    // Save human-readable markdown version
    const mdPath = path.join(this.projectPath, 'code-index.md');
    this.saveMarkdownIndex(mdPath);
  }

  saveMarkdownIndex(outputPath) {
    let content = `# Codebase Index\n\n`;
    
    content += `**Generated:** ${this.index.meta.generated}\n`;
    content += `**Framework:** ${this.index.meta.framework}\n`;
    content += `**Size:** ~${this.currentTokens} tokens\n\n`;
    
    // Project Structure
    if (Object.keys(this.index.structure).length > 0) {
      content += `## Project Structure\n\n`;
      Object.entries(this.index.structure).forEach(([dir, info]) => {
        content += `- **${dir}**: ${info.purpose} (${info.files} files)\n`;
      });
      content += '\n';
    }

    // Architectural Patterns
    content += `## Architecture\n\n`;
    Object.entries(this.index.patterns).forEach(([pattern, value]) => {
      const status = typeof value === 'boolean' ? (value ? '✅' : '❌') : value;
      content += `- **${pattern}**: ${status}\n`;
    });
    content += '\n';

    // Key Modules
    const moduleCount = Object.keys(this.index.modules).length;
    if (moduleCount > 0) {
      content += `## Key Modules (${moduleCount})\n\n`;
      Object.entries(this.index.modules).forEach(([file, info]) => {
        if (info.exports.length > 0) {
          content += `- **${file}**: ${info.type} - exports ${info.exports.join(', ')}\n`;
        }
      });
      content += '\n';
    }

    // Exported Functions/Components
    const exportCount = Object.keys(this.index.exports).length;
    if (exportCount > 0) {
      content += `## Exports (${exportCount})\n\n`;
      Object.entries(this.index.exports).forEach(([key, info]) => {
        content += `- **${info.name}**: ${info.type} (${info.params} params)\n`;
      });
    }

    fs.writeFileSync(outputPath, content);
    console.log(`📄 Readable index saved to ${outputPath}`);
  }
}

// CLI interface
if (require.main === module) {
  const projectPath = process.argv[2] || '.';
  
  console.log('🎯 Compact Code Index Generator for Claude Code');
  console.log(`📍 Project: ${path.resolve(projectPath)}\n`);
  
  const generator = new CompactCodeIndexGenerator(projectPath);
  generator.generate().catch(console.error);
}

module.exports = CompactCodeIndexGenerator;
#!/usr/bin/env node
/**
 * Next.js Codebase Index Generator
 * Generates hierarchical code index for LLM rules
 * 
 * Usage: node generate-index.js [project-path]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Babel parser for JavaScript/TypeScript
let parser, traverse;
try {
  parser = require('@babel/parser');
  traverse = require('@babel/traverse').default;
} catch (e) {
  console.error('Please install Babel dependencies: npm install @babel/parser @babel/traverse');
  process.exit(1);
}

class NextJSIndexGenerator {
  constructor(projectPath = '.') {
    this.projectPath = path.resolve(projectPath);
    this.packageJson = this.loadPackageJson();
    this.index = {
      metadata: {
        projectPath: this.projectPath,
        generatedAt: new Date().toISOString(),
        nextjsVersion: this.detectNextJSVersion()
      },
      level1: {}, // Project structure
      level2: {}, // Module summaries
      level3: {}, // Function/component signatures
      level4: {}, // Implementation details (populated on demand)
      architectural: {
        dependencies: {},
        patterns: {},
        routes: {}
      }
    };
  }

  loadPackageJson() {
    try {
      return JSON.parse(fs.readFileSync(path.join(this.projectPath, 'package.json'), 'utf8'));
    } catch (e) {
      return { dependencies: {}, devDependencies: {} };
    }
  }

  detectNextJSVersion() {
    return this.packageJson.dependencies?.next || this.packageJson.devDependencies?.next || 'unknown';
  }

  async generate() {
    console.log('🚀 Generating Next.js codebase index...');
    
    // Level 1: Project structure
    this.generateLevel1();
    
    // Level 2 & 3: File analysis
    await this.analyzeSourceFiles();
    
    // Architectural patterns
    this.analyzeArchitecturalPatterns();
    
    // Routes analysis
    this.analyzeRoutes();
    
    // Save index
    this.saveIndex();
    
    console.log('✅ Index generated successfully!');
    return this.index;
  }

  generateLevel1() {
    console.log('📁 Analyzing project structure (recursive in critical dirs)...');
    
    const nextjsDirectories = [
      'pages', 'app', 'src/pages', 'src/app', // Next.js routing
      'components', 'src/components', // Components
      'lib', 'src/lib', 'utils', 'src/utils', // Utilities
      'hooks', 'src/hooks', // Custom hooks
      'styles', 'src/styles', // Styles
      'public', // Static files
      'api', 'src/api', 'pages/api', 'src/pages/api', 'app/api', 'src/app/api' // API routes
    ];

    const visited = new Set();
    
    nextjsDirectories.forEach(baseDir => {
      const fullBasePath = path.join(this.projectPath, baseDir);
      if (fs.existsSync(fullBasePath)) {
        // Recursively find all subdirectories (including baseDir itself)
        const allDirs = this.getAllDirsRecursively(fullBasePath);
        allDirs.forEach(dirPath => {
          const relPath = path.relative(this.projectPath, dirPath);
          if (visited.has(relPath)) return;
          visited.add(relPath);
          const stats = this.analyzeDirStats(dirPath);
          const folderName = path.basename(dirPath);
          this.index.level1[relPath] = {
            purpose: this.inferFolderPurpose(folderName),
            ...stats,
            type: this.classifyDirectoryType(folderName)
          };
        });
      }
    });
  }

  getAllDirsRecursively(dir) {
    // Returns [dir, ...all subdirs], excluding node_modules and hidden folders
    let dirs = [dir];
    try {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        try {
          const stat = fs.statSync(fullPath);
          if (
            stat.isDirectory() &&
            !item.startsWith('.') &&
            item !== 'node_modules'
          ) {
            dirs = dirs.concat(this.getAllDirsRecursively(fullPath));
          }
        } catch (e) {
          // Skip dirs that can't be accessed
        }
      });
    } catch (e) {
      // Skip dirs that can't be read
    }
    return dirs;
  }

  analyzeDirStats(dirPath) {
    const files = this.getFilesRecursively(dirPath);
    const extensions = {};
    
    files.forEach(file => {
      const ext = path.extname(file);
      extensions[ext] = (extensions[ext] || 0) + 1;
    });

    return {
      fileCount: files.length,
      extensions,
      lastModified: this.getLastModified(dirPath)
    };
  }

  getFilesRecursively(dir) {
    const files = [];
    try {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        try {
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            files.push(...this.getFilesRecursively(fullPath));
          } else if (stat.isFile() && this.isRelevantFile(item)) {
            files.push(fullPath);
          }
        } catch (e) {
          // Skip files that can't be accessed
        }
      });
    } catch (e) {
      // Skip directories that can't be read
    }
    
    return files;
  }

  isRelevantFile(filename) {
    const relevantExtensions = ['.js', '.jsx', '.ts', '.tsx', '.json', '.css', '.scss', '.module.css'];
    return relevantExtensions.some(ext => filename.endsWith(ext));
  }

  async analyzeSourceFiles() {
    console.log('🔍 Analyzing source files...');
    
    const sourceFiles = this.getFilesRecursively(this.projectPath).filter(file => {
      const ext = path.extname(file);
      return ['.js', '.jsx', '.ts', '.tsx'].includes(ext) && 
             !file.includes('node_modules') &&
             !file.includes('.next');
    });

    for (const file of sourceFiles) {
      try {
        await this.analyzeFile(file);
      } catch (error) {
        console.warn(`⚠️  Skipping ${file}: ${error.message}`);
      }
    }
  }

  async analyzeFile(filePath) {
    const code = fs.readFileSync(filePath, 'utf8');
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
        plugins
      });
    } catch (error) {
      console.warn(`Parse error in ${relativePath}: ${error.message}`);
      return;
    }

    const analysis = {
      imports: [],
      exports: [],
      functions: [],
      components: [],
      hooks: [],
      apiRoutes: [],
      nextjsFeatures: []
    };

    const self = this;
    const nextjsDataFetchingFns = [
      'getServerSideProps',
      'getStaticProps',
      'getStaticPaths'
    ];
    traverse(ast, {
      ImportDeclaration(path) {
        analysis.imports.push({
          source: path.node.source.value,
          specifiers: path.node.specifiers.map(s => ({
            type: s.type,
            name: s.local.name,
            imported: s.imported?.name
          }))
        });
      },

      ExportDefaultDeclaration(path) {
        if (path.node.declaration) {
          const name = path.node.declaration.name || 
                      path.node.declaration.id?.name || 
                      'default';
          analysis.exports.push({ name, type: 'default' });
          // Detect Next.js data fetching as default export (rare, but possible)
          if (nextjsDataFetchingFns.includes(name)) {
            analysis.nextjsFeatures.push(name);
          }
        }
      },

      ExportNamedDeclaration(path) {
        // Detect exported function declarations
        if (path.node.declaration && path.node.declaration.type === 'FunctionDeclaration') {
          const fnName = path.node.declaration.id?.name;
          if (nextjsDataFetchingFns.includes(fnName)) {
            analysis.nextjsFeatures.push(fnName);
          }
        }
        // Detect exported variable declarations
        if (path.node.declaration && path.node.declaration.type === 'VariableDeclaration') {
          path.node.declaration.declarations.forEach(decl => {
            if (nextjsDataFetchingFns.includes(decl.id.name)) {
              analysis.nextjsFeatures.push(decl.id.name);
            }
          });
        }
        // Existing logic for named exports
        if (path.node.specifiers) {
          path.node.specifiers.forEach(spec => {
            analysis.exports.push({
              name: spec.exported.name,
              type: 'named'
            });
            // If the export is a Next.js data fetching function
            if (nextjsDataFetchingFns.includes(spec.exported.name)) {
              analysis.nextjsFeatures.push(spec.exported.name);
            }
          });
        }
      },

      FunctionDeclaration(path) {
        const func = {
          name: path.node.id?.name,
          params: path.node.params.map(p => self.getParamName(p)),
          async: path.node.async,
          isExported: self.isExported(path)
        };
        
        if (self.isReactComponent(func.name)) {
          analysis.components.push(func);
        } else if (self.isCustomHook(func.name)) {
          analysis.hooks.push(func);
        } else if (self.isApiRoute(filePath, func.name)) {
          analysis.apiRoutes.push(func);
        } else {
          analysis.functions.push(func);
        }
      },

      ArrowFunctionExpression(path) {
        const parent = path.parent;
        if (parent.type === 'VariableDeclarator' && parent.id.name) {
          const func = {
            name: parent.id.name,
            params: path.node.params.map(p => self.getParamName(p)),
            async: path.node.async,
            isExported: self.isExported(path)
          };
          
          if (self.isReactComponent(func.name)) {
            analysis.components.push(func);
          } else if (self.isCustomHook(func.name)) {
            analysis.hooks.push(func);
          } else {
            analysis.functions.push(func);
          }
        }
      },

      CallExpression(path) {
        // Detect Next.js specific features
        if (path.node.callee.name === 'getServerSideProps') {
          analysis.nextjsFeatures.push('SSR');
        } else if (path.node.callee.name === 'getStaticProps') {
          analysis.nextjsFeatures.push('SSG');
        } else if (path.node.callee.name === 'getStaticPaths') {
          analysis.nextjsFeatures.push('Dynamic Routes');
        }
      }
    });

    // Level 2: Module summary
    this.index.level2[relativePath] = {
      purpose: this.inferFilePurpose(relativePath, analysis),
      type: this.classifyFileType(relativePath, analysis),
      imports: analysis.imports.map(imp => imp.source),
      exports: analysis.exports.map(exp => exp.name),
      complexity: this.calculateComplexity(analysis),
      nextjsFeatures: analysis.nextjsFeatures,
      lastModified: fs.statSync(filePath).mtime.toISOString()
    };

    // Level 3: Function/component signatures
    [...analysis.functions, ...analysis.components, ...analysis.hooks, ...analysis.apiRoutes].forEach(item => {
      if (item.name) {
        const key = `${relativePath}:${item.name}`;
        this.index.level3[key] = {
          name: item.name,
          signature: `${item.name}(${item.params.join(', ')})${item.async ? ': Promise' : ''}`,
          type: this.classifyFunction(item, analysis),
          file: relativePath,
          exported: item.isExported,
          async: item.async
        };
      }
    });
  }

  getParamName(param) {
    switch (param.type) {
      case 'Identifier':
        return param.name;
      case 'ObjectPattern':
        return `{${param.properties.map(p => p.key?.name || '...').join(', ')}}`;
      case 'ArrayPattern':
        return `[${param.elements.map(e => e?.name || '...').join(', ')}]`;
      case 'RestElement':
        return `...${param.argument.name}`;
      default:
        return 'complex';
    }
  }

  isExported(path) {
    // Check if function is exported
    let current = path;
    while (current) {
      if (current.isExportDefaultDeclaration() || current.isExportNamedDeclaration()) {
        return true;
      }
      current = current.parentPath;
    }
    return false;
  }

  isReactComponent(name) {
    return name && name[0] === name[0].toUpperCase();
  }

  isCustomHook(name) {
    return name && name.startsWith('use') && name[3] === name[3].toUpperCase();
  }

  isApiRoute(filePath, funcName) {
    return filePath.includes('/api/') && ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'default'].includes(funcName);
  }

  classifyFunction(func, analysis) {
    if (analysis.components.includes(func)) return 'component';
    if (analysis.hooks.includes(func)) return 'hook';
    if (analysis.apiRoutes.includes(func)) return 'api-handler';
    return 'function';
  }

  calculateComplexity(analysis) {
    return analysis.functions.length + 
           analysis.components.length + 
           analysis.hooks.length + 
           analysis.apiRoutes.length;
  }

  analyzeArchitecturalPatterns() {
    console.log('🏗️  Analyzing architectural patterns...');
    
    const patterns = {
      'pages-router': this.detectPagesRouter(),
      'app-router': this.detectAppRouter(),
      'src-directory': fs.existsSync(path.join(this.projectPath, 'src')),
      'typescript': this.detectTypeScript(),
      'tailwind': this.detectTailwind(),
      'styled-components': this.hasPackage('styled-components'),
      'emotion': this.hasPackage('@emotion/react') || this.hasPackage('@emotion/styled'),
      'mui': this.hasPackage('@mui/material') || this.hasPackage('@material-ui/core'),
      'prisma': this.hasPackage('prisma') || this.hasPackage('@prisma/client'),
      'trpc': this.hasPackage('@trpc/server') || this.hasPackage('@trpc/client'),
      'next-auth': this.hasPackage('next-auth') || this.hasPackage('@auth/nextjs')
    };

    this.index.architectural.patterns = patterns;
  }

  detectPagesRouter() {
    const pagesDirectories = [
      path.join(this.projectPath, 'pages'),
      path.join(this.projectPath, 'src/pages')
    ];
    
    return pagesDirectories.some(dir => {
      if (!fs.existsSync(dir)) return false;
      
      // Check if it has actual page files (not just _app.js, _document.js)
      const files = this.getFilesRecursively(dir);
      return files.some(file => {
        const basename = path.basename(file, path.extname(file));
        return !basename.startsWith('_') && ['.js', '.jsx', '.ts', '.tsx'].includes(path.extname(file));
      });
    });
  }

  detectAppRouter() {
    const appDirectories = [
      path.join(this.projectPath, 'app'),
      path.join(this.projectPath, 'src/app')
    ];
    
    return appDirectories.some(dir => {
      if (!fs.existsSync(dir)) return false;
      
      // Check for app router specific files
      const files = this.getFilesRecursively(dir);
      return files.some(file => {
        const basename = path.basename(file, path.extname(file));
        return ['page', 'layout', 'loading', 'error', 'not-found', 'template'].includes(basename) &&
               ['.js', '.jsx', '.ts', '.tsx'].includes(path.extname(file));
      });
    });
  }

  detectTypeScript() {
    return fs.existsSync(path.join(this.projectPath, 'tsconfig.json')) ||
           fs.existsSync(path.join(this.projectPath, 'next-env.d.ts')) ||
           this.hasPackage('typescript') ||
           this.hasPackage('@types/node');
  }

  detectTailwind() {
    // Check for config files
    const configFiles = [
      'tailwind.config.js',
      'tailwind.config.ts',
      'tailwind.config.mjs',
      'tailwind.config.cjs'
    ];
    
    const hasConfigFile = configFiles.some(file => 
      fs.existsSync(path.join(this.projectPath, file))
    );
    
    if (hasConfigFile) return true;
    
    // Check package.json
    if (this.hasPackage('tailwindcss')) return true;
    
    // Check for @tailwind directives in CSS files
    const cssFiles = this.getFilesRecursively(this.projectPath).filter(file => 
      ['.css', '.scss', '.sass'].includes(path.extname(file))
    );
    
    for (const cssFile of cssFiles) {
      try {
        const content = fs.readFileSync(cssFile, 'utf8');
        if (content.includes('@tailwind') || content.includes('tailwindcss')) {
          return true;
        }
      } catch (e) {
        // Skip files that can't be read
      }
    }
    
    return false;
  }

  analyzeRoutes() {
    console.log('🛣️  Analyzing routes...');
    
    const routes = {};
    
    // Pages router
    const pagesDir = path.join(this.projectPath, 'pages');
    const srcPagesDir = path.join(this.projectPath, 'src/pages');
    
    if (fs.existsSync(pagesDir)) {
      routes.pages = this.extractRoutes(pagesDir, 'pages');
    } else if (fs.existsSync(srcPagesDir)) {
      routes.pages = this.extractRoutes(srcPagesDir, 'pages');
    }

    // App router
    const appDir = path.join(this.projectPath, 'app');
    const srcAppDir = path.join(this.projectPath, 'src/app');
    
    if (fs.existsSync(appDir)) {
      routes.app = this.extractRoutes(appDir, 'app');
    } else if (fs.existsSync(srcAppDir)) {
      routes.app = this.extractRoutes(srcAppDir, 'app');
    }

    this.index.architectural.routes = routes;
  }

  extractRoutes(dir, type) {
    const routes = [];
    const files = this.getFilesRecursively(dir);
    
    files.forEach(file => {
      const relativePath = path.relative(dir, file);
      const route = this.filePathToRoute(relativePath, type);
      if (route) {
        routes.push({
          path: route,
          file: relativePath,
          type: this.getRouteType(file)
        });
      }
    });
    
    return routes;
  }

  filePathToRoute(filePath, routerType) {
    // Convert file path to Next.js route
    let route = filePath.replace(/\.(js|jsx|ts|tsx)$/, '');
    
    if (routerType === 'pages') {
      if (route === 'index') return '/';
      if (route.endsWith('/index')) route = route.replace('/index', '');
      // Skip special Next.js files
      if (route.startsWith('_') || route.includes('/_')) return null;
    } else if (routerType === 'app') {
      if (route.endsWith('/page')) route = route.replace('/page', '');
      if (route === 'page') return '/';
      // Only include actual page routes for app router
      if (!filePath.includes('/page.') && !filePath.includes('/layout.') && !filePath.includes('/loading.') && !filePath.includes('/error.')) {
        return null;
      }
    }
    
    // Handle dynamic routes
    route = route.replace(/\[([^\]]+)\]/g, ':$1');
    
    return route.startsWith('/') ? route : '/' + route;
  }

  getRouteType(filePath) {
    const basename = path.basename(filePath, path.extname(filePath));
    if (basename === 'layout') return 'layout';
    if (basename === 'loading') return 'loading';
    if (basename === 'error') return 'error';
    if (basename === 'not-found') return 'not-found';
    if (basename === 'page') return 'page';
    if (filePath.includes('/api/')) return 'api';
    return 'page';
  }

  hasPackage(packageName) {
    return !!(this.packageJson.dependencies?.[packageName] || 
              this.packageJson.devDependencies?.[packageName] ||
              this.packageJson.peerDependencies?.[packageName]);
  }

  inferFolderPurpose(folderName) {
    const purposes = {
      'pages': 'Next.js Pages Router - file-based routing',
      'app': 'Next.js App Router - modern routing with layouts',
      'components': 'Reusable React components',
      'lib': 'Library functions and utilities',
      'utils': 'Helper functions and utilities',
      'hooks': 'Custom React hooks',
      'styles': 'CSS and styling files',
      'public': 'Static assets served at root',
      'api': 'API route handlers',
      'src': 'Main source code directory'
    };
    
    return purposes[folderName] || 'Source code directory';
  }

  classifyDirectoryType(dirName) {
    const types = {
      'pages': 'routing',
      'app': 'routing',
      'components': 'ui',
      'lib': 'utility',
      'utils': 'utility',
      'hooks': 'logic',
      'styles': 'styling',
      'public': 'static',
      'api': 'backend'
    };
    
    return types[dirName] || 'source';
  }

  inferFilePurpose(filePath, analysis) {
    const basename = path.basename(filePath, path.extname(filePath));
    
    // Next.js specific files
    if (basename === 'layout') return 'Layout component for route group';
    if (basename === 'page') return 'Page component for route';
    if (basename === 'loading') return 'Loading UI component';
    if (basename === 'error') return 'Error boundary component';
    if (basename === 'not-found') return 'Not found page component';
    
    // API routes
    if (filePath.includes('/api/')) return 'API route handler';
    
    // Based on analysis
    if (analysis.components.length > 0) return `React component (${analysis.components.map(c => c.name).join(', ')})`;
    if (analysis.hooks.length > 0) return `Custom React hook (${analysis.hooks.map(h => h.name).join(', ')})`;
    if (analysis.functions.length > 0) return `Utility functions (${analysis.functions.map(f => f.name).join(', ')})`;
    
    return 'Source file';
  }

  classifyFileType(filePath, analysis) {
    if (filePath.includes('/api/')) return 'api-route';
    if (filePath.includes('/pages/')) return 'page';
    if (filePath.includes('/app/')) return 'app-route';
    if (analysis.components.length > 0) return 'component';
    if (analysis.hooks.length > 0) return 'hook';
    if (filePath.includes('/lib/') || filePath.includes('/utils/')) return 'utility';
    if (filePath.endsWith('.css') || filePath.endsWith('.scss')) return 'styles';
    return 'source';
  }

  getLastModified(dirPath) {
    try {
      const files = this.getFilesRecursively(dirPath);
      if (files.length === 0) return new Date().toISOString();
      
      const mtimes = files.map(file => {
        try {
          return fs.statSync(file).mtime;
        } catch (e) {
          return new Date(0);
        }
      });
      return new Date(Math.max(...mtimes)).toISOString();
    } catch (e) {
      return new Date().toISOString();
    }
  }

  saveIndex() {
    const outputPath = path.join(this.projectPath, 'codebase-index.json');
    // Preserve existing level4 if present
    let previousLevel4 = {};
    if (fs.existsSync(outputPath)) {
      try {
        const prev = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
        if (prev.level4 && typeof prev.level4 === 'object') {
          previousLevel4 = prev.level4;
        }
      } catch (e) {
        // Ignore parse errors, treat as no previous level4
      }
    }
    // Merge previous level4 with new, preferring new keys
    this.index.level4 = { ...previousLevel4, ...this.index.level4 };
    fs.writeFileSync(outputPath, JSON.stringify(this.index, null, 2));
    console.log(`💾 Index saved to ${outputPath}`);
    
    // Also save a formatted version for LLM consumption
    const formattedPath = path.join(this.projectPath, 'codebase-index-formatted.md');
    this.saveFormattedIndex(formattedPath);
  }

  saveFormattedIndex(outputPath) {
    let content = '# Codebase Index\n\n';
    
    content += `**Generated:** ${this.index.metadata.generatedAt}\n`;
    content += `**Next.js Version:** ${this.index.metadata.nextjsVersion}\n\n`;
    
    content += '## Level 1 - Project Structure\n';
    Object.entries(this.index.level1).forEach(([dir, info]) => {
      content += `- **${dir}**: ${info.purpose} (${info.fileCount} files)\n`;
    });
    
    content += '\n## Architectural Patterns\n';
    Object.entries(this.index.architectural.patterns).forEach(([pattern, enabled]) => {
      const status = enabled ? '✅' : '❌';
      content += `- **${pattern}**: ${status}\n`;
    });
    
    if (Object.keys(this.index.architectural.routes).length > 0) {
      content += '\n## Routes\n';
      Object.entries(this.index.architectural.routes).forEach(([routerType, routes]) => {
        content += `\n### ${routerType.toUpperCase()} Router\n`;
        routes.forEach(route => {
          content += `- **${route.path}**: ${route.file} (${route.type})\n`;
        });
      });
    }
    
    content += '\n## Level 2 - Module Summaries\n';
    Object.entries(this.index.level2).forEach(([file, info]) => {
      content += `- **${file}**: ${info.purpose}\n`;
      if (info.exports.length > 0) {
        content += `  - Exports: ${info.exports.join(', ')}\n`;
      }
      if (info.nextjsFeatures.length > 0) {
        content += `  - Next.js Features: ${info.nextjsFeatures.join(', ')}\n`;
      }
    });
    
    content += '\n## Level 3 - Function Signatures\n';
    Object.entries(this.index.level3).forEach(([key, info]) => {
      content += `- **${info.name}**: \`${info.signature}\` (${info.type}) ${info.exported ? '[EXPORTED]' : ''}\n`;
    });
    
    fs.writeFileSync(outputPath, content);
    console.log(`📄 Formatted index saved to ${outputPath}`);
  }
}

// CLI interface
if (require.main === module) {
  const projectPath = process.argv[2] || '.';
  
  console.log('🎯 Next.js Codebase Index Generator');
  console.log(`📍 Project: ${path.resolve(projectPath)}\n`);
  
  const generator = new NextJSIndexGenerator(projectPath);
  generator.generate().catch(console.error);
}

module.exports = NextJSIndexGenerator;
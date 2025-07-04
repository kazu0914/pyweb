/**
 * Python Web Runner - Main JavaScript Module
 * A web-based Python code execution environment using Pyodide
 */

class PythonWebRunner {
  constructor() {
    this.pyodide = null;
    this.isInitialized = false;
    this.initializeAsync();
  }

  /**
   * Initialize Pyodide and set up Python environment
   */
  async initializeAsync() {
    try {
      const output = document.getElementById('output');
      this.updateOutput('実行環境を初期化中...', 'loading');
      
      this.pyodide = await loadPyodide();
      
      // Setup Python environment with output capture and file operations
      await this.setupPythonEnvironment();
      
      this.updateOutput('✅ Pythonの実行環境の初期化が完了しました！Pythonコードを実行できます。', 'success');
      document.getElementById('run-button').disabled = false;
      this.isInitialized = true;
      
    } catch (error) {
      console.error('Initialization error:', error);
      this.updateOutput(`❌ 初期化に失敗しました: ${error.message}`, 'error');
    }
  }

  /**
   * Setup Python environment with necessary functions
   */
  async setupPythonEnvironment() {
    const pythonCode = `
import sys
from io import StringIO, BytesIO

class OutputCapture:
    def __init__(self):
        self.output = StringIO()
        
    def write(self, text):
        self.output.write(text)
        
    def flush(self):
        pass
        
    def get_output(self):
        return self.output.getvalue()
        
    def clear(self):
        self.output = StringIO()

output_capture = OutputCapture()

# File download functionality
created_files = {}

def save_file(filename, content):
    """Save file and make it downloadable"""
    if isinstance(content, str):
        content = content.encode('utf-8')
    created_files[filename] = content
    print(f"ファイル '{filename}' を作成しました。ダウンロード可能です。")
    return filename

def create_simple_document(filename, title, paragraphs):
    """Create a simple HTML document"""
    html_parts = ['<!DOCTYPE html><html><head><meta charset="UTF-8">']
    html_parts.append(f'<title>{title}</title>')
    html_parts.append('<style>body{font-family:Arial;margin:40px;}h1{color:#333;}</style>')
    html_parts.append('</head><body>')
    html_parts.append(f'<h1>{title}</h1>')
    
    for p in paragraphs:
        html_parts.append(f'<p>{p}</p>')
    
    html_parts.append('</body></html>')
    
    html_content = ''.join(html_parts)
    created_files[filename] = html_content.encode('utf-8')
    print(f"HTML文書 '{filename}' を作成しました。Wordで開けます。")
    return filename
`;
    
    await this.pyodide.runPython(pythonCode);
  }

  /**
   * Package management configuration
   */
  getPackageConfig() {
    return {
      pyodidePackages: {
        'numpy': 'numpy',
        'np': 'numpy',
        'pandas': 'pandas',
        'pd': 'pandas',
        'matplotlib': 'matplotlib',
        'plt': 'matplotlib',
        'scipy': 'scipy',
        'sklearn': 'scikit-learn',
        'requests': 'requests',
        'sympy': 'sympy',
        'networkx': 'networkx',
        'pillow': 'pillow',
        'PIL': 'pillow',
        'bs4': 'beautifulsoup4',
        'lxml': 'lxml'
      },
      micropipPackages: {
        'docx': 'python-docx',
        'Document': 'python-docx'
      }
    };
  }

  /**
   * Auto-detect and install required packages
   */
  async installRequiredPackages(code) {
    const { pyodidePackages, micropipPackages } = this.getPackageConfig();
    const pyodideToInstall = new Set();
    const micropipToInstall = new Set();
    
    // Parse import statements
    const importRegex = /(?:^|\\n)\\s*(?:import|from)\\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
    let match;
    
    while ((match = importRegex.exec(code)) !== null) {
      const packageName = match[1];
      if (pyodidePackages[packageName]) {
        pyodideToInstall.add(pyodidePackages[packageName]);
      }
      if (micropipPackages[packageName]) {
        micropipToInstall.add(micropipPackages[packageName]);
      }
    }
    
    // Install Pyodide packages
    for (const packageName of pyodideToInstall) {
      try {
        await this.pyodide.loadPackage(packageName);
      } catch (error) {
        console.warn(`パッケージ ${packageName} のインストールに失敗:`, error);
      }
    }
    
    // Install micropip packages
    for (const packageName of micropipToInstall) {
      try {
        await this.pyodide.runPythonAsync(`
import micropip
await micropip.install('${packageName}')
        `);
      } catch (error) {
        console.warn(`パッケージ ${packageName} のmicropipインストールに失敗:`, error);
      }
    }
  }

  /**
   * Execute Python code
   */
  async runPython() {
    if (!this.isInitialized) {
      this.updateOutput('❌ 実行環境がまだ初期化されていません。', 'error');
      return;
    }

    const code = document.getElementById('code-editor').value;
    const runButton = document.getElementById('run-button');
    
    if (!code.trim()) {
      this.updateOutput('❌ 実行するコードを入力してください。', 'error');
      return;
    }
    
    try {
      runButton.disabled = true;
      this.updateOutput('実行中...', 'loading');
      
      // Auto-install required packages
      await this.installRequiredPackages(code);
      
      // Clear output capture
      this.pyodide.runPython('output_capture.clear()');
      
      // Capture stdout
      this.pyodide.runPython('sys.stdout = output_capture');
      
      // Execute user code
      this.pyodide.runPython(code);
      
      // Restore stdout
      this.pyodide.runPython('sys.stdout = sys.__stdout__');
      
      // Get captured output
      const result = this.pyodide.runPython('output_capture.get_output()');
      
      if (result.trim()) {
        this.updateOutput(result, 'output');
      } else {
        this.updateOutput('✅ コードが正常に実行されました（出力なし）', 'success');
      }
      
      // Show download buttons for created files
      this.showDownloadButtons();
      
    } catch (error) {
      console.error('Python execution error:', error);
      this.updateOutput(`❌ 実行エラー:\\n${error.message}`, 'error');
    } finally {
      runButton.disabled = false;
    }
  }

  /**
   * Update output display
   */
  updateOutput(content, type = 'output') {
    const output = document.getElementById('output');
    
    switch (type) {
      case 'loading':
        output.textContent = content;
        output.className = 'loading';
        break;
      case 'success':
        output.innerHTML = `<span class="success">${content}</span>`;
        break;
      case 'error':
        output.innerHTML = `<div class="error">${content}</div>`;
        break;
      default:
        output.textContent = content;
        output.className = '';
    }
  }

  /**
   * Show download buttons for created files
   */
  showDownloadButtons() {
    try {
      const filesData = this.pyodide.runPython('dict(created_files)');
      const downloadArea = document.getElementById('download-area');
      
      if (Object.keys(filesData).length > 0) {
        downloadArea.innerHTML = '<h3>📁 作成されたファイル:</h3>';
        
        for (const [filename, content] of Object.entries(filesData)) {
          const button = document.createElement('button');
          button.textContent = `📄 ${filename} をダウンロード`;
          button.className = 'download-btn';
          button.addEventListener('click', () => this.downloadFile(filename, content));
          downloadArea.appendChild(button);
        }
        downloadArea.style.display = 'block';
      } else {
        downloadArea.style.display = 'none';
      }
    } catch (error) {
      console.error('Error showing download buttons:', error);
    }
  }

  /**
   * Download file
   */
  downloadFile(filename, content) {
    try {
      const mimeType = this.getMimeType(filename);
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert(`ファイルのダウンロードに失敗しました: ${error.message}`);
    }
  }

  /**
   * Get MIME type for file
   */
  getMimeType(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    const mimeTypes = {
      'txt': 'text/plain',
      'html': 'text/html',
      'htm': 'text/html',
      'css': 'text/css',
      'js': 'application/javascript',
      'json': 'application/json',
      'xml': 'application/xml',
      'csv': 'text/csv',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'pdf': 'application/pdf',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif'
    };
    
    return mimeTypes[extension] || 'application/octet-stream';
  }

  /**
   * Setup keyboard shortcuts
   */
  setupKeyboardShortcuts() {
    const codeEditor = document.getElementById('code-editor');
    
    codeEditor.addEventListener('keydown', (e) => {
      // Ctrl+Enter or Cmd+Enter to run code
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        this.runPython();
      }
      
      // Tab key for indentation
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = codeEditor.selectionStart;
        const end = codeEditor.selectionEnd;
        
        codeEditor.value = codeEditor.value.substring(0, start) + '    ' + codeEditor.value.substring(end);
        codeEditor.selectionStart = codeEditor.selectionEnd = start + 4;
      }
    });
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Run button
    const runButton = document.getElementById('run-button');
    runButton.addEventListener('click', () => this.runPython());
    
    // Keyboard shortcuts
    this.setupKeyboardShortcuts();
    
    // Prevent form submission on Enter in code editor
    const codeEditor = document.getElementById('code-editor');
    codeEditor.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        // Allow normal Enter behavior in textarea
        return true;
      }
    });
  }
}

/**
 * Initialize application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
  const app = new PythonWebRunner();
  app.setupEventListeners();
  
  // Global error handler
  window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
  });
  
  window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
  });
});
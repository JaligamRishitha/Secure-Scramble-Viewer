import { useState, useEffect } from 'react'
import './App.css'
import { uploadFile, listFiles, downloadFile, deleteFile } from './services/api'

const USERS = {
  admin: { password: 'admin123', role: 'admin', name: 'Administrator' },
  user: { password: 'user123', role: 'user', name: 'User' }
}

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ssvUser')
    return saved ? JSON.parse(saved) : null
  })
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [page, setPage] = useState(() => {
    const saved = localStorage.getItem('ssvUser')
    return saved ? 'dashboard' : 'home'
  })
  const [files, setFiles] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [apiKeys, setApiKeys] = useState(() => {
    const saved = localStorage.getItem('apiKeys')
    return saved ? JSON.parse(saved) : []
  })
  const [newAppName, setNewAppName] = useState('')
  const [expiryDays, setExpiryDays] = useState(30)
  const [preview, setPreview] = useState({ show: false, url: '', type: '', name: '' })
  const [showDownload, setShowDownload] = useState(false)

  useEffect(() => { if (user) loadFiles() }, [user])
  useEffect(() => { localStorage.setItem('apiKeys', JSON.stringify(apiKeys)) }, [apiKeys])
  useEffect(() => { 
    if (user) localStorage.setItem('ssvUser', JSON.stringify(user))
    else localStorage.removeItem('ssvUser')
  }, [user])

  const handleLogin = (e) => {
    e.preventDefault()
    const u = USERS[loginForm.username]
    if (u && u.password === loginForm.password) {
      setUser({ username: loginForm.username, role: u.role, name: u.name })
      setLoginError('')
      setLoginForm({ username: '', password: '' })
      setPage('dashboard')
    } else {
      setLoginError('Invalid username or password')
    }
  }

  const handleLogout = () => { setUser(null); setPage('home') }

  const loadFiles = async () => {
    try {
      setLoading(true)
      const data = await listFiles()
      setFiles(data)
    } catch (error) {
      showMessage('error', 'Failed to load files')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    try {
      setUploading(true)
      await uploadFile(selectedFile)
      showMessage('success', 'File encrypted successfully')
      setSelectedFile(null)
      loadFiles()
    } catch (error) {
      showMessage('error', error.response?.data?.detail || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDecode = async (fileId, filename) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/decode?file_id=${fileId}`, { method: 'POST' })
      if (!response.ok) throw new Error('Decode failed')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const ext = filename.split('.').pop().toLowerCase()
      let type = 'other'
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) type = 'image'
      else if (ext === 'pdf') type = 'pdf'
      else if (['mp4', 'webm', 'ogg'].includes(ext)) type = 'video'
      setPreview({ show: true, url, type, name: filename })
    } catch (error) {
      showMessage('error', 'Failed to decode file')
    }
  }

  const handleDownload = async (fileId, filename) => {
    try {
      const blob = await downloadFile(fileId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename.replace(/\.[^/.]+$/, '') + '.ssv'
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      showMessage('error', 'Download failed')
    }
  }

  const handleDelete = async (fileId) => {
    if (!confirm('Delete this file?')) return
    try {
      await deleteFile(fileId)
      showMessage('success', 'File deleted')
      loadFiles()
    } catch (error) {
      showMessage('error', 'Delete failed')
    }
  }

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const generateApiKey = () => {
    if (!newAppName.trim()) return
    const key = 'ssv_' + Array.from(crypto.getRandomValues(new Uint8Array(24))).map(b => b.toString(16).padStart(2, '0')).join('')
    const now = new Date()
    const expiry = new Date(now.getTime() + expiryDays * 24 * 60 * 60 * 1000)
    setApiKeys([...apiKeys, {
      id: Date.now(),
      appName: newAppName,
      key,
      created: now.toISOString(),
      expiry: expiry.toISOString(),
      hits: 0,
      status: 'active'
    }])
    setNewAppName('')
    showMessage('success', 'API key generated')
  }

  const deleteApiKey = (id) => {
    setApiKeys(apiKeys.filter(k => k.id !== id))
    showMessage('success', 'API key deleted')
  }

  const formatDate = (iso) => new Date(iso).toLocaleDateString()
  const formatSize = (bytes) => bytes < 1024 ? bytes + ' B' : bytes < 1048576 ? (bytes / 1024).toFixed(1) + ' KB' : (bytes / 1048576).toFixed(1) + ' MB'
  const getFileIcon = (name) => {
    const ext = name.split('.').pop().toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return '🖼️'
    if (ext === 'pdf') return '📄'
    if (['doc', 'docx'].includes(ext)) return '📝'
    if (['xls', 'xlsx'].includes(ext)) return '📊'
    if (['mp4', 'webm', 'mov'].includes(ext)) return '🎬'
    return '📁'
  }

  // Login Page
  if (!user && page === 'login') {
    return (
      <div className="app">
        <div className="login-page">
          <div className="login-card">
            <div className="login-header">
              <div className="login-icon">🔐</div>
              <h1 className="login-title">Welcome Back</h1>
              <p className="login-subtitle">Sign in to access your encrypted files</p>
            </div>
            <form onSubmit={handleLogin}>
              {loginError && <div className="login-error">{loginError}</div>}
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-primary login-btn">Sign In</button>
            </form>
            <div className="login-demo">
              <div className="login-demo-title">Demo Credentials</div>
              <div className="demo-creds">
                <div className="demo-cred">admin / admin123</div>
                <div className="demo-cred">user / user123</div>
              </div>
            </div>
            <button className="btn btn-ghost" style={{ width: '100%', marginTop: '1rem' }} onClick={() => setPage('home')}>
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Dashboard
  if (user && page !== 'api') {
    return (
      <div className="app">
        <nav className="navbar">
          <div className="nav-content">
            <div className="brand">
              <div className="brand-icon">🔐</div>
              SecureScramble
            </div>
            <div className="nav-links">
              <span className="nav-link" onClick={() => setPage('dashboard')}>Dashboard</span>
              {user.role === 'admin' && <span className="nav-link" onClick={() => setPage('api')}>API Keys</span>}
            </div>
            <div className="nav-buttons">
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>👤 {user.name}</span>
              <button className="btn btn-ghost" onClick={handleLogout}>Sign Out</button>
            </div>
          </div>
        </nav>

        <div className="dashboard">
          <div className="dashboard-header">
            <h1 className="dashboard-title">Welcome back, {user.name}</h1>
            <p className="dashboard-subtitle">Manage your encrypted files securely</p>
          </div>

          <div className="dashboard-content">
            <div className="main-panel">
              <div className="panel-card">
                <h2 className="panel-title">📁 Your Encrypted Files</h2>
                {loading ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Loading files...</p>
                ) : files.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No files yet. Upload your first file!</p>
                ) : (
                  <table className="files-table">
                    <thead>
                      <tr>
                        <th>File</th>
                        <th>Size</th>
                        <th>Uploaded</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {files.map(file => (
                        <tr key={file.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div className="file-row-icon">{getFileIcon(file.original_filename)}</div>
                              <span>{file.original_filename}</span>
                            </div>
                          </td>
                          <td style={{ color: 'var(--text-muted)' }}>{formatSize(file.file_size)}</td>
                          <td style={{ color: 'var(--text-muted)' }}>{formatDate(file.upload_date)}</td>
                          <td>
                            <div className="file-actions">
                              <button className="btn-icon" title="Preview" onClick={() => handleDecode(file.id, file.original_filename)}>👁️</button>
                              <button className="btn-icon" title="Download .ssv" onClick={() => handleDownload(file.id, file.original_filename)}>⬇️</button>
                              <button className="btn-icon danger" title="Delete" onClick={() => handleDelete(file.id)}>🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="side-panel">
              <div className="panel-card">
                <h2 className="panel-title">⬆️ Upload File</h2>
                <div 
                  className="upload-zone"
                  onClick={() => document.getElementById('file-input')?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('dragging') }}
                  onDragLeave={(e) => e.currentTarget.classList.remove('dragging')}
                  onDrop={(e) => {
                    e.preventDefault()
                    e.currentTarget.classList.remove('dragging')
                    if (e.dataTransfer.files[0]) setSelectedFile(e.dataTransfer.files[0])
                  }}
                >
                  <input type="file" id="file-input" hidden onChange={(e) => e.target.files?.[0] && setSelectedFile(e.target.files[0])} />
                  <div className="upload-icon">📤</div>
                  <p className="upload-text">Drop file here or click to browse</p>
                  <p className="upload-hint">All file types supported</p>
                </div>
                {selectedFile && (
                  <div className="selected-file">
                    <div className="selected-file-info">
                      <span>{getFileIcon(selectedFile.name)}</span>
                      <div>
                        <div style={{ fontWeight: 500 }}>{selectedFile.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{formatSize(selectedFile.size)}</div>
                      </div>
                    </div>
                    <button className="btn btn-primary" onClick={handleUpload} disabled={uploading}>
                      {uploading ? 'Encrypting...' : 'Encrypt'}
                    </button>
                  </div>
                )}
              </div>

              <div className="panel-card">
                <h2 className="panel-title">📊 Quick Stats</h2>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Total Files</span>
                    <span style={{ fontWeight: 600 }}>{files.length}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Total Size</span>
                    <span style={{ fontWeight: 600 }}>{formatSize(files.reduce((acc, f) => acc + f.file_size, 0))}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Encryption</span>
                    <span style={{ fontWeight: 600, color: 'var(--accent-green)' }}>AES-256</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {preview.show && (
          <div className="modal-overlay" onClick={() => { setPreview({ show: false, url: '', type: '', name: '' }); window.URL.revokeObjectURL(preview.url) }}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <span className="modal-title">🔒 {preview.name} - View Only</span>
                <button className="modal-close" onClick={() => { setPreview({ show: false, url: '', type: '', name: '' }); window.URL.revokeObjectURL(preview.url) }}>×</button>
              </div>
              <div className="modal-body">
                {preview.type === 'image' && <img src={preview.url} alt={preview.name} className="preview-image" />}
                {preview.type === 'pdf' && <iframe src={preview.url} className="preview-pdf" title={preview.name} />}
                {preview.type === 'video' && <video src={preview.url} controls style={{ maxWidth: '100%', borderRadius: '12px' }} />}
                {preview.type === 'other' && <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Preview not available. Download the .ssv file and use the desktop viewer.</p>}
              </div>
            </div>
          </div>
        )}

        {message.text && <div className={`message-toast ${message.type}`}>{message.text}</div>}
      </div>
    )
  }

  // API Management Page
  if (user && page === 'api') {
    return (
      <div className="app">
        <nav className="navbar">
          <div className="nav-content">
            <div className="brand">
              <div className="brand-icon">🔐</div>
              SecureScramble
            </div>
            <div className="nav-links">
              <span className="nav-link" onClick={() => setPage('dashboard')}>Dashboard</span>
              <span className="nav-link" onClick={() => setPage('api')}>API Keys</span>
            </div>
            <div className="nav-buttons">
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>👤 {user.name}</span>
              <button className="btn btn-ghost" onClick={handleLogout}>Sign Out</button>
            </div>
          </div>
        </nav>

        <div className="api-page">
          <div className="api-header">
            <h1 className="dashboard-title">🔑 API Key Management</h1>
            <p className="dashboard-subtitle">Generate and manage API keys for your applications</p>
          </div>

          <div className="api-content">
            <div className="panel-card">
              <h2 className="panel-title">Generate New API Key</h2>
              <div className="api-form">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Application name"
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                />
                <select className="form-input" style={{ maxWidth: '150px' }} value={expiryDays} onChange={(e) => setExpiryDays(Number(e.target.value))}>
                  <option value={7}>7 days</option>
                  <option value={30}>30 days</option>
                  <option value={90}>90 days</option>
                  <option value={365}>1 year</option>
                </select>
                <button className="btn btn-primary" onClick={generateApiKey}>Generate Key</button>
              </div>
            </div>

            <div className="panel-card" style={{ marginTop: '1.5rem' }}>
              <h2 className="panel-title">Your API Keys</h2>
              {apiKeys.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No API keys yet. Generate your first key above.</p>
              ) : (
                <table className="api-table">
                  <thead>
                    <tr>
                      <th>Application</th>
                      <th>API Key</th>
                      <th>Hits</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Expires</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiKeys.map(key => (
                      <tr key={key.id}>
                        <td style={{ fontWeight: 500 }}>{key.appName}</td>
                        <td className="api-key-cell">{key.key.slice(0, 20)}...</td>
                        <td>{key.hits}</td>
                        <td>
                          <span className={`status-badge ${new Date(key.expiry) > new Date() ? 'active' : 'expired'}`}>
                            {new Date(key.expiry) > new Date() ? 'Active' : 'Expired'}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>{formatDate(key.created)}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{formatDate(key.expiry)}</td>
                        <td>
                          <button className="btn-icon" title="Copy" onClick={() => { navigator.clipboard.writeText(key.key); showMessage('success', 'Copied!') }}>📋</button>
                          <button className="btn-icon danger" title="Delete" onClick={() => deleteApiKey(key.id)}>🗑️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {message.text && <div className={`message-toast ${message.type}`}>{message.text}</div>}
      </div>
    )
  }

  // Downloads Page
  if (page === 'downloads') {
    return (
      <div className="app">
        <nav className="navbar">
          <div className="nav-content">
            <div className="brand" onClick={() => setPage('home')} style={{ cursor: 'pointer' }}>
              <div className="brand-icon">🔐</div>
              SecureScramble
            </div>
            <div className="nav-links">
              <span className="nav-link" onClick={() => setPage('home')}>Home</span>
              <span className="nav-link" onClick={() => setPage('downloads')}>Download</span>
            </div>
            <div className="nav-buttons">
              <button className="btn btn-ghost" onClick={() => setPage('login')}>Sign In</button>
              <button className="btn btn-primary" onClick={() => setPage('login')}>Get Started</button>
            </div>
          </div>
        </nav>

        <div className="downloads-page">
          <div className="downloads-header">
            <span className="section-label">Download</span>
            <h1 className="section-title">SSV Viewer for Your Platform</h1>
            <p className="section-description">
              Download the secure viewer to open and view encrypted .ssv files on your device.
            </p>
          </div>

          <div className="downloads-grid">
            {/* Windows */}
            <div className="download-card">
              <div className="download-icon">🪟</div>
              <h3 className="download-title">Windows</h3>
              <p className="download-version">Version 1.0.0 • Python Source</p>
              <a href="/downloads/SSV-Viewer-Windows.zip" download className="btn btn-primary download-btn">
                Download for Windows
              </a>
              <div className="download-instructions">
                <h4>Installation</h4>
                <ol>
                  <li>Install Python 3.8+ from <code>python.org</code></li>
                  <li>Extract the ZIP file</li>
                  <li>Double-click <code>install_windows.bat</code></li>
                  <li>Run: <code>python ssv_viewer_enhanced.py file.ssv</code></li>
                </ol>
              </div>
            </div>

            {/* macOS */}
            <div className="download-card">
              <div className="download-icon">🍎</div>
              <h3 className="download-title">macOS</h3>
              <p className="download-version">Version 1.0.0 • Python Source</p>
              <a href="/downloads/SSV-Viewer-macOS.tar.gz" download className="btn btn-primary download-btn">
                Download for macOS
              </a>
              <div className="download-instructions">
                <h4>Installation</h4>
                <ol>
                  <li>Install Python 3: <code>brew install python3</code></li>
                  <li>Extract: <code>tar -xzf SSV-Viewer-macOS.tar.gz</code></li>
                  <li>Run: <code>./install_mac.sh</code></li>
                  <li>Run: <code>python3 ssv_viewer_enhanced.py file.ssv</code></li>
                </ol>
              </div>
            </div>

            {/* Linux */}
            <div className="download-card featured">
              <div className="download-badge">Recommended</div>
              <div className="download-icon">🐧</div>
              <h3 className="download-title">Linux</h3>
              <p className="download-version">Version 1.0.0 • 58 MB Binary</p>
              <a href="/downloads/ssv-viewer-linux" download className="btn btn-primary download-btn">
                Download for Linux
              </a>
              <div className="download-instructions">
                <h4>Installation</h4>
                <ol>
                  <li>Download the binary file</li>
                  <li>Make executable: <code>chmod +x ssv-viewer-linux</code></li>
                  <li>Move to bin: <code>sudo mv ssv-viewer-linux /usr/local/bin/ssv-viewer</code></li>
                  <li>Run: <code>ssv-viewer file.ssv</code></li>
                </ol>
              </div>
            </div>

            {/* Debian/Ubuntu */}
            <div className="download-card featured">
              <div className="download-badge">Recommended</div>
              <div className="download-icon">📦</div>
              <h3 className="download-title">Debian / Ubuntu</h3>
              <p className="download-version">Version 1.0.0 • 54 MB Package</p>
              <a href="/downloads/ssv-viewer.deb" download className="btn btn-primary download-btn">
                Download .deb Package
              </a>
              <div className="download-instructions">
                <h4>Installation</h4>
                <ol>
                  <li>Download the <code>.deb</code> package</li>
                  <li>Install: <code>sudo dpkg -i ssv-viewer.deb</code></li>
                  <li>Fix dependencies: <code>sudo apt-get install -f</code></li>
                  <li>Double-click any <code>.ssv</code> file to open</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="downloads-config">
            <div className="config-card">
              <h3>⚙️ Configuration</h3>
              <p>After installation, you need to configure the secret key to decrypt files:</p>
              <div className="config-steps">
                <div className="config-step">
                  <h4>1. Create config directory</h4>
                  <code>mkdir -p ~/.ssv_decoder</code>
                </div>
                <div className="config-step">
                  <h4>2. Add your secret key</h4>
                  <code>echo "YOUR_SECRET_KEY" &gt; ~/.ssv_decoder/config.txt</code>
                </div>
                <div className="config-step">
                  <h4>3. Get your key from admin</h4>
                  <p>Contact your administrator to get the decryption key for your organization's files.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="footer">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="brand-icon" style={{ width: 32, height: 32, fontSize: '1rem' }}>🔐</div>
              SecureScramble
            </div>
            <div className="footer-links">
              <a href="#" className="footer-link">Privacy Policy</a>
              <a href="#" className="footer-link">Terms of Service</a>
              <a href="#" className="footer-link">Documentation</a>
              <a href="#" className="footer-link">Contact</a>
            </div>
            <div className="footer-copy">© 2024 SecureScramble. All rights reserved.</div>
          </div>
        </footer>
      </div>
    )
  }

  // Landing Page (default for non-logged in users)
  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-content">
          <div className="brand">
            <div className="brand-icon">🔐</div>
            SecureScramble
          </div>
          <div className="nav-links">
            <span className="nav-link" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>Features</span>
            <span className="nav-link" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>How it Works</span>
            <span className="nav-link" onClick={() => setPage('downloads')}>Download</span>
            <span className="nav-link">Documentation</span>
          </div>
          <div className="nav-buttons">
            <button className="btn btn-ghost" onClick={() => setPage('login')}>Sign In</button>
            <button className="btn btn-primary" onClick={() => setPage('login')}>Get Started</button>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <span className="hero-badge-dot"></span>
              Military-Grade Encryption
            </div>
            <h1>Protect Your Files with <span>Unbreakable</span> Security</h1>
            <p className="hero-description">
              Transform any file into an encrypted .ssv format that's impossible to open without our secure viewer. 
              AES-256 encryption ensures your sensitive data stays private.
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary btn-large" onClick={() => setPage('login')}>
                Start Encrypting →
              </button>
              <button className="btn btn-outline btn-large">
                View Demo
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <div className="stat-value">AES-256</div>
                <div className="stat-label">Encryption Standard</div>
              </div>
              <div className="stat">
                <div className="stat-value">100%</div>
                <div className="stat-label">File Protection</div>
              </div>
              <div className="stat">
                <div className="stat-value">∞</div>
                <div className="stat-label">File Types</div>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card">
              <div className="card-header">
                <div className="card-icon">🔒</div>
                <div>
                  <div className="card-title">Encrypted Files</div>
                  <div className="card-subtitle">Protected with AES-256</div>
                </div>
              </div>
              <div className="file-list">
                <div className="file-item">
                  <div className="file-icon">📄</div>
                  <div className="file-info">
                    <div className="file-name">financial_report.pdf</div>
                    <div className="file-meta">2.4 MB • Encrypted today</div>
                  </div>
                  <span className="file-status">Secured</span>
                </div>
                <div className="file-item">
                  <div className="file-icon">🖼️</div>
                  <div className="file-info">
                    <div className="file-name">confidential_design.png</div>
                    <div className="file-meta">8.1 MB • Encrypted today</div>
                  </div>
                  <span className="file-status">Secured</span>
                </div>
                <div className="file-item">
                  <div className="file-icon">📊</div>
                  <div className="file-info">
                    <div className="file-name">client_data.xlsx</div>
                    <div className="file-meta">1.2 MB • Encrypted today</div>
                  </div>
                  <span className="file-status">Secured</span>
                </div>
              </div>
              <div className="floating-badge top-right">
                <span>🛡️</span> 256-bit Encrypted
              </div>
              <div className="floating-badge bottom-left">
                <span>✓</span> View Only Mode
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features" id="features">
        <div className="section-header">
          <span className="section-label">Features</span>
          <h2 className="section-title">Everything You Need for File Security</h2>
          <p className="section-description">
            Comprehensive encryption solution designed for professionals who take data security seriously.
          </p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔐</div>
            <h3 className="feature-title">AES-256 Encryption</h3>
            <p className="feature-description">
              Military-grade encryption standard used by governments and financial institutions worldwide.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📁</div>
            <h3 className="feature-title">Custom .SSV Format</h3>
            <p className="feature-description">
              Proprietary file format that cannot be opened by any standard application without our viewer.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👁️</div>
            <h3 className="feature-title">View-Only Mode</h3>
            <p className="feature-description">
              Recipients can view files but cannot download, copy, or extract the original content.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💻</div>
            <h3 className="feature-title">Cross-Platform Viewer</h3>
            <p className="feature-description">
              Desktop applications for Windows, macOS, and Linux to view encrypted files securely.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔑</div>
            <h3 className="feature-title">API Access</h3>
            <p className="feature-description">
              Generate API keys to integrate encryption capabilities into your own applications.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3 className="feature-title">All File Types</h3>
            <p className="feature-description">
              Encrypt any file type: documents, images, videos, spreadsheets, presentations, and more.
            </p>
          </div>
        </div>
      </section>

      <section className="how-it-works" id="how-it-works">
        <div className="section-header">
          <span className="section-label">How It Works</span>
          <h2 className="section-title">Simple, Secure, Seamless</h2>
          <p className="section-description">
            Protecting your files takes just a few clicks.
          </p>
        </div>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-line"></div>
            <div className="step-content">
              <h3 className="step-title">Upload Your File</h3>
              <p className="step-description">
                Drag and drop any file into our secure upload zone. We support all file types and sizes.
              </p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-line"></div>
            <div className="step-content">
              <h3 className="step-title">Automatic Encryption</h3>
              <p className="step-description">
                Your file is instantly encrypted using AES-256-CBC with a unique salt and IV for maximum security.
              </p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-line"></div>
            <div className="step-content">
              <h3 className="step-title">Download .SSV File</h3>
              <p className="step-description">
                Get your encrypted .ssv file that can only be opened with our secure viewer application.
              </p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3 className="step-title">Share Securely</h3>
              <p className="step-description">
                Share the .ssv file with anyone. They'll need the SSV Viewer to access the content in view-only mode.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="cta-card">
          <div className="cta-content">
            <h2>Ready to Secure Your Files?</h2>
            <p>Join thousands of professionals who trust SecureScramble for their sensitive data protection.</p>
            <button className="btn btn-accent btn-large" onClick={() => setPage('login')}>
              Get Started Free →
            </button>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="brand-icon" style={{ width: 32, height: 32, fontSize: '1rem' }}>🔐</div>
            SecureScramble
          </div>
          <div className="footer-links">
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Terms of Service</a>
            <a href="#" className="footer-link">Documentation</a>
            <a href="#" className="footer-link">Contact</a>
          </div>
          <div className="footer-copy">© 2024 SecureScramble. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}

export default App

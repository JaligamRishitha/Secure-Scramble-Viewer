import { useState, useEffect } from 'react'
import './App.css'
import { uploadFile, listFiles, downloadFile, deleteFile } from './services/api'

function App() {
    const [files, setFiles] = useState([])
    const [selectedFile, setSelectedFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })

    useEffect(() => {
        loadFiles()
    }, [])

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

    const handleFileSelect = (e) => {
        setSelectedFile(e.target.files[0])
    }

    const handleUpload = async () => {
        if (!selectedFile) return

        try {
            setUploading(true)
            await uploadFile(selectedFile)
            showMessage('success', 'File uploaded and encrypted successfully!')
            setSelectedFile(null)
            document.getElementById('file-input').value = ''
            loadFiles()
        } catch (error) {
            showMessage('error', error.response?.data?.detail || 'Upload failed')
        } finally {
            setUploading(false)
        }
    }

    const handleDecode = async (fileId, filename) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/decode?file_id=${fileId}`, {
                method: 'POST'
            })

            if (!response.ok) {
                throw new Error('Decode failed')
            }

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', filename)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)

            showMessage('success', 'Original file decoded and downloaded!')
        } catch (error) {
            showMessage('error', 'Decode failed: ' + error.message)
        }
    }

    const handleDownload = async (fileId, filename) => {
        try {
            const ssvFilename = filename.replace(/\.[^/.]+$/, '') + '.ssv'
            await downloadFile(fileId, ssvFilename)
            showMessage('success', 'File downloaded successfully!')
        } catch (error) {
            showMessage('error', 'Download failed')
        }
    }

    const handleDelete = async (fileId) => {
        if (!confirm('Are you sure you want to delete this file?')) return

        try {
            await deleteFile(fileId)
            showMessage('success', 'File deleted successfully!')
            loadFiles()
        } catch (error) {
            showMessage('error', 'Delete failed')
        }
    }

    const showMessage = (type, text) => {
        setMessage({ type, text })
        setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    }

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString()
    }

    return (
        <div className="app">
            <div className="header">
                <h1>🔒 SecureScramble Viewer</h1>
                <p>Upload files and download them as encrypted .ssv files</p>
            </div>

            <div className="container">
                {message.text && (
                    <div className={message.type}>
                        {message.text}
                    </div>
                )}

                <div className="upload-section">
                    <h2>Upload File</h2>
                    <div className="file-input-wrapper">
                        <input
                            type="file"
                            id="file-input"
                            className="file-input"
                            onChange={handleFileSelect}
                        />
                        <label htmlFor="file-input" className="file-label">
                            Choose File
                        </label>
                    </div>
                    {selectedFile && (
                        <div className="selected-file">
                            Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                        </div>
                    )}
                    <button
                        className="upload-btn"
                        onClick={handleUpload}
                        disabled={!selectedFile || uploading}
                    >
                        {uploading ? 'Uploading...' : 'Upload & Encrypt'}
                    </button>
                </div>

                <div className="files-section">
                    <h2>Encrypted Files</h2>
                    {loading ? (
                        <div className="loading">Loading files...</div>
                    ) : files.length === 0 ? (
                        <div className="empty-state">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <p>No files uploaded yet</p>
                        </div>
                    ) : (
                        <div className="files-list">
                            {files.map((file) => (
                                <div key={file.file_id} className="file-item">
                                    <div className="file-info">
                                        <div className="file-name">{file.filename}</div>
                                        <div className="file-meta">
                                            {formatFileSize(file.size)} • {formatDate(file.upload_date)}
                                        </div>
                                    </div>
                                    <div className="file-actions">
                                        <button
                                            className="btn btn-success"
                                            onClick={() => handleDecode(file.file_id, file.filename)}
                                        >
                                            Decode Original
                                        </button>
                                        <button
                                            className="btn btn-download"
                                            onClick={() => handleDownload(file.file_id, file.filename)}
                                        >
                                            Download .ssv
                                        </button>
                                        <button
                                            className="btn btn-delete"
                                            onClick={() => handleDelete(file.file_id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default App

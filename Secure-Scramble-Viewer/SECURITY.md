# Security Documentation

## Encryption Details

### Algorithm: AES-256-CBC

**Why AES-256-CBC?**
- Industry standard encryption
- 256-bit key provides strong security
- CBC mode prevents pattern recognition
- Widely supported and tested

### Key Derivation: PBKDF2

**Parameters:**
- Hash: SHA-256
- Iterations: 100,000
- Salt: 16 bytes (random per file)
- Output: 32 bytes (256 bits)

**Why PBKDF2?**
- Resistant to brute-force attacks
- Computationally expensive for attackers
- Unique salt prevents rainbow table attacks

### File Format Structure

```
.ssv File Format (Binary):
┌─────────────────────────────────────┐
│ Version (4 bytes)                   │ 0x00000001
├─────────────────────────────────────┤
│ Data Salt (16 bytes)                │ Random
├─────────────────────────────────────┤
│ Data IV (16 bytes)                  │ Random
├─────────────────────────────────────┤
│ Filename Salt (16 bytes)            │ Random
├─────────────────────────────────────┤
│ Filename IV (16 bytes)              │ Random
├─────────────────────────────────────┤
│ Filename Length (4 bytes)           │ Big-endian
├─────────────────────────────────────┤
│ Encrypted Filename (N bytes)        │ AES-256-CBC
├─────────────────────────────────────┤
│ Encrypted File Data (remaining)     │ AES-256-CBC
└─────────────────────────────────────┘
```

## Key Security

### Development Environment

```env
# .env (NEVER commit to git)
SECRET_KEY=generate-with-openssl-rand-base64-32
```

Generate secure key:
```bash
openssl rand -base64 32
```

### Production Environment

**Option 1: Environment Variables**
```bash
export SECRET_KEY="your-production-key"
```

**Option 2: AWS Secrets Manager**
```python
import boto3
import json

def get_encryption_key():
    client = boto3.client('secretsmanager', region_name='us-east-1')
    response = client.get_secret_value(SecretId='ssv/encryption-key')
    return json.loads(response['SecretString'])['key']
```

**Option 3: Azure Key Vault**
```python
from azure.keyvault.secrets import SecretClient
from azure.identity import DefaultAzureCredential

def get_encryption_key():
    credential = DefaultAzureCredential()
    client = SecretClient(
        vault_url="https://your-vault.vault.azure.net/",
        credential=credential
    )
    return client.get_secret("encryption-key").value
```

**Option 4: HashiCorp Vault**
```python
import hvac

def get_encryption_key():
    client = hvac.Client(url='https://vault.example.com')
    client.token = os.environ['VAULT_TOKEN']
    secret = client.secrets.kv.v2.read_secret_version(
        path='ssv/encryption-key'
    )
    return secret['data']['data']['key']
```

### Viewer Application Key Embedding

**Development:**
```env
VITE_ENCRYPTION_KEY=your-key-here
```

**Production Build:**

1. **Obfuscation** (Basic protection):
```javascript
// Build-time key injection
const KEY_PARTS = [
  'part1', 'part2', 'part3', 'part4'
];
const ENCRYPTION_KEY = KEY_PARTS.join('');
```

2. **Environment-specific builds**:
```bash
# Build for different environments
VITE_ENCRYPTION_KEY=$PROD_KEY npm run build
```

3. **Code obfuscation**:
```bash
npm install --save-dev javascript-obfuscator
```

**Note:** Client-side keys are never 100% secure. For maximum security, decrypt server-side only.

## Preventing Direct File Opening

### 1. No Standard File Signatures

Standard files have "magic bytes":
- PDF: `%PDF-`
- PNG: `89 50 4E 47`
- JPEG: `FF D8 FF`

.ssv files start with:
- Version bytes: `00 00 00 01`
- Followed by random encrypted data

No OS recognizes this pattern.

### 2. Binary Encryption

Entire file is encrypted binary data. Opening in text editor shows gibberish:
```
��x�2�K��m�8�Q��...
```

### 3. Custom Extension

`.ssv` extension is not registered with any OS by default.

### 4. File Association (Optional)

Register .ssv with SSV Viewer:

**Windows Registry:**
```reg
Windows Registry Editor Version 5.00

[HKEY_CLASSES_ROOT\.ssv]
@="SSVFile"

[HKEY_CLASSES_ROOT\SSVFile]
@="SecureScramble File"

[HKEY_CLASSES_ROOT\SSVFile\DefaultIcon]
@="C:\\Program Files\\SSV Viewer\\icon.ico"

[HKEY_CLASSES_ROOT\SSVFile\shell\open\command]
@="\"C:\\Program Files\\SSV Viewer\\SSV Viewer.exe\" \"%1\""
```

**macOS:**
```xml
<!-- Info.plist -->
<key>CFBundleDocumentTypes</key>
<array>
    <dict>
        <key>CFBundleTypeName</key>
        <string>SecureScramble File</string>
        <key>CFBundleTypeExtensions</key>
        <array>
            <string>ssv</string>
        </array>
        <key>CFBundleTypeRole</key>
        <string>Viewer</string>
    </dict>
</array>
```

## Security Best Practices

### 1. Key Rotation

Rotate encryption keys periodically:

```python
# Migration script
def rotate_encryption_key(old_key, new_key):
    old_encryptor = FileEncryption(old_key)
    new_encryptor = FileEncryption(new_key)
    
    for file_record in db.query(EncryptedFile).all():
        # Decrypt with old key
        old_data = old_encryptor.parse_ssv_file(read_file(file_record))
        
        # Re-encrypt with new key
        new_data = new_encryptor.create_ssv_file(old_data)
        
        # Save
        write_file(file_record, new_data)
```

### 2. Access Control

Implement user authentication:

```python
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer

security = HTTPBearer()

async def verify_token(credentials = Depends(security)):
    token = credentials.credentials
    # Verify JWT token
    if not is_valid_token(token):
        raise HTTPException(status_code=401, detail="Invalid token")
    return token

@app.post("/api/upload")
async def upload_file(token = Depends(verify_token)):
    # Only authenticated users can upload
    ...
```

### 3. Rate Limiting

Prevent brute-force attacks:

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/upload")
@limiter.limit("10/minute")
async def upload_file(...):
    ...
```

### 4. Input Validation

```python
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB
ALLOWED_EXTENSIONS = {'.pdf', '.jpg', '.png', '.txt', '.doc', '.docx'}

def validate_file(file: UploadFile):
    # Check size
    if file.size > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large")
    
    # Check extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="File type not allowed")
```

### 5. Secure File Storage

```python
import os
import secrets

def generate_secure_filename():
    return secrets.token_hex(16) + '.ssv'

def get_secure_storage_path(filename):
    # Prevent directory traversal
    filename = os.path.basename(filename)
    return os.path.join(settings.STORAGE_PATH, filename)
```

### 6. HTTPS Only

```python
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware

app.add_middleware(HTTPSRedirectMiddleware)
```

### 7. CORS Configuration

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # Specific domains only
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["*"],
)
```

### 8. SQL Injection Prevention

SQLAlchemy ORM prevents SQL injection by default:

```python
# Safe (parameterized)
file = db.query(EncryptedFile).filter(EncryptedFile.id == file_id).first()

# Unsafe (never do this)
# db.execute(f"SELECT * FROM files WHERE id = '{file_id}'")
```

### 9. Audit Logging

```python
import logging

logger = logging.getLogger(__name__)

@app.post("/api/upload")
async def upload_file(file: UploadFile):
    logger.info(f"File upload: {file.filename} from {request.client.host}")
    # ... upload logic
```

### 10. Secure Headers

```python
from fastapi.middleware.trustedhost import TrustedHostMiddleware

app.add_middleware(TrustedHostMiddleware, allowed_hosts=["yourdomain.com"])

@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000"
    return response
```

## Threat Model

### Threats Mitigated

✅ **Unauthorized file access**: Files encrypted at rest
✅ **Man-in-the-middle**: Use HTTPS
✅ **Brute force**: PBKDF2 with 100k iterations
✅ **Rainbow tables**: Unique salt per file
✅ **Pattern analysis**: CBC mode encryption
✅ **Direct file opening**: Custom binary format

### Threats NOT Mitigated

⚠️ **Client-side key exposure**: Viewer app contains decryption key
⚠️ **Memory dumps**: Decrypted data in memory
⚠️ **Screen capture**: Displayed content visible
⚠️ **Compromised server**: Attacker with server access can decrypt
⚠️ **Quantum computing**: AES-256 vulnerable to quantum attacks (future)

## Compliance

### GDPR Considerations

- Implement user data deletion
- Provide data export functionality
- Log access to personal files
- Obtain consent for data processing

### HIPAA Considerations (if handling medical data)

- Encrypt data in transit and at rest ✅
- Implement access controls
- Maintain audit logs
- Use BAA-compliant hosting

## Incident Response

### If Encryption Key is Compromised

1. **Immediately rotate key**
2. **Re-encrypt all files**
3. **Notify users**
4. **Review access logs**
5. **Update all viewer applications**

### If Database is Compromised

1. **Revoke database credentials**
2. **Restore from backup**
3. **Audit for data exfiltration**
4. **Notify affected users**

## Security Checklist

- [ ] Strong encryption key (32+ characters)
- [ ] Key stored in secrets manager (not in code)
- [ ] HTTPS enabled with valid certificate
- [ ] Rate limiting configured
- [ ] Input validation implemented
- [ ] CORS properly configured
- [ ] Security headers added
- [ ] Audit logging enabled
- [ ] Regular backups configured
- [ ] Dependency updates automated
- [ ] Security scanning in CI/CD
- [ ] Incident response plan documented

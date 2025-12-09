#!/usr/bin/env python3
"""Debug script to test SSV file decryption"""

import sys
import hashlib
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import padding

class SSVDebugger:
    def __init__(self, secret_key: str):
        self.key = hashlib.sha256(secret_key.encode()).digest()
        print(f"[DEBUG] Secret key (first 20 chars): {secret_key[:20]}...")
        print(f"[DEBUG] SHA256 hash (hex): {self.key.hex()[:40]}...")
    
    def decrypt_file(self, encrypted_data: bytes, salt: bytes, iv: bytes) -> bytes:
        """Decrypt file data using AES-256-CBC"""
        print(f"[DEBUG] Salt (hex): {salt.hex()}")
        print(f"[DEBUG] IV (hex): {iv.hex()}")
        print(f"[DEBUG] Encrypted data length: {len(encrypted_data)}")
        
        derived_key = hashlib.pbkdf2_hmac('sha256', self.key, salt, 100000, dklen=32)
        print(f"[DEBUG] Derived key (hex): {derived_key.hex()[:40]}...")
        
        cipher = Cipher(
            algorithms.AES(derived_key),
            modes.CBC(iv),
            backend=default_backend()
        )
        decryptor = cipher.decryptor()
        padded_data = decryptor.update(encrypted_data) + decryptor.finalize()
        print(f"[DEBUG] Padded data length: {len(padded_data)}")
        
        try:
            unpadder = padding.PKCS7(128).unpadder()
            original_data = unpadder.update(padded_data) + unpadder.finalize()
            print(f"[DEBUG] ✓ Unpadding successful! Original data length: {len(original_data)}")
            return original_data
        except Exception as e:
            print(f"[DEBUG] ✗ Unpadding failed: {e}")
            print(f"[DEBUG] Last 32 bytes of padded data (hex): {padded_data[-32:].hex()}")
            raise
    
    def parse_ssv_file(self, ssv_data: bytes):
        """Parse .ssv file and return (decrypted_data, original_filename)"""
        print(f"\n[DEBUG] === Parsing SSV File ===")
        print(f"[DEBUG] Total file size: {len(ssv_data)} bytes")
        
        version = ssv_data[0:4]
        print(f"[DEBUG] Version: {version.hex()}")
        
        salt = ssv_data[4:20]
        iv = ssv_data[20:36]
        fn_salt = ssv_data[36:52]
        fn_iv = ssv_data[52:68]
        filename_length = int.from_bytes(ssv_data[68:72], byteorder='big')
        
        print(f"[DEBUG] Filename length: {filename_length}")
        
        encrypted_filename = ssv_data[72:72+filename_length]
        encrypted_data = ssv_data[72+filename_length:]
        
        print(f"\n[DEBUG] === Decrypting Filename ===")
        original_filename = self.decrypt_file(encrypted_filename, fn_salt, fn_iv).decode('utf-8')
        print(f"[DEBUG] ✓ Filename: {original_filename}")
        
        print(f"\n[DEBUG] === Decrypting File Data ===")
        original_data = self.decrypt_file(encrypted_data, salt, iv)
        print(f"[DEBUG] ✓ File decrypted successfully!")
        
        return original_data, original_filename

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python debug_ssv.py <file.ssv> [secret_key]")
        sys.exit(1)
    
    ssv_file = sys.argv[1]
    secret_key = sys.argv[2] if len(sys.argv) > 2 else "XsPnogOqsLaGxNGW9ZfeL/gnuGQoW7UzluhwAWyXK4A="
    
    print(f"[DEBUG] Opening file: {ssv_file}")
    
    with open(ssv_file, 'rb') as f:
        ssv_data = f.read()
    
    debugger = SSVDebugger(secret_key)
    
    try:
        original_data, original_filename = debugger.parse_ssv_file(ssv_data)
        print(f"\n[SUCCESS] File decrypted successfully!")
        print(f"Filename: {original_filename}")
        print(f"Size: {len(original_data)} bytes")
    except Exception as e:
        print(f"\n[ERROR] Decryption failed: {e}")
        import traceback
        traceback.print_exc()

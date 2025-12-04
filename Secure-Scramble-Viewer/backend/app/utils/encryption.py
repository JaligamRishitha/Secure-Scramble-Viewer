import os
import hashlib
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import padding
from typing import Tuple

class FileEncryption:
    """AES-256-CBC encryption for files"""
    
    def __init__(self, secret_key: str):
        # Derive a 32-byte key from the secret
        self.key = hashlib.sha256(secret_key.encode()).digest()
    
    def encrypt_file(self, file_data: bytes) -> Tuple[bytes, bytes, bytes]:
        """
        Encrypt file data using AES-256-CBC
        Returns: (encrypted_data, salt, iv)
        """
        # Generate random salt and IV
        salt = os.urandom(16)
        iv = os.urandom(16)
        
        # Derive key with salt using PBKDF2
        derived_key = hashlib.pbkdf2_hmac('sha256', self.key, salt, 100000, dklen=32)
        
        # Pad the data to AES block size (128 bits = 16 bytes)
        padder = padding.PKCS7(128).padder()
        padded_data = padder.update(file_data) + padder.finalize()
        
        # Encrypt
        cipher = Cipher(
            algorithms.AES(derived_key),
            modes.CBC(iv),
            backend=default_backend()
        )
        encryptor = cipher.encryptor()
        encrypted_data = encryptor.update(padded_data) + encryptor.finalize()
        
        return encrypted_data, salt, iv
    
    def decrypt_file(self, encrypted_data: bytes, salt: bytes, iv: bytes) -> bytes:
        """
        Decrypt file data using AES-256-CBC
        """
        # Derive the same key with salt
        derived_key = hashlib.pbkdf2_hmac('sha256', self.key, salt, 100000, dklen=32)
        
        # Decrypt
        cipher = Cipher(
            algorithms.AES(derived_key),
            modes.CBC(iv),
            backend=default_backend()
        )
        decryptor = cipher.decryptor()
        padded_data = decryptor.update(encrypted_data) + decryptor.finalize()
        
        # Unpad
        unpadder = padding.PKCS7(128).unpadder()
        original_data = unpadder.update(padded_data) + unpadder.finalize()
        
        return original_data
    
    def create_ssv_file(self, file_data: bytes, original_filename: str) -> bytes:
        """
        Create .ssv file format:
        [4 bytes: version]
        [16 bytes: salt]
        [16 bytes: iv]
        [4 bytes: filename length]
        [N bytes: encrypted filename]
        [remaining: encrypted file data]
        """
        encrypted_data, salt, iv = self.encrypt_file(file_data)
        
        # Encrypt filename
        filename_bytes = original_filename.encode('utf-8')
        encrypted_filename, fn_salt, fn_iv = self.encrypt_file(filename_bytes)
        
        # Build SSV format
        version = b'\x00\x00\x00\x01'  # Version 1
        filename_length = len(encrypted_filename).to_bytes(4, byteorder='big')
        
        ssv_data = (
            version +
            salt +
            iv +
            fn_salt +
            fn_iv +
            filename_length +
            encrypted_filename +
            encrypted_data
        )
        
        return ssv_data
    
    def parse_ssv_file(self, ssv_data: bytes) -> Tuple[bytes, str]:
        """
        Parse .ssv file and return (decrypted_data, original_filename)
        """
        # Parse header
        version = ssv_data[0:4]
        salt = ssv_data[4:20]
        iv = ssv_data[20:36]
        fn_salt = ssv_data[36:52]
        fn_iv = ssv_data[52:68]
        filename_length = int.from_bytes(ssv_data[68:72], byteorder='big')
        
        # Extract encrypted filename and data
        encrypted_filename = ssv_data[72:72+filename_length]
        encrypted_data = ssv_data[72+filename_length:]
        
        # Decrypt
        original_filename = self.decrypt_file(encrypted_filename, fn_salt, fn_iv).decode('utf-8')
        original_data = self.decrypt_file(encrypted_data, salt, iv)
        
        return original_data, original_filename

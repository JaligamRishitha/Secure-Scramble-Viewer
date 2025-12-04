from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import EncryptedFile
from app.utils.encryption import FileEncryption
from app.core.config import settings
import os
import mimetypes
from typing import List

router = APIRouter()
encryptor = FileEncryption(settings.SECRET_KEY)

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload and encrypt a file"""
    try:
        # Read file data
        file_data = await file.read()
        
        # Check file size
        if len(file_data) > settings.MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large")
        
        # Encrypt and create SSV file
        ssv_data = encryptor.create_ssv_file(file_data, file.filename)
        
        # Generate unique filename
        file_record = EncryptedFile(
            original_filename=file.filename,
            encrypted_filename=f"{EncryptedFile().id}.ssv",
            file_size=len(file_data),
            mime_type=file.content_type
        )
        
        # Save encrypted file
        encrypted_path = os.path.join(settings.STORAGE_PATH, file_record.encrypted_filename)
        with open(encrypted_path, 'wb') as f:
            f.write(ssv_data)
        
        # Save to database
        db.add(file_record)
        db.commit()
        db.refresh(file_record)
        
        return file_record.to_dict()
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/files")
async def list_files(db: Session = Depends(get_db)):
    """List all uploaded files"""
    files = db.query(EncryptedFile).order_by(EncryptedFile.upload_date.desc()).all()
    return [file.to_dict() for file in files]

@router.get("/download/{file_id}")
async def download_file(file_id: str, db: Session = Depends(get_db)):
    """Download encrypted .ssv file"""
    file_record = db.query(EncryptedFile).filter(EncryptedFile.id == file_id).first()
    
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")
    
    encrypted_path = os.path.join(settings.STORAGE_PATH, file_record.encrypted_filename)
    
    if not os.path.exists(encrypted_path):
        raise HTTPException(status_code=404, detail="File not found on disk")
    
    return FileResponse(
        encrypted_path,
        media_type="application/octet-stream",
        filename=f"{os.path.splitext(file_record.original_filename)[0]}.ssv"
    )

@router.post("/decode")
async def decode_file(file_id: str, db: Session = Depends(get_db)):
    """Decode and return original file (for testing)"""
    file_record = db.query(EncryptedFile).filter(EncryptedFile.id == file_id).first()
    
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")
    
    encrypted_path = os.path.join(settings.STORAGE_PATH, file_record.encrypted_filename)
    
    if not os.path.exists(encrypted_path):
        raise HTTPException(status_code=404, detail="File not found on disk")
    
    try:
        # Read and decrypt
        with open(encrypted_path, 'rb') as f:
            ssv_data = f.read()
        
        original_data, original_filename = encryptor.parse_ssv_file(ssv_data)
        
        # Determine mime type
        mime_type = file_record.mime_type or mimetypes.guess_type(original_filename)[0] or "application/octet-stream"
        
        return StreamingResponse(
            iter([original_data]),
            media_type=mime_type,
            headers={"Content-Disposition": f"attachment; filename={original_filename}"}
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Decryption failed: {str(e)}")

@router.post("/decode-upload")
async def decode_uploaded_file(file: UploadFile = File(...)):
    """Upload a .ssv file and decode it"""
    try:
        # Read the .ssv file
        ssv_data = await file.read()
        
        # Decode it
        original_data, original_filename = encryptor.parse_ssv_file(ssv_data)
        
        # Determine mime type
        mime_type = mimetypes.guess_type(original_filename)[0] or "application/octet-stream"
        
        return StreamingResponse(
            iter([original_data]),
            media_type=mime_type,
            headers={"Content-Disposition": f"attachment; filename={original_filename}"}
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Decryption failed: {str(e)}")

@router.delete("/files/{file_id}")
async def delete_file(file_id: str, db: Session = Depends(get_db)):
    """Delete a file"""
    file_record = db.query(EncryptedFile).filter(EncryptedFile.id == file_id).first()
    
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Delete from disk
    encrypted_path = os.path.join(settings.STORAGE_PATH, file_record.encrypted_filename)
    if os.path.exists(encrypted_path):
        os.remove(encrypted_path)
    
    # Delete from database
    db.delete(file_record)
    db.commit()
    
    return {"message": "File deleted successfully"}

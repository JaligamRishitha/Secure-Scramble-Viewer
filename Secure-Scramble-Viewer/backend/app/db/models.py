from sqlalchemy import Column, String, Integer, DateTime, BigInteger
from sqlalchemy.sql import func
from app.db.database import Base
import uuid

class EncryptedFile(Base):
    __tablename__ = "encrypted_files"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    original_filename = Column(String, nullable=False)
    encrypted_filename = Column(String, nullable=False)
    file_size = Column(BigInteger, nullable=False)
    mime_type = Column(String, nullable=True)
    upload_date = Column(DateTime(timezone=True), server_default=func.now())
    
    def to_dict(self):
        return {
            "file_id": self.id,
            "filename": self.original_filename,
            "size": self.file_size,
            "mime_type": self.mime_type,
            "upload_date": self.upload_date.isoformat() if self.upload_date else None
        }

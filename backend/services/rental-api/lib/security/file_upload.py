"""
안전한 파일 업로드 처리
"""
import os
import hashlib
import magic
import mimetypes
from pathlib import Path
from typing import Optional, List, Tuple
from fastapi import UploadFile, HTTPException, status
from PIL import Image
import io
import uuid
from datetime import datetime

from ..config import settings
from .validation import InputValidator
from .logging import audit_logger, app_logger


class FileUploadSecurity:
    """파일 업로드 보안 클래스"""
    
    # 허용된 MIME 타입
    ALLOWED_MIME_TYPES = {
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png'],
        'image/gif': ['.gif'],
        'image/webp': ['.webp'],
        'application/pdf': ['.pdf'],
        'application/msword': ['.doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'application/vnd.ms-excel': ['.xls'],
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        'text/plain': ['.txt'],
        'text/csv': ['.csv'],
    }
    
    # 위험한 파일 확장자
    DANGEROUS_EXTENSIONS = {
        '.exe', '.dll', '.so', '.dylib', '.bat', '.cmd', '.sh',
        '.ps1', '.vbs', '.js', '.jar', '.app', '.deb', '.rpm',
        '.msi', '.pkg', '.dmg', '.iso', '.img', '.com', '.scr',
        '.hta', '.cpl', '.msc', '.pif', '.gadget', '.wsf',
        '.php', '.asp', '.aspx', '.jsp', '.cgi', '.py', '.rb',
        '.pl', '.bash', '.zsh', '.fish', '.ksh', '.tcl'
    }
    
    # 이미지 최대 크기 (픽셀)
    MAX_IMAGE_WIDTH = 4096
    MAX_IMAGE_HEIGHT = 4096
    
    def __init__(self, upload_dir: str = None):
        self.upload_dir = Path(upload_dir or settings.upload_directory)
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        
        # Magic 인스턴스 (파일 타입 검증용)
        self.file_magic = magic.Magic(mime=True)
    
    async def validate_file(
        self,
        file: UploadFile,
        allowed_types: Optional[List[str]] = None,
        max_size: Optional[int] = None
    ) -> Tuple[bool, Optional[str]]:
        """파일 검증"""
        # 파일명 검증
        if not file.filename:
            return False, "파일명이 없습니다"
        
        # 파일명 소독
        clean_filename = InputValidator.sanitize_string(file.filename)
        if not clean_filename:
            return False, "유효하지 않은 파일명입니다"
        
        # Path Traversal 확인
        if InputValidator.check_path_traversal(file.filename):
            audit_logger.log_security_event(
                "FILE_UPLOAD_PATH_TRAVERSAL",
                "HIGH",
                details={"filename": file.filename}
            )
            return False, "허용되지 않은 파일 경로입니다"
        
        # 확장자 확인
        file_ext = Path(file.filename).suffix.lower()
        if file_ext in self.DANGEROUS_EXTENSIONS:
            audit_logger.log_security_event(
                "FILE_UPLOAD_DANGEROUS_EXTENSION",
                "HIGH",
                details={"filename": file.filename, "extension": file_ext}
            )
            return False, f"허용되지 않은 파일 형식입니다: {file_ext}"
        
        # 허용된 확장자 확인
        if allowed_types is None:
            allowed_types = settings.allowed_upload_extensions
        
        if file_ext not in allowed_types:
            return False, f"허용되지 않은 파일 형식입니다. 허용: {', '.join(allowed_types)}"
        
        # 파일 크기 확인
        if max_size is None:
            max_size = settings.max_upload_size
        
        # 파일 내용 읽기
        contents = await file.read()
        file_size = len(contents)
        
        if file_size > max_size:
            return False, f"파일 크기가 너무 큽니다. 최대: {max_size // (1024*1024)}MB"
        
        if file_size == 0:
            return False, "빈 파일은 업로드할 수 없습니다"
        
        # MIME 타입 확인 (Magic Number)
        try:
            actual_mime = self.file_magic.from_buffer(contents)
            
            # MIME 타입과 확장자 매칭 확인
            if actual_mime in self.ALLOWED_MIME_TYPES:
                allowed_exts = self.ALLOWED_MIME_TYPES[actual_mime]
                if file_ext not in allowed_exts:
                    audit_logger.log_security_event(
                        "FILE_UPLOAD_MIME_MISMATCH",
                        "MEDIUM",
                        details={
                            "filename": file.filename,
                            "extension": file_ext,
                            "mime_type": actual_mime
                        }
                    )
                    return False, "파일 내용과 확장자가 일치하지 않습니다"
            else:
                return False, f"허용되지 않은 파일 형식입니다: {actual_mime}"
            
        except Exception as e:
            app_logger.error(f"파일 타입 확인 실패: {str(e)}")
            return False, "파일 타입을 확인할 수 없습니다"
        
        # 이미지 파일인 경우 추가 검증
        if actual_mime.startswith('image/'):
            is_valid, error_msg = await self._validate_image(contents, actual_mime)
            if not is_valid:
                return False, error_msg
        
        # 파일 포인터 초기화
        await file.seek(0)
        
        return True, None
    
    async def _validate_image(self, contents: bytes, mime_type: str) -> Tuple[bool, Optional[str]]:
        """이미지 파일 추가 검증"""
        try:
            # PIL로 이미지 열기
            image = Image.open(io.BytesIO(contents))
            
            # 이미지 크기 확인
            width, height = image.size
            if width > self.MAX_IMAGE_WIDTH or height > self.MAX_IMAGE_HEIGHT:
                return False, f"이미지 크기가 너무 큽니다. 최대: {self.MAX_IMAGE_WIDTH}x{self.MAX_IMAGE_HEIGHT}"
            
            # 이미지 포맷 확인
            if image.format.lower() not in ['jpeg', 'jpg', 'png', 'gif', 'webp']:
                return False, "지원하지 않는 이미지 형식입니다"
            
            # EXIF 데이터 제거 (개인정보 보호)
            if hasattr(image, '_getexif') and image._getexif():
                # EXIF 데이터가 있으면 제거된 버전으로 저장 필요
                pass
            
            return True, None
            
        except Exception as e:
            app_logger.error(f"이미지 검증 실패: {str(e)}")
            return False, "유효하지 않은 이미지 파일입니다"
    
    async def save_file(
        self,
        file: UploadFile,
        user_id: str,
        category: str = "general"
    ) -> Tuple[str, str]:
        """파일 저장"""
        # 파일 검증
        is_valid, error_msg = await self.validate_file(file)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg
            )
        
        # 저장 경로 생성
        date_path = datetime.now().strftime("%Y/%m/%d")
        category_path = self.upload_dir / category / date_path
        category_path.mkdir(parents=True, exist_ok=True)
        
        # 고유 파일명 생성
        file_ext = Path(file.filename).suffix.lower()
        unique_id = str(uuid.uuid4())
        safe_filename = f"{unique_id}{file_ext}"
        
        file_path = category_path / safe_filename
        
        # 파일 저장
        try:
            contents = await file.read()
            
            # 이미지인 경우 EXIF 제거
            if file.content_type and file.content_type.startswith('image/'):
                contents = await self._remove_exif(contents, file.content_type)
            
            # 파일 쓰기
            with open(file_path, 'wb') as f:
                f.write(contents)
            
            # 파일 권한 설정 (읽기 전용)
            os.chmod(file_path, 0o644)
            
            # 파일 해시 생성 (무결성 확인용)
            file_hash = hashlib.sha256(contents).hexdigest()
            
            # 감사 로그
            audit_logger.log_data_change(
                entity="file",
                entity_id=unique_id,
                action="upload",
                user_id=user_id,
                new_value={
                    "filename": file.filename,
                    "size": len(contents),
                    "type": file.content_type,
                    "hash": file_hash,
                    "path": str(file_path.relative_to(self.upload_dir))
                }
            )
            
            # 상대 경로 반환
            relative_path = file_path.relative_to(self.upload_dir)
            return str(relative_path), file_hash
            
        except Exception as e:
            app_logger.error(f"파일 저장 실패: {str(e)}")
            # 실패 시 파일 삭제
            if file_path.exists():
                file_path.unlink()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="파일 저장에 실패했습니다"
            )
    
    async def _remove_exif(self, image_bytes: bytes, mime_type: str) -> bytes:
        """이미지 EXIF 데이터 제거"""
        try:
            image = Image.open(io.BytesIO(image_bytes))
            
            # EXIF 데이터 제거
            data = list(image.getdata())
            image_without_exif = Image.new(image.mode, image.size)
            image_without_exif.putdata(data)
            
            # 바이트로 변환
            output = io.BytesIO()
            format_name = 'JPEG' if mime_type == 'image/jpeg' else image.format
            image_without_exif.save(output, format=format_name, quality=95)
            
            return output.getvalue()
            
        except Exception as e:
            app_logger.error(f"EXIF 제거 실패: {str(e)}")
            return image_bytes
    
    def delete_file(self, file_path: str, user_id: str) -> bool:
        """파일 삭제"""
        try:
            full_path = self.upload_dir / file_path
            
            if not full_path.exists():
                return False
            
            # 경로 검증
            if not full_path.is_relative_to(self.upload_dir):
                audit_logger.log_security_event(
                    "FILE_DELETE_PATH_TRAVERSAL",
                    "HIGH",
                    user_id=user_id,
                    details={"path": file_path}
                )
                return False
            
            # 파일 삭제
            full_path.unlink()
            
            # 감사 로그
            audit_logger.log_data_change(
                entity="file",
                entity_id=Path(file_path).stem,
                action="delete",
                user_id=user_id,
                old_value={"path": file_path}
            )
            
            return True
            
        except Exception as e:
            app_logger.error(f"파일 삭제 실패: {str(e)}")
            return False
    
    def get_file_url(self, file_path: str) -> str:
        """파일 URL 생성"""
        # 실제 환경에서는 CDN URL 등을 반환
        return f"/files/{file_path}"
    
    def verify_file_hash(self, file_path: str, expected_hash: str) -> bool:
        """파일 무결성 확인"""
        try:
            full_path = self.upload_dir / file_path
            
            if not full_path.exists():
                return False
            
            # 파일 해시 계산
            with open(full_path, 'rb') as f:
                file_hash = hashlib.sha256(f.read()).hexdigest()
            
            return file_hash == expected_hash
            
        except Exception as e:
            app_logger.error(f"파일 해시 확인 실패: {str(e)}")
            return False


# 전역 파일 업로드 보안 인스턴스
file_upload_security = FileUploadSecurity()

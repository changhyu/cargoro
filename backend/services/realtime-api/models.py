from sqlalchemy import Column, String, Text, DateTime, Boolean, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False)
    name = Column(String)
    avatar_url = Column(String)
    last_seen = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    messages = relationship("Message", back_populates="user")
    notifications = relationship("Notification", back_populates="user")

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    room_id = Column(String, nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    attachments = Column(JSON)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    is_edited = Column(Boolean, default=False)
    edited_at = Column(DateTime)
    
    user = relationship("User", back_populates="messages")

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, default="info")  # info, success, warning, error, etc.
    action = Column(JSON)  # {"label": "보기", "url": "/path/to/resource"}
    is_read = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    user = relationship("User", back_populates="notifications")

class Room(Base):
    __tablename__ = "rooms"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    type = Column(String, default="group")  # group, direct, support, etc.
    created_by = Column(String, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    metadata = Column(JSON)  # 추가 정보 저장용
    
class RoomMember(Base):
    __tablename__ = "room_members"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    room_id = Column(String, ForeignKey("rooms.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    joined_at = Column(DateTime, default=datetime.utcnow)
    role = Column(String, default="member")  # admin, moderator, member
    last_read_at = Column(DateTime)
    
class LocationUpdate(Base):
    __tablename__ = "location_updates"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    entity_type = Column(String, nullable=False)  # delivery, vehicle
    entity_id = Column(String, nullable=False, index=True)
    latitude = Column(String, nullable=False)
    longitude = Column(String, nullable=False)
    speed = Column(String)
    heading = Column(String)
    accuracy = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    metadata = Column(JSON)

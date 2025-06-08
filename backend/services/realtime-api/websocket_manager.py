from typing import Dict, Set, List
from fastapi import WebSocket
import json
import asyncio

class WebSocketManager:
    """WebSocket 연결 관리자"""
    
    def __init__(self):
        # 활성 연결: {client_id: WebSocket}
        self.active_connections: Dict[str, WebSocket] = {}
        # 룸 구독: {room_id: Set[client_id]}
        self.rooms: Dict[str, Set[str]] = {}
        # 클라이언트가 속한 룸: {client_id: Set[room_id]}
        self.client_rooms: Dict[str, Set[str]] = {}
    
    async def connect(self, websocket: WebSocket, client_id: str):
        """새 WebSocket 연결 수락"""
        await websocket.accept()
        self.active_connections[client_id] = websocket
        self.client_rooms[client_id] = set()
        print(f"Client {client_id} connected. Total connections: {len(self.active_connections)}")
    
    def disconnect(self, client_id: str):
        """WebSocket 연결 종료"""
        if client_id in self.active_connections:
            # 클라이언트가 속한 모든 룸에서 제거
            for room_id in self.client_rooms.get(client_id, set()).copy():
                self.leave_room(client_id, room_id)
            
            # 연결 제거
            del self.active_connections[client_id]
            if client_id in self.client_rooms:
                del self.client_rooms[client_id]
            
            print(f"Client {client_id} disconnected. Total connections: {len(self.active_connections)}")
    
    def join_room(self, client_id: str, room_id: str):
        """클라이언트를 룸에 추가"""
        if room_id not in self.rooms:
            self.rooms[room_id] = set()
        
        self.rooms[room_id].add(client_id)
        self.client_rooms[client_id].add(room_id)
        print(f"Client {client_id} joined room {room_id}")
    
    def leave_room(self, client_id: str, room_id: str):
        """클라이언트를 룸에서 제거"""
        if room_id in self.rooms and client_id in self.rooms[room_id]:
            self.rooms[room_id].remove(client_id)
            if not self.rooms[room_id]:
                del self.rooms[room_id]
        
        if client_id in self.client_rooms and room_id in self.client_rooms[client_id]:
            self.client_rooms[client_id].remove(room_id)
        
        print(f"Client {client_id} left room {room_id}")
    
    async def send_to_client(self, client_id: str, message: dict):
        """특정 클라이언트에게 메시지 전송"""
        if client_id in self.active_connections:
            websocket = self.active_connections[client_id]
            try:
                await websocket.send_json(message)
            except Exception as e:
                print(f"Error sending message to client {client_id}: {e}")
                self.disconnect(client_id)
    
    async def broadcast(self, message: dict):
        """모든 연결된 클라이언트에게 메시지 브로드캐스트"""
        disconnected_clients = []
        
        for client_id, websocket in self.active_connections.items():
            try:
                await websocket.send_json(message)
            except Exception as e:
                print(f"Error broadcasting to client {client_id}: {e}")
                disconnected_clients.append(client_id)
        
        # 연결이 끊긴 클라이언트 정리
        for client_id in disconnected_clients:
            self.disconnect(client_id)
    
    async def broadcast_to_room(self, room_id: str, message: dict, exclude_client: str = None):
        """특정 룸의 모든 클라이언트에게 메시지 브로드캐스트"""
        if room_id not in self.rooms:
            return
        
        disconnected_clients = []
        
        for client_id in self.rooms[room_id]:
            if client_id == exclude_client:
                continue
            
            if client_id in self.active_connections:
                websocket = self.active_connections[client_id]
                try:
                    await websocket.send_json(message)
                except Exception as e:
                    print(f"Error broadcasting to client {client_id} in room {room_id}: {e}")
                    disconnected_clients.append(client_id)
        
        # 연결이 끊긴 클라이언트 정리
        for client_id in disconnected_clients:
            self.disconnect(client_id)
    
    def get_room_clients(self, room_id: str) -> List[str]:
        """룸에 있는 모든 클라이언트 ID 반환"""
        return list(self.rooms.get(room_id, set()))
    
    def get_client_rooms(self, client_id: str) -> List[str]:
        """클라이언트가 속한 모든 룸 ID 반환"""
        return list(self.client_rooms.get(client_id, set()))
    
    def get_online_users(self) -> List[str]:
        """현재 온라인인 모든 사용자 ID 반환"""
        return list(self.active_connections.keys())
    
    def is_user_online(self, user_id: str) -> bool:
        """특정 사용자의 온라인 상태 확인"""
        return user_id in self.active_connections
    
    async def send_heartbeat(self):
        """모든 연결에 주기적으로 하트비트 전송"""
        while True:
            await asyncio.sleep(30)  # 30초마다
            await self.broadcast({
                "type": "heartbeat",
                "data": {"timestamp": datetime.utcnow().isoformat()}
            })

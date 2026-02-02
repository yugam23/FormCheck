"""
connection_manager.py - WebSocket connection lifecycle management.

Tracks active WebSocket connections for the FormCheck real-time pipeline.
Provides connect/disconnect handlers and utilities for unicast and broadcast
messaging (though this app primarily uses unicast per-client responses).

Connection Limit:
    The main app enforces a 20-connection cap using this manager's
    active_connections count. This prevents resource exhaustion from
    too many concurrent pose detection pipelines.

Thread Safety:
    FastAPI's WebSocket handlers are async, so we don't need explicit
    locks. All operations on active_connections happen in the event loop.
"""

from typing import List, Dict, Any
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        # Keep track of active connections
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        """
        Accept and register a new WebSocket connection.

        Args:
            websocket: FastAPI WebSocket instance to register.
        """
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        """
        Unregister a WebSocket connection (called on close/error).

        Args:
            websocket: FastAPI WebSocket instance to remove.
        """
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        """
        Send a message to a specific connected client.

        Args:
            message: JSON string to send.
            websocket: Target client connection.
        """
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        """
        Send a message to all active connections.

        Args:
            message: JSON string to broadcast.

        Note:
            Currently unused in FormCheck (unicast-only), but available
            for future features like group workouts or leaderboards.
        """
        for connection in self.active_connections:
            await connection.send_text(message)

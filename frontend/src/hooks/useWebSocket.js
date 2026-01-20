import { useState, useEffect, useRef, useCallback } from 'react';

const useWebSocket = (url) => {
    const [lastMessage, setLastMessage] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('Connecting'); // Connecting, Open, Closed, Error
    const socketRef = useRef(null);

    const connect = useCallback(() => {
        try {
            const socket = new WebSocket(url);
            socketRef.current = socket;

            socket.onopen = () => {
                console.log("WebSocket connected");
                setConnectionStatus('Open');
            };

            socket.onmessage = (event) => {
                setLastMessage(event);
            };

            socket.onclose = () => {
                console.log("WebSocket disconnected");
                setConnectionStatus('Closed');
                // Simple reconnect logic (exponential backoff could be better)
                setTimeout(() => connect(), 3000);
            };

            socket.onerror = (error) => {
                console.error("WebSocket error:", error);
                setConnectionStatus('Error');
            };

        } catch (error) {
            console.error("Connection failed:", error);
            setConnectionStatus('Error');
        }
    }, [url]);

    useEffect(() => {
        connect();
        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, [connect]);

    const sendMessage = useCallback((message) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(message);
        }
    }, []);

    return { sendMessage, lastMessage, connectionStatus };
};

export default useWebSocket;

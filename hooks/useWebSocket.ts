// hooks/useWebSocket.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Message } from '@/lib/conect-front';
import { toast } from 'sonner';

export interface WebSocketMessage {
  type: 'incoming' | 'outgoing';
  data?: {
    message: {
      id: string;
      content: string;
      timestamp: string;
      isSent: boolean;
      isReceived: boolean;
      status: string;
      shouldTriggerAI?: boolean;
    };
    contactId?: string;
  };
  phoneNumber?: string;
  message?: string;
  timestamp?: string;
  sessionId?: string;
}

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [activeConnections, setActiveConnections] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.warn('⚠️ useWebSocket: No auth token found for WebSocket connection');
      return;
    }

    // Prevent multiple simultaneous connections
    if (socketRef.current && socketRef.current.connected) {
      console.log('🔌 useWebSocket: Already connected, skipping connection attempt');
      return;
    }

    console.log('🔌 useWebSocket: Attempting to connect to WebSocket...');

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
    // Convert HTTP URL to WebSocket URL
    const WS_URL = API_BASE_URL.replace(/^http/, 'ws');

    const socket = io(`${WS_URL}/ws`, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('✅ useWebSocket: WebSocket connected successfully');
      setIsConnected(true);
      // Emit pong to confirm connection
      socket.emit('pong');
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ useWebSocket: WebSocket disconnected:', reason);
      setIsConnected(false);

      // Simple reconnection logic
      if (reason !== 'io client disconnect') {
        setTimeout(() => {
          console.log('🔄 useWebSocket: Attempting reconnection...');
          connect();
        }, 3000);
      }
    });

    socket.on('connected', (data) => {
      console.log('🔐 useWebSocket: WebSocket authenticated:', data);
      setActiveConnections(data.activeConnections || 0);
    });

    socket.on('subscribed', (data) => {
      console.log('📡 useWebSocket: Subscribed to session:', data.sessionId);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ useWebSocket: Connection error:', error.message);
      setIsConnected(false);
    });

    socketRef.current = socket;
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const onMessage = useCallback((callback: (message: WebSocketMessage) => void) => {
    if (socketRef.current) {
      console.log('👂 useWebSocket: Listening for messages');
      socketRef.current.on('message', callback);
    }
  }, []);

  const offMessage = useCallback((callback?: (message: WebSocketMessage) => void) => {
    if (socketRef.current) {
      console.log('🔇 useWebSocket: Removing message listener');
      if (callback) {
        socketRef.current.off('message', callback);
      } else {
        socketRef.current.off('message');
      }
    }
  }, []);

  const subscribeToSession = useCallback((sessionId: string) => {
    if (socketRef.current && isConnected) {
      console.log('📡 useWebSocket: Subscribing to session:', sessionId);
      socketRef.current.emit('subscribe_session', { sessionId });
    } else {
      console.warn('⚠️ useWebSocket: Cannot subscribe - socket not connected');
    }
  }, [isConnected]);

  const unsubscribeFromSession = useCallback((sessionId: string) => {
    if (socketRef.current && isConnected) {
      console.log('📡 useWebSocket: Unsubscribing from session:', sessionId);
      socketRef.current.emit('unsubscribe_session', { sessionId });
    }
  }, [isConnected]);

  const sendPing = useCallback(() => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('ping');
    }
  }, [isConnected]);

  // Don't auto-connect - let components control when to connect
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    return () => {
      if (!token) {
        disconnect();
      }
    };
  }, [disconnect]);

  useEffect(() => {
    // Ping every 30 seconds to keep connection alive
    const pingInterval = setInterval(sendPing, 30000);

    return () => {
      clearInterval(pingInterval);
      disconnect();
    };
  }, [sendPing, disconnect]);

  return {
    isConnected,
    activeConnections,
    onMessage,
    offMessage,
    subscribeToSession,
    unsubscribeFromSession,
    sendPing,
    disconnect,
    connect,
  };
};
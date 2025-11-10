// hooks/useWebSocketNew.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import webSocketService, { WebSocketMessage } from '../lib/websocket.service';

interface WebSocketEventData {
  userId?: string;
  sessionId?: string;
  message?: string;
  timestamp?: number;
  latency?: number;
}

export const useWebSocketNew = (token: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [wasDisconnectedByInactivity, setWasDisconnectedByInactivity] = useState(false);

  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Limpiar timeouts
  const clearTimeouts = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
      inactivityTimeoutRef.current = null;
    }
  }, []);

  // Conectar al WebSocket
  const connect = useCallback(async () => {
    if (!token) return;

    try {
      setConnectionError(null);
      setWasDisconnectedByInactivity(false);
      await webSocketService.connect(token);
      setIsConnected(true);
    } catch (error) {
      setConnectionError((error as Error).message);
      setIsConnected(false);
    }
  }, [token]);

  // Desconectar del WebSocket
  const disconnect = useCallback(() => {
    clearTimeouts();
    webSocketService.disconnect();
    setIsConnected(false);
    setActiveSessionId(null);
    setWasDisconnectedByInactivity(false);
  }, [clearTimeouts]);

  // Suscribirse a una sesión
  const subscribeToSession = useCallback(async (sessionId: string) => {
    try {
      await webSocketService.subscribeToSession(sessionId);
      setActiveSessionId(sessionId);
    } catch (error) {
      console.error('Error subscribing to session:', error);
      throw error;
    }
  }, []);

  // Desuscribirse de una sesión
  const unsubscribeFromSession = useCallback(async (sessionId: string) => {
    try {
      await webSocketService.unsubscribeFromSession(sessionId);
      setActiveSessionId(null);
    } catch (error) {
      console.error('Error unsubscribing from session:', error);
    }
  }, []);

  // Configurar event listeners
  useEffect(() => {
    const handleConnected = (data?: WebSocketEventData) => {
      setIsConnected(true);
      setWasDisconnectedByInactivity(false);
      clearTimeouts();
    };

    const handleDisconnected = (data?: WebSocketEventData) => {
      setIsConnected(false);
      setActiveSessionId(null);

      // Si se desconectó por inactividad, marcar el flag
      if (data?.message === 'io server disconnect' || data?.message === 'ping timeout') {
        setWasDisconnectedByInactivity(true);
        console.log('WebSocket desconectado por inactividad - no reconectar automáticamente');
      } else {
        // Para otros tipos de desconexión, programar reconexión
        setWasDisconnectedByInactivity(false);
        if (token && !inactivityTimeoutRef.current) {
          inactivityTimeoutRef.current = setTimeout(() => {
            console.log('Intentando reconectar WebSocket...');
            connect();
          }, 3000);
        }
      }
    };

    const handleConnectError = (data?: WebSocketEventData) => {
      setConnectionError(data?.message || 'Connection error');
      setIsConnected(false);
      setWasDisconnectedByInactivity(false);
    };

    const handleSubscribed = (data?: WebSocketEventData) => setActiveSessionId(data?.sessionId || null);
    const handleUnsubscribed = (data?: WebSocketEventData) => setActiveSessionId(null);

    webSocketService.on('connected', handleConnected);
    webSocketService.on('disconnected', handleDisconnected);
    webSocketService.on('connect_error', handleConnectError);
    webSocketService.on('subscribed', handleSubscribed);
    webSocketService.on('unsubscribed', handleUnsubscribed);

    return () => {
      webSocketService.off('connected', handleConnected);
      webSocketService.off('disconnected', handleDisconnected);
      webSocketService.off('connect_error', handleConnectError);
      webSocketService.off('subscribed', handleSubscribed);
      webSocketService.off('unsubscribed', handleUnsubscribed);
      clearTimeouts();
    };
  }, [token, connect, clearTimeouts]);

  // Auto-conectar cuando hay token (solo si no fue desconectado por inactividad)
  useEffect(() => {
    if (token && !isConnected && !wasDisconnectedByInactivity) {
      connect();
    }

    return () => {
      if (!token) {
        disconnect();
      }
    };
  }, [token, connect, disconnect, isConnected, wasDisconnectedByInactivity]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      clearTimeouts();
    };
  }, [clearTimeouts]);

  return {
    isConnected,
    connectionError,
    activeSessionId,
    wasDisconnectedByInactivity,
    connect,
    disconnect,
    subscribeToSession,
    unsubscribeFromSession,
  };
};
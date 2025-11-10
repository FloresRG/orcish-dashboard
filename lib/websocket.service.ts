// lib/websocket.service.ts
import { io, Socket } from 'socket.io-client';

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

interface WebSocketEventData {
  userId?: string;
  sessionId?: string;
  message?: string;
  timestamp?: number;
  latency?: number;
}

type WebSocketEventCallback = (data?: WebSocketEventData) => void;

class WebSocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private activeSessionId: string | null = null;
  private eventListeners = new Map<string, WebSocketEventCallback[]>();

  constructor() {
    this.eventListeners = new Map();
  }

  // PASO CRÍTICO: Conectar Y suscribirse automáticamente
  async connect(token: string, sessionId?: string): Promise<void> {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io('ws://localhost:3000/ws', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    return new Promise((resolve, reject) => {
      // 1. Esperar conexión exitosa
      this.socket!.on('connected', async (data: WebSocketEventData) => {
        console.log('✅ WebSocket conectado:', data.userId);
        this.isConnected = true;

        // 2. INMEDIATAMENTE suscribirse a la sesión
        if (sessionId) {
          try {
            await this.subscribeToSession(sessionId);
            console.log('✅ Suscrito a sesión:', sessionId);
            resolve();
          } catch (error) {
            console.error('❌ Error suscribiéndose:', error);
            reject(error);
          }
        } else {
          resolve();
        }
      });

      // 3. Manejar errores
      this.socket!.on('connect_error', (error: Error) => {
        console.error('❌ Error conectando WebSocket:', error);
        this.isConnected = false;
        reject(error);
      });

      // 4. Manejar desconexión
      this.socket!.on('disconnect', (reason: string) => {
        console.log('🔌 WebSocket desconectado:', reason);
        this.isConnected = false;
        this.activeSessionId = null;
        this.emit('disconnected', { message: reason });
      });

      // 5. Escuchar mensajes
      this.socket!.on('message', (message: WebSocketMessage) => {
        this.handleMessage(message);
      });

      // 6. Escuchar confirmación de suscripción
      this.socket!.on('subscribed', (data: WebSocketEventData) => {
        this.emit('subscribed', data);
      });

      // 7. Escuchar confirmación de desuscripción
      this.socket!.on('unsubscribed', (data: WebSocketEventData) => {
        this.emit('unsubscribed', data);
      });
    });
  }

  // PASO CRÍTICO: Suscribirse a sesión
  async subscribeToSession(sessionId: string): Promise<WebSocketEventData> {
    if (!this.socket || !this.isConnected) {
      throw new Error('WebSocket no conectado');
    }

    return new Promise((resolve, reject) => {
      console.log('📡 Enviando subscribe_session:', sessionId);
      this.socket!.emit('subscribe_session', { sessionId });

      // Esperar confirmación
      const onSubscribed = (data: WebSocketEventData) => {
        if (data.sessionId === sessionId) {
          this.socket!.off('subscribed', onSubscribed);
          this.activeSessionId = sessionId;
          console.log('✅ Confirmación de suscripción:', data);
          resolve(data);
        }
      };

      this.socket!.on('subscribed', onSubscribed);

      // Timeout
      setTimeout(() => {
        this.socket!.off('subscribed', onSubscribed);
        reject(new Error('Timeout subscribing to session'));
      }, 5000);
    });
  }

  // Desconectar
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.activeSessionId = null;
    }
  }

  // Desuscribirse de una sesión
  async unsubscribeFromSession(sessionId: string): Promise<WebSocketEventData | { sessionId: string; message: string }> {
    if (!this.socket || !this.isConnected) {
      return Promise.resolve({ sessionId, message: 'Not connected' });
    }

    return new Promise((resolve) => {
      this.socket!.emit('unsubscribe_session', { sessionId });

      const onUnsubscribed = (data: WebSocketEventData) => {
        if (data.sessionId === sessionId) {
          this.socket!.off('unsubscribed', onUnsubscribed);
          if (this.activeSessionId === sessionId) {
            this.activeSessionId = null;
          }
          resolve(data);
        }
      };

      this.socket!.on('unsubscribed', onUnsubscribed);

      // Resolver después de 2 segundos si no hay respuesta
      setTimeout(() => {
        this.socket!.off('unsubscribed', onUnsubscribed);
        resolve({ sessionId, message: 'Unsubscribed (timeout)' });
      }, 2000);
    });
  }

  // PASO CRÍTICO: Manejar mensajes
  private handleMessage(message: WebSocketMessage): void {
    console.log('📨 Mensaje WebSocket recibido:', message);

    switch (message.type) {
      case 'incoming':
        console.log('📥 Mensaje entrante desde WhatsApp');
        this.emit('message_incoming', {
          sessionId: message.sessionId,
          message: message.data?.message.content,
          timestamp: message.data?.message.timestamp ? new Date(message.data.message.timestamp).getTime() : undefined
        });
        break;
      case 'outgoing':
        console.log('📤 Mensaje saliente enviado');
        this.emit('message_outgoing', {
          sessionId: message.sessionId,
          message: message.data?.message.content,
          timestamp: message.data?.message.timestamp ? new Date(message.data.message.timestamp).getTime() : undefined
        });
        break;
      default:
        console.log('❓ Tipo de mensaje desconocido:', message.type);
    }
  }

  // Sistema de eventos simple
  on(event: string, callback: WebSocketEventCallback): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: WebSocketEventCallback): void {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event)!;
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: WebSocketEventData): void {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event)!.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event callback:', error);
        }
      });
    }
  }

  // Verificar conexión
  ping(): Promise<WebSocketEventData & { latency: number }> {
    if (!this.socket || !this.isConnected) {
      return Promise.reject(new Error('WebSocket no conectado'));
    }

    return new Promise((resolve, reject) => {
      const timestamp = Date.now();
      this.socket!.emit('ping', { timestamp });

      const onPong = (data: WebSocketEventData) => {
        this.socket!.off('pong', onPong);
        resolve({ ...data, latency: Date.now() - timestamp });
      };

      this.socket!.on('pong', onPong);

      setTimeout(() => {
        this.socket!.off('pong', onPong);
        reject(new Error('Ping timeout'));
      }, 5000);
    });
  }

  // Getters
  getIsConnected(): boolean {
    return this.isConnected;
  }

  getActiveSessionId(): string | null {
    return this.activeSessionId;
  }
}

// Exportar instancia singleton
export const webSocketService = new WebSocketService();
export default webSocketService;
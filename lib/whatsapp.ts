// lib/whatsapp.ts
import { User } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export enum SessionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  QR_PENDING = 'qr_pending',
  ERROR = 'error'
}

export interface WhatsAppSession {
  id: string;
  phoneNumber: string;
  status: SessionStatus;
  lastConnection?: string;
  createdAt: string;
  updatedAt?: string;
  qrCode?: string;
  qrGeneratedAt?: string;
  qrExpiresAt?: string;
  qrScanned?: boolean;
  autoResponseEnabled?: boolean;
  privateResponseMessage?: string;
  groupResponseMessage?: string;
  totalMessagesSent?: number;
  privateMessagesSent?: number;
  groupMessagesSent?: number;
  lastAutoResponseAt?: string;
}

export interface CreateSessionRequest {
  phoneNumber: string;
}

export interface CreateSessionResponse {
  sessionId: string;
  phoneNumber: string;
  status: SessionStatus;
}

export interface QRCodeResponse {
  qrCode: string;
  status: SessionStatus;
  expiresAt?: string;
  generatedAt?: string;
  scanned?: boolean;
}

export interface SessionStatusResponse {
  sessionId: string;
  phoneNumber: string;
  status: SessionStatus;
  lastConnection?: string;
}

export const createWhatsAppSession = async (phoneNumber: string): Promise<CreateSessionResponse> => {
  const token = localStorage.getItem('auth_token');
  if (!token) throw new Error('No authentication token found');

  const res = await fetch(`${API_BASE_URL}/api/v1/whatsapp/session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ phoneNumber }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error ${res.status}: ${errorText}`);
  }

  return res.json();
};

export const getQRCode = async (sessionId: string): Promise<QRCodeResponse> => {
  const token = localStorage.getItem('auth_token');
  if (!token) throw new Error('No authentication token found');

  const res = await fetch(`${API_BASE_URL}/api/v1/whatsapp/qr/${sessionId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error ${res.status}: ${errorText}`);
  }

  return res.json();
};

export const getSessionStatus = async (sessionId: string): Promise<SessionStatusResponse> => {
  const token = localStorage.getItem('auth_token');
  if (!token) throw new Error('No authentication token found');

  const res = await fetch(`${API_BASE_URL}/api/v1/whatsapp/status/${sessionId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error ${res.status}: ${errorText}`);
  }

  return res.json();
};


export interface AutoResponseConfig {
  privateMessage: string;
  groupMessage: string;
  enabled: boolean;
}

export interface AutoResponseStats {
  sessionId: string;
  enabled: boolean;
  totalMessagesSent: number;
  privateMessages: number;
  groupMessages: number;
  lastActivity: string;
  messagesLast24h: number;
  averagePerDay: number;
}

export const updateAutoResponse = async (sessionId: string, config: AutoResponseConfig): Promise<void> => {
  const token = localStorage.getItem('auth_token');
  if (!token) throw new Error('No authentication token found');

  const res = await fetch(`${API_BASE_URL}/api/v1/whatsapp/auto-response/${sessionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(config),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error ${res.status}: ${errorText}`);
  }
};

export const getAutoResponseStats = async (sessionId: string): Promise<AutoResponseStats> => {
  const token = localStorage.getItem('auth_token');
  if (!token) throw new Error('No authentication token found');

  const res = await fetch(`${API_BASE_URL}/api/v1/whatsapp/auto-response/stats/${sessionId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error ${res.status}: ${errorText}`);
  }

  return res.json();
};

export const toggleAutoResponse = async (sessionId: string, enabled: boolean): Promise<void> => {
  const token = localStorage.getItem('auth_token');
  if (!token) throw new Error('No authentication token found');

  const res = await fetch(`${API_BASE_URL}/api/v1/whatsapp/auto-response/toggle/${sessionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ enabled }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error ${res.status}: ${errorText}`);
  }
};

export const getAutoResponseConfig = async (sessionId: string): Promise<AutoResponseConfig> => {
  const token = localStorage.getItem('auth_token');
  if (!token) throw new Error('No authentication token found');

  const res = await fetch(`${API_BASE_URL}/api/v1/whatsapp/auto-response/config/${sessionId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error ${res.status}: ${errorText}`);
  }

  return res.json();
};

export const deleteWhatsAppSession = async (sessionId: string): Promise<void> => {
  const token = localStorage.getItem('auth_token');
  if (!token) throw new Error('No authentication token found');

  const res = await fetch(`${API_BASE_URL}/api/v1/whatsapp/session/${sessionId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error ${res.status}: ${errorText}`);
  }
};

export const testAutoResponse = async (sessionId: string, phoneNumber: string, messageType: 'private' | 'group'): Promise<void> => {
  const token = localStorage.getItem('auth_token');
  if (!token) throw new Error('No authentication token found');

  const res = await fetch(`${API_BASE_URL}/api/v1/whatsapp/auto-response/test/${sessionId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ phoneNumber, messageType }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error ${res.status}: ${errorText}`);
  }
};

export const getWhatsAppSessions = async (): Promise<WhatsAppSession[]> => {
  const token = localStorage.getItem('auth_token');
  if (!token) throw new Error('No authentication token found');

  console.log('📱 Loading WhatsApp sessions');

  const res = await fetch(`${API_BASE_URL}/api/v1/whatsapp/sessions`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  console.log('📡 Sessions API response status:', res.status);

  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ Sessions API error:', errorText);
    throw new Error(`Error ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  console.log('✅ WhatsApp sessions loaded:', data.length || 0, 'sessions');
  return data;
};
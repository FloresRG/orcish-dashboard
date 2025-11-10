// lib/conect-front.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  estado: string;
  ia: boolean;
  registrado: boolean;
  fecha: string;
  messageCount: number;
  lastMessage?: {
    content: string;
    fecha: string;
    estado: string;
  };
}

export interface Message {
  id: string;
  content: string;
  timestamp: string;
  isSent: boolean;
  isReceived: boolean;
  type: string;
  tipo_mensaje?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ContactsResponse {
  contacts: Contact[];
  pagination: PaginationInfo;
}

export interface MessagesResponse {
  contact: {
    id: string;
    name: string;
    phone: string;
  };
  messages: Message[];
  pagination: PaginationInfo;
}

export interface SendMessageRequest {
  message: string;
}

export interface SendMessageResponse {
  id: string;
  content: string;
  timestamp: string;
  isSent: boolean;
}

export interface WebSocketStatus {
  isConnected: boolean;
  activeConnections: number;
}

const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

export const getContacts = async (
  sessionId: string,
  page = 1,
  limit = 10,
  search = ''
): Promise<ContactsResponse> => {
  const token = getAuthToken();
  if (!token) throw new Error('No authentication token found');

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search })
  });

  console.log('🔍 Loading contacts for session:', sessionId, { page, limit, search });

  const res = await fetch(`${API_BASE_URL}/api/v1/conect-front/contacts/${sessionId}?${params}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  console.log('📡 Contacts API response status:', res.status);

  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ Contacts API error:', errorText);
    throw new Error(`Error ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  console.log('✅ Contacts loaded:', data.contacts?.length || 0, 'contacts for session:', sessionId);
  return data;
};

export const getMessages = async (
  sessionId: string,
  contactId: string,
  page = 1,
  limit = 20
): Promise<MessagesResponse> => {
  const token = getAuthToken();
  if (!token) throw new Error('No authentication token found');

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  console.log('💬 Loading messages for session/contact:', sessionId, contactId, { page, limit });

  const res = await fetch(
    `${API_BASE_URL}/api/v1/conect-front/contacts/${sessionId}/${contactId}/messages?${params}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  console.log('📡 Messages API response status:', res.status);

  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ Messages API error:', errorText);
    throw new Error(`Error ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  console.log('✅ Messages loaded:', data.messages?.length || 0, 'messages for contact:', data.contact?.name);
  return data;
};

export const sendMessage = async (
  sessionId: string,
  contactId: string,
  message: string
): Promise<SendMessageResponse> => {
  const token = getAuthToken();
  if (!token) throw new Error('No authentication token found');

  console.log('📤 Sending message to session/contact:', sessionId, contactId, 'Message:', message.substring(0, 50) + (message.length > 50 ? '...' : ''));

  const res = await fetch(
    `${API_BASE_URL}/api/v1/conect-front/contacts/${sessionId}/${contactId}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    }
  );

  console.log('📡 Send message API response status:', res.status);

  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ Send message API error:', errorText);
    throw new Error(`Error ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  console.log('✅ Message sent successfully:', data.id);
  return data;
};

export const getWebSocketStatus = async (sessionId: string): Promise<WebSocketStatus> => {
  const token = getAuthToken();
  if (!token) throw new Error('No authentication token found');

  console.log('🔌 Checking WebSocket status for session:', sessionId);

  const res = await fetch(`${API_BASE_URL}/api/v1/conect-front/status/${sessionId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  console.log('📡 WebSocket status API response:', res.status);

  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ WebSocket status API error:', errorText);
    throw new Error(`Error ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  console.log('✅ WebSocket status:', data);
  return data;
};
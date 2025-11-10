// lib/conect-front.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export interface Contact {
  id_contac: string;
  name?: string | null;
  nombre_completo: string;
  phone?: string | null;
  estado?: 'frio' | 'tibio' | 'caliente' | null;
  ia?: boolean | null;
  registrado?: boolean | null;
  fecha?: string | null;
  messageCount?: number;
  lastMessage?: {
    content: string;
    fecha: string;
    estado: string;
  };
  user?: {
    id: string;
    email: string;
    name: string;
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

export interface CreateContactRequest {
  phone?: string;
  nombre_completo: string;
  estado?: 'frio' | 'tibio' | 'caliente';
  ia?: boolean;
  registrado?: boolean;
}

export interface UpdateContactRequest {
  estado?: 'frio' | 'tibio' | 'caliente';
  ia?: boolean;
  nombre_completo?: string;
  phone?: string;
  registrado?: boolean;
}

export interface SendMessageToContactRequest {
  userId: string;
  phone: string;
  message: string;
}

export interface ToggleIARequest {
  ia: boolean;
}

export interface ContactMessagesResponse {
  id: string;
  mensaje: string;
  type: string;
  estado: string;
  fecha: string;
  tipo_mensaje: string;
}

export interface UpdateWaitingMessagesResponse {
  cantidad: number;
  mensaje: string;
}

export interface ToggleIAResponse {
  message: string;
  phone: string;
  ia: boolean;
}

export interface SendMessageResponse {
  message: string;
  result: Record<string, unknown>; // WhatsApp API response
}

export interface SendMessageAlternativeResponse {
  status: string;
  message: string;
  result: Record<string, unknown>; // WhatsApp API response
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

// New contact management functions
export const getAllContacts = async (): Promise<Contact[]> => {
  const token = getAuthToken();
  if (!token) throw new Error('No authentication token found');

  console.log('📋 Getting all contacts (ADMIN only)');

  const res = await fetch(`${API_BASE_URL}/api/v1/contact`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error ${res.status}: ${errorText}`);
  }

  return res.json();
};

export const getContactsByUser = async (userId: string): Promise<Contact[]> => {
  const token = getAuthToken();
  if (!token) throw new Error('No authentication token found');

  console.log('📋 Getting contacts for user:', userId);

  const res = await fetch(`${API_BASE_URL}/api/v1/contact/user/${userId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error ${res.status}: ${errorText}`);
  }

  return res.json();
};

export const createContact = async (userId: string, contactData: CreateContactRequest): Promise<Contact> => {
  const token = getAuthToken();
  if (!token) throw new Error('No authentication token found');

  console.log('➕ Creating contact for user:', userId, contactData);

  const res = await fetch(`${API_BASE_URL}/api/v1/contact/user/${userId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(contactData),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error ${res.status}: ${errorText}`);
  }

  return res.json();
};

export const getContactById = async (userId: string, contactId: string): Promise<Contact> => {
  const token = getAuthToken();
  if (!token) throw new Error('No authentication token found');

  console.log('📋 Getting contact by ID:', contactId, 'for user:', userId);

  const res = await fetch(`${API_BASE_URL}/api/v1/contact/user/${userId}/${contactId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error ${res.status}: ${errorText}`);
  }

  return res.json();
};

export const updateContact = async (userId: string, contactId: string, updateData: UpdateContactRequest): Promise<Contact> => {
  const token = getAuthToken();
  if (!token) throw new Error('No authentication token found');

  console.log('✏️ Updating contact:', contactId, 'for user:', userId, updateData);

  const res = await fetch(`${API_BASE_URL}/api/v1/contact/user/${userId}/${contactId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error ${res.status}: ${errorText}`);
  }

  return res.json();
};

export const deleteContact = async (userId: string, contactId: string): Promise<{ message: string }> => {
  const token = getAuthToken();
  if (!token) throw new Error('No authentication token found');

  console.log('🗑️ Deleting contact:', contactId, 'for user:', userId);

  const res = await fetch(`${API_BASE_URL}/api/v1/contact/user/${userId}/${contactId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error ${res.status}: ${errorText}`);
  }

  return res.json();
};

export const getContactMessages = async (contactId: string): Promise<ContactMessagesResponse[]> => {
  const token = getAuthToken();
  if (!token) throw new Error('No authentication token found');

  console.log('💬 Getting messages for contact:', contactId);

  const res = await fetch(`${API_BASE_URL}/api/v1/contact/messages/${contactId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error ${res.status}: ${errorText}`);
  }

  return res.json();
};

export const getMessagesByPhone = async (phone: string): Promise<ContactMessagesResponse[]> => {
  const token = getAuthToken();
  if (!token) throw new Error('No authentication token found');

  console.log('📱 Getting messages for phone:', phone);

  const res = await fetch(`${API_BASE_URL}/api/v1/contact/messages/phone/${phone}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error ${res.status}: ${errorText}`);
  }

  return res.json();
};

export const updateWaitingMessages = async (phone: string): Promise<UpdateWaitingMessagesResponse> => {
  const token = getAuthToken();
  if (!token) throw new Error('No authentication token found');

  console.log('⏳ Updating waiting messages for phone:', phone);

  const res = await fetch(`${API_BASE_URL}/api/v1/contact/actualizar-estados/${phone}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error ${res.status}: ${errorText}`);
  }

  return res.json();
};

export const toggleContactIA = async (phone: string, ia: boolean): Promise<ToggleIAResponse> => {
  const token = getAuthToken();
  if (!token) throw new Error('No authentication token found');

  console.log('🤖 Toggling IA for phone:', phone, 'to:', ia);

  const res = await fetch(`${API_BASE_URL}/api/v1/contact/cambiar-ia/${phone}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ia }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error ${res.status}: ${errorText}`);
  }

  return res.json();
};

export const deleteMessagesByPhone = async (phone: string): Promise<{ message: string }> => {
  const token = getAuthToken();
  if (!token) throw new Error('No authentication token found');

  console.log('🗑️ Deleting messages for phone:', phone);

  const res = await fetch(`${API_BASE_URL}/api/v1/contact/messages/${phone}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error ${res.status}: ${errorText}`);
  }

  return res.json();
};

export const sendMessageToContact = async (data: SendMessageToContactRequest): Promise<SendMessageResponse> => {
  const token = getAuthToken();
  if (!token) throw new Error('No authentication token found');

  console.log('📤 Sending message to contact:', data.phone);

  const res = await fetch(`${API_BASE_URL}/api/v1/contact/enviar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error ${res.status}: ${errorText}`);
  }

  return res.json();
};

export const sendMessageAlternative = async (data: SendMessageToContactRequest): Promise<SendMessageAlternativeResponse> => {
  const token = getAuthToken();
  if (!token) throw new Error('No authentication token found');

  console.log('📤 Sending message alternative to contact:', data.phone);

  const res = await fetch(`${API_BASE_URL}/api/v1/contact/sendMessage`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error ${res.status}: ${errorText}`);
  }

  return res.json();
};
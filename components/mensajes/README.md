# Conect Front API - Documentación para Frontend

Esta documentación describe las APIs del módulo `conect-front` diseñadas específicamente para la integración con el frontend de chat estilo WhatsApp.

## Base URL
```
http://localhost:3000/api/v1/conect-front
```

## WebSocket URL
```
ws://localhost:3000/ws
```

## Autenticación
Todas las rutas requieren autenticación JWT. Incluye el token en el header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Endpoints

### 1. Obtener Lista de Contactos

**GET** `/contacts/{sessionId}`

Obtiene la lista paginada de contactos de una sesión específica con información adicional como conteo de mensajes y último mensaje.

#### Parámetros de Query
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10, max: 50)
- `search` (opcional): Término de búsqueda por nombre o teléfono

#### Ejemplo de Request (con token real y sesión c80bb801-6fbc-4ee3-bb1a-d8048440d1eb)
```bash
GET /api/v1/conect-front/contacts/c80bb801-6fbc-4ee3-bb1a-d8048440d1eb?page=1&limit=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYjc1MjQ1Yi1hNzZmLTRlMTctOWUxMi1hMzA5NDNhMDgzZDQiLCJlbWFpbCI6InVzdWFyaW9AZWplbXBsby5jb20iLCJyb2xlIjoidXN1YXJpbyIsImlhdCI6MTc2MjcyNDYzOSwiZXhwIjoxNzYyODExMDM5fQ.6bTM7Q9e90NyjdBgvoNi0fZZ9BcpkjKFYw0GwxnuoLc
```

#### Ejemplo de Response (con datos reales de sesión c80bb801-6fbc-4ee3-bb1a-d8048440d1eb)
```json
{
  "contacts": [
    {
      "id": "ff5927a5-1900-4bb5-98f0-a3e4cecf927c",
      "name": "59169867332",
      "phone": "59169867332",
      "estado": "frio",
      "ia": false,
      "registrado": false,
      "fecha": "2025-10-11T23:16:41.262Z",
      "messageCount": 2,
      "lastMessage": {
        "content": "🤖 Estás hablando con PosGrading - Sistema automatizado de respuestas",
        "fecha": "2025-11-10T01:41:51.713Z",
        "estado": "enviado"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

#### Implementación en Frontend
```javascript
// Función para cargar contactos con paginación infinita
async function loadContacts(page = 1, search = '') {
  const response = await fetch(`/api/v1/conect-front/contacts?page=${page}&limit=10&search=${search}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();

  // Agregar contactos a la lista existente
  contacts.push(...data.contacts);

  // Verificar si hay más páginas
  hasMoreContacts = data.pagination.hasNext;
  currentPage = page;

  return data.contacts;
}

// Cargar más contactos cuando el usuario llegue al final
function loadMoreContacts() {
  if (hasMoreContacts) {
    loadContacts(currentPage + 1, searchTerm);
  }
}
```

### 2. Obtener Historial de Mensajes de un Contacto

**GET** `/contacts/{sessionId}/{contactId}/messages`

Obtiene el historial de mensajes de un contacto específico de una sesión con paginación.

#### Parámetros de Path
- `contactId`: ID del contacto

#### Parámetros de Query
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Mensajes por página (default: 20, max: 100)

#### Ejemplo de Request (con datos reales)
```bash
GET /api/v1/conect-front/contacts/c80bb801-6fbc-4ee3-bb1a-d8048440d1eb/ff5927a5-1900-4bb5-98f0-a3e4cecf927c/messages?page=1&limit=20
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYjc1MjQ1Yi1hNzZmLTRlMTctOWUxMi1hMzA5NDNhMDgzZDQiLCJlbWFpbCI6InVzdWFyaW9AZWplbXBsby5jb20iLCJyb2xlIjoidXN1YXJpbyIsImlhdCI6MTc2MjcyNDYzOSwiZXhwIjoxNzYyODExMDM5fQ.6bTM7Q9e90NyjdBgvoNi0fZZ9BcpkjKFYw0GwxnuoLc
```

#### Ejemplo de Response (con datos reales)
```json
{
  "contact": {
    "id": "ff5927a5-1900-4bb5-98f0-a3e4cecf927c",
    "name": "59169867332",
    "phone": "59169867332",
    "estado": "frio",
    "ia": false,
    "registrado": false
  },
  "messages": [
    {
      "id": "7b9dd0ec-2bc7-4a4a-939d-14b1820dab2f",
      "content": "🤖 Estás hablando con PosGrading - Sistema automatizado de respuestas",
      "timestamp": "2025-11-10T01:00:45.175Z",
      "isSent": true,
      "isReceived": false,
      "type": "contact",
      "tipo_mensaje": "espera"
    },
    {
      "id": "ff223ebe-9d7d-473b-b519-75e2123d61ef",
      "content": "Hola",
      "timestamp": "2025-11-10T01:00:44.905Z",
      "isSent": false,
      "isReceived": true,
      "type": "contact",
      "tipo_mensaje": "espera"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

#### Implementación en Frontend
```javascript
// Función para cargar mensajes de un contacto
async function loadMessages(contactId, page = 1) {
  const response = await fetch(`/api/v1/conect-front/contacts/${contactId}/messages?page=${page}&limit=20`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();

  // Para primera carga, reemplazar mensajes
  if (page === 1) {
    messages = data.messages;
  } else {
    // Para carga de más mensajes, agregar al inicio (mensajes más antiguos)
    messages.unshift(...data.messages);
  }

  // Actualizar información del contacto
  currentContact = data.contact;

  // Verificar si hay más mensajes
  hasMoreMessages = data.pagination.hasNext;

  return data.messages;
}

// Cargar mensajes más antiguos (scroll hacia arriba)
function loadOlderMessages() {
  if (hasMoreMessages) {
    loadMessages(currentContactId, currentMessagePage + 1);
  }
}
```

### 3. Enviar Mensaje a un Contacto

**POST** `/contacts/{sessionId}/{contactId}/messages`

Envía un mensaje a un contacto específico usando una sesión de WhatsApp.

#### Parámetros de Path
- `contactId`: ID del contacto

#### Body
```json
{
  "message": "Hola, gracias por contactarnos. ¿En qué podemos ayudarte?"
}
```

#### Ejemplo de Request (con datos reales)
```bash
POST /api/v1/conect-front/contacts/c80bb801-6fbc-4ee3-bb1a-d8048440d1eb/ff5927a5-1900-4bb5-98f0-a3e4cecf927c/messages
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYjc1MjQ1Yi1hNzZmLTRlMTctOWUxMi1hMzA5NDNhMDgzZDQiLCJlbWFpbCI6InVzdWFyaW9AZWplbXBsby5jb20iLCJyb2xlIjoidXN1YXJpbyIsImlhdCI6MTc2MjcyMTg5OSwiZXhwIjoxNzYyODA4Mjk5fQ.0BKNIoZID5VDnd2GJln9C0XCBbkAPBrNBAEHo0mlKbU

{
  "message": "¡Hola! Gracias por contactarnos. ¿En qué podemos ayudarte?"
}
```

#### Ejemplo de Response
```json
{
  "id": "message-uuid-new",
  "content": "¡Hola! ¿En qué podemos ayudarte hoy?",
  "timestamp": "2024-01-15T14:30:00.000Z",
  "isSent": true
}
```

#### Implementación en Frontend
```javascript
// Función para enviar mensaje
async function sendMessage(contactId, messageText) {
  try {
    const response = await fetch(`/api/v1/conect-front/contacts/${contactId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: messageText
      })
    });

    const sentMessage = await response.json();

    // Agregar mensaje a la lista local
    messages.push(sentMessage);

    // Scroll al final del chat
    scrollToBottom();

    return sentMessage;
  } catch (error) {
    console.error('Error sending message:', error);
    // Mostrar error al usuario
    showError('No se pudo enviar el mensaje');
  }
}

// Event listener para el formulario de envío
sendForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const messageText = messageInput.value.trim();
  if (messageText) {
    sendMessage(currentContactId, messageText);
    messageInput.value = '';
  }
});
```

### 4. Obtener Estado de Conexión WebSocket

**GET** `/status/{sessionId}`

Obtiene el estado de conexión de una sesión específica al WebSocket.

#### Ejemplo de Request
```bash
GET /api/v1/conect-front/status/c80bb801-6fbc-4ee3-bb1a-d8048440d1eb
```

#### Ejemplo de Response
```json
{
  "isConnected": true,
  "activeConnections": 5
}
```

## WebSocket Integration

### Estado Actual del Sistema

**✅ Backend corriendo en puerto 3000**
- APIs REST funcionando
- WebSocket Gateway inicializado
- **WebSocket URL**: `ws://localhost:3000/ws`

**✅ Frontend corriendo en puerto 3001**

**✅ Configuración del .env:**
```env
PORT=3000
NODE_ENV=development
```

### Conexión WebSocket

Conéctate al WebSocket usando el token JWT:

```javascript
// Conectar al WebSocket
const socket = io('ws://localhost:3000/ws', {
  auth: {
    token: localStorage.getItem('token')
  },
  transports: ['websocket', 'polling'], // Permitir fallback a polling
  upgrade: true, // Intentar upgrade a WebSocket
  rememberUpgrade: true, // Recordar si el upgrade funcionó
  timeout: 20000, // Timeout de conexión
});

// Suscribirse a una sesión específica para recibir mensajes filtrados
socket.emit('subscribe_session', { sessionId: 'c80bb801-6fbc-4ee3-bb1a-d8048440d1eb' });

// Escuchar eventos de mensajes
socket.on('message', (data) => {
  console.log('Nuevo mensaje recibido:', data);

  // Los mensajes ahora están filtrados por sesión
  if (data.type === 'message_sent') {
    // Mensaje enviado desde este cliente
    handleMessageSent(data.data);
  } else if (data.type === 'incoming') {
    // Nuevo mensaje entrante en esta sesión
    handleIncomingMessage(data);
  } else if (data.type === 'outgoing') {
    // Mensaje saliente confirmado en esta sesión
    handleOutgoingMessage(data);
  }
});

// Confirmar suscripción
socket.on('subscribed', (data) => {
  console.log('Suscrito a sesión:', data.sessionId);
});

// Confirmar conexión
socket.on('connected', (data) => {
  console.log('Conectado al WebSocket:', data);
});

// Función para manejar mensajes entrantes (desde WhatsApp)
function handleIncomingMessage(data) {
  // Los mensajes ya están filtrados por sesión
  // Para mensajes entrantes, el contactId puede ser null inicialmente
  const contactIdentifier = data.contactId || data.phoneNumber?.replace('@s.whatsapp.net', '');

  if (contactIdentifier === currentContact?.id || contactIdentifier === currentContact?.phone) {
    // Es del contacto actual - agregar a la conversación
    messages.push({
      id: Date.now().toString(),
      content: data.message,
      timestamp: data.timestamp,
      isSent: false,
      isReceived: true,
      type: 'whatsapp_incoming',
      sessionId: data.sessionId,
      phoneNumber: data.phoneNumber
    });

    // Actualizar UI
    renderMessages();
    scrollToBottom();

    // Actualizar lista de contactos (último mensaje)
    updateContactLastMessage(contactIdentifier, data.message, data.timestamp);
  } else {
    // Es de otro contacto - mostrar notificación
    showNotification(contactIdentifier, data.message);
  }

  // Reproducir sonido de mensaje entrante
  playIncomingMessageSound();
}

// Función para manejar mensajes enviados (confirmación)
function handleMessageSent(data) {
  // Confirmar que el mensaje se envió correctamente
  const messageIndex = messages.findIndex(m => m.id === data.message.id);
  if (messageIndex !== -1) {
    messages[messageIndex].status = 'sent';
    messages[messageIndex].timestamp = data.message.timestamp;
    renderMessages();
  }
}

// Función para manejar mensajes salientes (desde el sistema)
function handleOutgoingMessage(data) {
  // Mensajes salientes del sistema (auto-respuestas, etc.)
  if (data.contactId === currentContact?.id || data.phoneNumber === currentContact?.phone) {
    messages.push({
      id: Date.now().toString(),
      content: data.message,
      timestamp: data.timestamp,
      isSent: true,
      isReceived: false,
      type: 'system_outgoing',
      sessionId: data.sessionId
    });

    renderMessages();
    scrollToBottom();
  }
}

// Función para manejar mensajes enviados
function handleMessageSent(data) {
  // Confirmar que el mensaje se envió correctamente
  const messageIndex = messages.findIndex(m => m.id === data.message.id);
  if (messageIndex !== -1) {
    messages[messageIndex].status = 'sent';
    renderMessages();
  }
}
```

### Eventos WebSocket

#### Eventos Recibidos
- `connected`: Confirmación de conexión exitosa
- `subscribed`: Confirmación de suscripción a sesión
- `message`: Eventos de mensajes filtrados por sesión con tipos:
  - `incoming`: Nuevo mensaje entrante desde WhatsApp en la sesión suscrita
    ```json
    {
      "type": "incoming",
      "sessionId": "session-uuid",
      "contactId": "contact-uuid",
      "phoneNumber": "59170000000",
      "timestamp": "2025-11-09T22:50:00.000Z",
      "message": "Hola desde WhatsApp",
      "data": {
        "contactId": "contact-uuid",
        "message": {
          "id": "message-uuid",
          "content": "Hola desde WhatsApp",
          "timestamp": "2025-11-09T22:50:00.000Z",
          "isSent": false,
          "isReceived": true,
          "status": "received",
          "shouldTriggerAI": true
        }
      }
    }
    ```
  - `message_sent`: Confirmación de mensaje enviado desde este cliente
    ```json
    {
      "type": "message_sent",
      "sessionId": "session-uuid",
      "contactId": "contact-uuid",
      "phoneNumber": "59170000000",
      "timestamp": "2025-11-09T22:50:00.000Z",
      "data": {
        "contactId": "contact-uuid",
        "message": {
          "id": "message-uuid",
          "content": "Mensaje enviado",
          "timestamp": "2025-11-09T22:50:00.000Z",
          "isSent": true,
          "status": "sent"
        }
      }
    }
    ```
  - `outgoing`: Mensaje saliente enviado por el sistema en la sesión suscrita

#### Eventos Enviados
- `subscribe_session`: Suscribirse a una sesión específica para recibir mensajes filtrados
- `unsubscribe_session`: Desuscribirse de una sesión
- `ping`: Mantener conexión viva
- `get_stats`: Obtener estadísticas de conexión

## Implementación Completa del Frontend

### Estructura de Componentes

```javascript
// Componente principal de Chat
class ChatApp {
  constructor() {
    this.contacts = [];
    this.messages = [];
    this.currentContact = null;
    this.currentPage = 1;
    this.hasMoreContacts = true;
    this.hasMoreMessages = true;
    this.searchTerm = '';
    this.token = localStorage.getItem('token');

    this.init();
  }

  async init() {
    this.setupWebSocket();
    await this.loadContacts();
    this.setupEventListeners();
  }

  // Configurar WebSocket
  setupWebSocket() {
    this.socket = io('ws://localhost:3000/ws', {
      auth: { token: this.token }
    });

    this.socket.on('connected', (data) => {
      console.log('WebSocket conectado:', data);
      // Suscribirse a la sesión activa
      if (this.activeSessionId) {
        this.socket.emit('subscribe_session', { sessionId: this.activeSessionId });
      }
    });

    this.socket.on('subscribed', (data) => {
      console.log('Suscrito a sesión:', data.sessionId);
    });

    this.socket.on('message', (data) => {
      this.handleWebSocketMessage(data);
    });

    // Escuchar desconexiones
    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket desconectado:', reason);
      // Intentar reconectar automáticamente
      setTimeout(() => this.connectWebSocket(), 3000);
    });
  }

  // Cargar contactos con paginación
  async loadContacts(page = 1, append = false) {
    try {
      const response = await fetch(
        `/api/v1/conect-front/contacts/${this.activeSessionId}?page=${page}&limit=10&search=${this.searchTerm}`,
        {
          headers: { 'Authorization': `Bearer ${this.token}` }
        }
      );

      const data = await response.json();

      if (append) {
        this.contacts.push(...data.contacts);
      } else {
        this.contacts = data.contacts;
      }

      this.hasMoreContacts = data.pagination.hasNext;
      this.currentPage = page;

      this.renderContacts();
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  }

  // Cargar mensajes de un contacto
  async loadMessages(contactId, page = 1, append = false) {
    try {
      const response = await fetch(
        `/api/v1/conect-front/contacts/${this.activeSessionId}/${contactId}/messages?page=${page}&limit=20`,
        {
          headers: { 'Authorization': `Bearer ${this.token}` }
        }
      );

      const data = await response.json();

      if (append) {
        this.messages.unshift(...data.messages); // Agregar al inicio para mensajes antiguos
      } else {
        this.messages = data.messages;
      }

      this.currentContact = data.contact;
      this.hasMoreMessages = data.pagination.hasNext;

      this.renderMessages();
      this.scrollToBottom();
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }

  // Enviar mensaje
  async sendMessage(messageText) {
    if (!this.currentContact || !messageText.trim()) return;

    try {
      const response = await fetch(
        `/api/v1/conect-front/contacts/${this.activeSessionId}/${this.currentContact.id}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message: messageText })
        }
      );

      const sentMessage = await response.json();

      // Agregar mensaje optimistamente
      this.messages.push(sentMessage);
      this.renderMessages();
      this.scrollToBottom();

    } catch (error) {
      console.error('Error sending message:', error);
      // Mostrar error al usuario
    }
  }

  // Manejar mensajes WebSocket
  handleWebSocketMessage(data) {
    console.log('Mensaje WebSocket recibido:', data);

    switch (data.type) {
      case 'incoming':
        // Mensaje entrante desde WhatsApp
        this.handleIncomingMessage(data);
        break;
      case 'message_sent':
        // Confirmación de mensaje enviado por el usuario
        this.handleMessageSent(data.data);
        break;
      case 'outgoing':
        // Mensaje saliente enviado por el sistema (auto-respuesta, etc.)
        this.handleOutgoingMessage(data);
        break;
      default:
        console.log('Tipo de mensaje WebSocket desconocido:', data.type);
    }
  }

  // Renderizar contactos
  renderContacts() {
    const contactsList = document.getElementById('contacts-list');
    contactsList.innerHTML = '';

    this.contacts.forEach(contact => {
      const contactElement = this.createContactElement(contact);
      contactsList.appendChild(contactElement);
    });
  }

  // Renderizar mensajes
  renderMessages() {
    const messagesContainer = document.getElementById('messages-container');
    messagesContainer.innerHTML = '';

    this.messages.forEach(message => {
      const messageElement = this.createMessageElement(message);
      messagesContainer.appendChild(messageElement);
    });
  }

  // Crear elemento de contacto
  createContactElement(contact) {
    const div = document.createElement('div');
    div.className = 'contact-item';
    div.innerHTML = `
      <div class="contact-avatar">${contact.name.charAt(0)}</div>
      <div class="contact-info">
        <div class="contact-name">${contact.name}</div>
        <div class="contact-last-message">${contact.lastMessage?.content || 'Sin mensajes'}</div>
      </div>
      <div class="contact-meta">
        <div class="message-count">${contact.messageCount}</div>
        <div class="contact-time">${this.formatTime(contact.lastMessage?.fecha)}</div>
      </div>
    `;

    div.addEventListener('click', () => {
      this.selectContact(contact);
    });

    return div;
  }

  // Crear elemento de mensaje
  createMessageElement(message) {
    const div = document.createElement('div');
    div.className = `message ${message.isSent ? 'sent' : 'received'}`;
    div.innerHTML = `
      <div class="message-content">${message.content}</div>
      <div class="message-time">${this.formatTime(message.timestamp)}</div>
    `;
    return div;
  }

  // Formatear tiempo
  formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Scroll al final
  scrollToBottom() {
    const container = document.getElementById('messages-container');
    container.scrollTop = container.scrollHeight;
  }

  // Configurar event listeners
  setupEventListeners() {
    // Búsqueda de contactos
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
      this.searchTerm = e.target.value;
      this.loadContacts(1, false);
    });

    // Scroll infinito para contactos
    const contactsContainer = document.getElementById('contacts-container');
    contactsContainer.addEventListener('scroll', () => {
      if (this.isNearBottom(contactsContainer) && this.hasMoreContacts) {
        this.loadContacts(this.currentPage + 1, true);
      }
    });

    // Scroll infinito para mensajes (hacia arriba)
    const messagesContainer = document.getElementById('messages-container');
    messagesContainer.addEventListener('scroll', () => {
      if (this.isNearTop(messagesContainer) && this.hasMoreMessages) {
        this.loadMessages(this.currentContact.id, this.currentMessagePage + 1, true);
      }
    });

    // Formulario de envío
    const sendForm = document.getElementById('send-form');
    sendForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('message-input');
      this.sendMessage(input.value);
      input.value = '';
    });
  }

  // Utilidades
  isNearBottom(element) {
    return element.scrollTop + element.clientHeight >= element.scrollHeight - 100;
  }

  isNearTop(element) {
    return element.scrollTop <= 100;
  }

  selectContact(contact) {
    this.currentContact = contact;
    this.loadMessages(contact.id);
  }
}

// Inicializar aplicación
document.addEventListener('DOMContentLoaded', () => {
  new ChatApp();
});
```

## Consideraciones de Rendimiento

### Paginación
- Implementa paginación infinita para contactos y mensajes
- Carga inicial: 10 contactos, 20 mensajes
- Carga adicional: misma cantidad cuando el usuario llegue al final

### WebSocket
- Mantén la conexión WebSocket viva con ping/pong
- Implementa reconexión automática con backoff exponencial
- Maneja eventos de desconexión y reconexión gracefully
- Filtra mensajes por sesión para evitar sobrecarga
- Procesa mensajes entrantes en tiempo real desde WhatsApp
- Confirma entregas de mensajes enviados

### Manejo de Mensajes en Tiempo Real

#### Flujo de Mensajes Entrantes (WhatsApp → Frontend)
1. **Mensaje llega a BAILEYS** → `messages.upsert` event
2. **Procesamiento** → Guardar en BD, activar IA si corresponde
3. **WebSocket** → Notificar a sesión específica con `type: 'incoming'`
4. **Frontend** → Recibir notificación, actualizar UI si es contacto actual
5. **Auto-respuesta** → Sistema responde automáticamente si está activado

#### Flujo de Mensajes Salientes (Frontend → WhatsApp)
1. **Usuario envía** → POST `/contacts/{sessionId}/{contactId}/messages`
2. **API procesa** → Guardar mensaje, enviar via WhatsApp
3. **WebSocket** → Confirmar envío con `type: 'message_sent'`
4. **Frontend** → Actualizar estado del mensaje a "enviado"

### Caché
- Cachea contactos y mensajes localmente
- Actualiza solo cuando sea necesario
- Implementa invalidación de caché

### Optimizaciones
- Lazy loading de imágenes de perfil
- Virtual scrolling para listas largas
- Debounce en búsqueda
- Compresión de mensajes largos

## Manejo de Errores

```javascript
// Función genérica para manejar errores de API
async function handleApiError(response) {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error en la API');
  }
  return response;
}

// En cada llamada a la API
try {
  const response = await fetch('/api/v1/conect-front/contacts', {
    headers: { 'Authorization': `Bearer ${this.token}` }
  });

  await handleApiError(response);
  const data = await response.json();

  // Procesar datos...
} catch (error) {
  console.error('API Error:', error);
  // Mostrar error al usuario
  showErrorToast(error.message);
}
```

## Seguridad

- Siempre valida el token JWT antes de enviar requests
- Implementa refresh token para mantener la sesión activa
- Usa HTTPS en producción
- Valida y sanitiza todos los inputs del usuario
- Implementa rate limiting en el frontend

## Logs de Verificación

Para verificar que el sistema está funcionando correctamente, revisa los logs del backend:

```
🚀 Application is running on: http://localhost:3000
📚 Swagger documentation: http://localhost:3000/api/docs
📁 QR Codes available at: http://localhost:3000/qr-codes/
🔌 WebSocket server: ws://localhost:3000/ws
🔍 API Health check: http://localhost:3000/api/v1/health
```

### Verificar Conexión WebSocket

```bash
# Verificar puerto del backend
netstat -ano | findstr :3000

# Verificar health check
curl -I http://localhost:3000/api/v1/health
```

### Próximos Pasos

1. **Conectar el Frontend**: Usa `ws://localhost:3000/ws` para la conexión WebSocket
2. **Implementar Autenticación**: Incluye el token JWT en el header de auth
3. **Suscribirse a Sesiones**: Usa `subscribe_session` para filtrar mensajes
4. **Manejar Eventos**: Escucha eventos `incoming`, `message_sent`, y `outgoing`

Esta documentación proporciona una base sólida para integrar el frontend con las APIs del módulo conect-front. Asegúrate de probar exhaustivamente cada funcionalidad antes de desplegar a producción.
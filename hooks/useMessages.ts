// hooks/useMessages.ts
import { useState, useEffect, useCallback } from 'react';
import { Message, MessagesResponse, getMessages, sendMessage, SendMessageResponse } from '@/lib/conect-front';
import { toast } from 'sonner';

export const useMessages = (sessionId: string | null, contactId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<MessagesResponse['pagination'] | null>(null);
  const [currentContact, setCurrentContact] = useState<MessagesResponse['contact'] | null>(null);

  const loadMessages = useCallback(async (page = 1, append = false) => {
    if (!sessionId || !contactId) {
      console.log('⚠️ useMessages: Missing sessionId or contactId, skipping load');
      return;
    }

    console.log('🔄 useMessages: Loading messages for session/contact:', sessionId, contactId, { page, append });
    try {
      setLoading(true);
      setError(null);

      const response = await getMessages(sessionId, contactId, page, 20);

      if (append) {
        setMessages(prev => [...response.messages, ...prev]); // Add older messages at the beginning
        console.log('📨 useMessages: Appended messages, total:', response.messages.length + messages.length);
      } else {
        setMessages(response.messages);
        console.log('📨 useMessages: Set messages, total:', response.messages.length);
      }

      setPagination(response.pagination);
      setCurrentContact(response.contact);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load messages';
      console.error('❌ useMessages: Error loading messages:', errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [sessionId, contactId, messages.length]);

  const loadMoreMessages = useCallback(() => {
    if (pagination?.hasNext && !loading) {
      loadMessages(pagination.page + 1, true);
    }
  }, [pagination, loading, loadMessages]);

  const sendNewMessage = useCallback(async (messageText: string) => {
    if (!sessionId || !contactId || !messageText.trim()) {
      console.log('⚠️ useMessages: Cannot send message - missing sessionId, contactId or messageText');
      return null;
    }

    console.log('📤 useMessages: Sending message to session/contact:', sessionId, contactId);
    try {
      const sentMessage = await sendMessage(sessionId, contactId, messageText);

      // Add the message optimistically
      const newMessage: Message = {
        id: sentMessage.id,
        content: sentMessage.content,
        timestamp: sentMessage.timestamp,
        isSent: true,
        isReceived: false,
        type: 'contact',
        tipo_mensaje: 'espera', // Default type for sent messages
      };

      setMessages(prev => [...prev, newMessage]);
      console.log('✅ useMessages: Message added to local state:', sentMessage.id);
      return sentMessage;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      console.error('❌ useMessages: Error sending message:', errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, [sessionId, contactId]);

  const addIncomingMessage = useCallback((message: Message) => {
    console.log('📨 useMessages: Adding incoming message:', message.id, message.content.substring(0, 50));
    setMessages(prev => [...prev, message]);
  }, []);

  useEffect(() => {
    if (contactId) {
      loadMessages(1, false);
    } else {
      setMessages([]);
      setCurrentContact(null);
      setPagination(null);
    }
  }, [contactId, loadMessages]);

  return {
    messages,
    loading,
    error,
    pagination,
    currentContact,
    loadMoreMessages,
    sendMessage: sendNewMessage,
    addIncomingMessage,
    refetch: () => loadMessages(1, false),
  };
};
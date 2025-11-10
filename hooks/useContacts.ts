// hooks/useContacts.ts
import { useState, useEffect, useCallback } from 'react';
import { Contact, ContactsResponse, getContacts } from '@/lib/conect-front';
import { toast } from 'sonner';

export const useContacts = (sessionId: string | null) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<ContactsResponse['pagination'] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadContacts = useCallback(async (page = 1, append = false) => {
    if (!sessionId) {
      console.log('⚠️ useContacts: No sessionId provided, skipping load');
      return;
    }

    console.log('🔄 useContacts: Loading contacts for session:', sessionId, { page, append, searchTerm });
    try {
      setLoading(true);
      setError(null);

      const response = await getContacts(sessionId, page, 10, searchTerm);

      if (append) {
        setContacts(prev => [...prev, ...response.contacts]);
        console.log('📋 useContacts: Appended contacts, total:', response.contacts.length + contacts.length);
      } else {
        setContacts(response.contacts);
        console.log('📋 useContacts: Set contacts, total:', response.contacts.length);
      }

      setPagination(response.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load contacts';
      console.error('❌ useContacts: Error loading contacts:', errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [sessionId, searchTerm, contacts.length]);

  const searchContacts = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const loadMoreContacts = useCallback(() => {
    if (pagination?.hasNext && !loading) {
      loadContacts(pagination.page + 1, true);
    }
  }, [pagination, loading, loadContacts]);

  useEffect(() => {
    loadContacts(1, false);
  }, [loadContacts]);

  return {
    contacts,
    loading,
    error,
    pagination,
    searchContacts,
    loadMoreContacts,
    refetch: () => loadContacts(1, false),
  };
};
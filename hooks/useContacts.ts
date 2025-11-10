// hooks/useContacts.ts
import { useState, useEffect, useCallback } from 'react';
import {
  Contact,
  ContactsResponse,
  getContacts,
  getAllContacts,
  getContactsByUser,
  createContact,
  getContactById,
  updateContact,
  deleteContact,
  CreateContactRequest,
  UpdateContactRequest
} from '@/lib/conect-front';
import { toast } from 'sonner';

export const useContacts = (sessionId: string | null) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<ContactsResponse['pagination'] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [userContacts, setUserContacts] = useState<Contact[]>([]);

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

  // Load all contacts (ADMIN only)
  const loadAllContacts = useCallback(async () => {
    console.log('🔄 useContacts: Loading all contacts (ADMIN)');
    try {
      setLoading(true);
      setError(null);
      const contactsData = await getAllContacts();
      setAllContacts(contactsData);
      console.log('📋 useContacts: Loaded all contacts:', contactsData.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load all contacts';
      console.error('❌ useContacts: Error loading all contacts:', errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load contacts by user
  const loadContactsByUser = useCallback(async (userId: string) => {
    console.log('🔄 useContacts: Loading contacts for user:', userId);
    try {
      setLoading(true);
      setError(null);
      const contactsData = await getContactsByUser(userId);
      setUserContacts(contactsData);
      console.log('📋 useContacts: Loaded user contacts:', contactsData.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load user contacts';
      console.error('❌ useContacts: Error loading user contacts:', errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new contact
  const createNewContact = useCallback(async (userId: string, contactData: CreateContactRequest) => {
    console.log('➕ useContacts: Creating contact for user:', userId);
    try {
      const newContact = await createContact(userId, contactData);
      // Update local state
      setUserContacts(prev => [...prev, newContact]);
      setContacts(prev => [...prev, newContact]);
      toast.success('Contact created successfully');
      return newContact;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create contact';
      console.error('❌ useContacts: Error creating contact:', errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Update contact
  const updateContactData = useCallback(async (userId: string, contactId: string, updateData: UpdateContactRequest) => {
    console.log('✏️ useContacts: Updating contact:', contactId);
    try {
      const updatedContact = await updateContact(userId, contactId, updateData);
      // Update local state
      setUserContacts(prev => prev.map(c => c.id_contac === contactId ? updatedContact : c));
      setAllContacts(prev => prev.map(c => c.id_contac === contactId ? updatedContact : c));
      setContacts(prev => prev.map(c => c.id_contac === contactId ? updatedContact : c));
      toast.success('Contact updated successfully');
      return updatedContact;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update contact';
      console.error('❌ useContacts: Error updating contact:', errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Delete contact
  const deleteContactData = useCallback(async (userId: string, contactId: string) => {
    console.log('🗑️ useContacts: Deleting contact:', contactId);
    try {
      await deleteContact(userId, contactId);
      // Update local state
      setUserContacts(prev => prev.filter(c => c.id_contac !== contactId));
      setAllContacts(prev => prev.filter(c => c.id_contac !== contactId));
      setContacts(prev => prev.filter(c => c.id_contac !== contactId));
      toast.success('Contact deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete contact';
      console.error('❌ useContacts: Error deleting contact:', errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Get single contact
  const getSingleContact = useCallback(async (userId: string, contactId: string) => {
    console.log('📋 useContacts: Getting single contact:', contactId);
    try {
      const contact = await getContactById(userId, contactId);
      return contact;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get contact';
      console.error('❌ useContacts: Error getting contact:', errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  return {
    contacts,
    loading,
    error,
    pagination,
    searchContacts,
    loadMoreContacts,
    refetch: () => loadContacts(1, false),
    // New functions
    allContacts,
    userContacts,
    loadAllContacts,
    loadContactsByUser,
    createNewContact,
    updateContactData,
    deleteContactData,
    getSingleContact,
  };
};
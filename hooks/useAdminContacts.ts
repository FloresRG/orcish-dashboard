// hooks/useAdminContacts.ts
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Contact,
  CreateContactRequest,
  UpdateContactRequest,
  ContactMessage,
} from '@/types/admin';
import { contactsApi } from '@/lib/admin-api';

export const useAdminContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);

  const loadContacts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await contactsApi.list();
      setContacts(data);
    } catch (error) {
      toast.error('Failed to load contacts');
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createContact = useCallback(async (data: CreateContactRequest) => {
    try {
      const newContact = await contactsApi.create(data);
      setContacts(prev => [...prev, newContact]);
      toast.success('Contact created successfully');
      return newContact;
    } catch (error) {
      toast.error('Failed to create contact');
      throw error;
    }
  }, []);

  const updateContact = useCallback(async (contactId: string, data: UpdateContactRequest) => {
    try {
      const updatedContact = await contactsApi.update(contactId, data);
      setContacts(prev => prev.map(contact =>
        contact.id === contactId ? updatedContact : contact
      ));
      toast.success('Contact updated successfully');
      return updatedContact;
    } catch (error) {
      toast.error('Failed to update contact');
      throw error;
    }
  }, []);

  const deleteContact = useCallback(async (userId: string, contactId: string) => {
    try {
      await contactsApi.delete(userId, contactId);
      setContacts(prev => prev.filter(contact => contact.id !== contactId));
      toast.success('Contact deleted successfully');
    } catch (error) {
      toast.error('Failed to delete contact');
      throw error;
    }
  }, []);

  const getContactByPhone = useCallback(async (phone: string) => {
    try {
      return await contactsApi.getByPhone(phone);
    } catch (error) {
      toast.error('Failed to get contact');
      throw error;
    }
  }, []);

  const getContactMessages = useCallback(async (contactId: string) => {
    try {
      const messages = await contactsApi.getMessages(contactId);
      setContactMessages(messages);
      return messages;
    } catch (error) {
      toast.error('Failed to load contact messages');
      throw error;
    }
  }, []);

  const getContactMessagesByPhone = useCallback(async (phone: string) => {
    try {
      const messages = await contactsApi.getMessagesByPhone(phone);
      setContactMessages(messages);
      return messages;
    } catch (error) {
      toast.error('Failed to load contact messages');
      throw error;
    }
  }, []);

  const updateWaitingMessages = useCallback(async (phone: string) => {
    try {
      await contactsApi.updateWaitingMessages(phone);
      toast.success('Waiting messages updated');
    } catch (error) {
      toast.error('Failed to update waiting messages');
      throw error;
    }
  }, []);

  const toggleContactIA = useCallback(async (phone: string, ia: boolean) => {
    try {
      const updatedContact = await contactsApi.toggleIA(phone, ia);
      setContacts(prev => prev.map(contact =>
        contact.phone === phone ? updatedContact : contact
      ));
      toast.success(`IA ${ia ? 'enabled' : 'disabled'} for contact`);
      return updatedContact;
    } catch (error) {
      toast.error('Failed to toggle IA');
      throw error;
    }
  }, []);

  return {
    contacts,
    loading,
    contactMessages,
    loadContacts,
    createContact,
    updateContact,
    deleteContact,
    getContactByPhone,
    getContactMessages,
    getContactMessagesByPhone,
    updateWaitingMessages,
    toggleContactIA,
  };
};
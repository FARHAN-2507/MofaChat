import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchConversations,
  fetchConversation,
  createConversation,
  renameConversation,
  deleteConversation,
} from '../lib/api';
import { useAuth } from './useAuth';

export function useConversations() {
  const { isAuthenticated, token } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const prevAuthed = useRef(null);

  const loadConversations = useCallback(async () => {
    if (!isAuthenticated) {
      setConversations([]);
      setActiveId(null);
      setMessages([]);
      setLoading(false);
      return;
    }
    try {
      const data = await fetchConversations();
      setConversations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadConversation = useCallback(async (id) => {
    try {
      setActiveId(id);
      const data = await fetchConversation(id);
      setMessages(data.messages);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const addMessage = useCallback((message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const updateLastMessage = useCallback((content) => {
    setMessages(prev => {
      const updated = [...prev];
      const last = updated[updated.length - 1];
      if (last && last.role === 'assistant') {
        updated[updated.length - 1] = { ...last, content };
      } else {
        updated.push({ role: 'assistant', content, _temp: true, createdAt: new Date().toISOString() });
      }
      return updated;
    });
  }, []);

  const newConversation = useCallback(async () => {
    const conv = await createConversation('New conversation');
    setConversations(prev => [conv, ...prev]);
    setActiveId(conv._id);
    setMessages([]);
    return conv._id;
  }, []);

  const rename = useCallback(async (id, title) => {
    await renameConversation(id, title);
    setConversations(prev =>
      prev.map(c => c._id === id ? { ...c, title } : c)
    );
  }, []);

  const remove = useCallback(async (id) => {
    await deleteConversation(id);
    setConversations(prev => prev.filter(c => c._id !== id));
    if (activeId === id) {
      setActiveId(null);
      setMessages([]);
    }
  }, [activeId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations, token]);

  return {
    conversations,
    activeId,
    messages,
    loading,
    loadConversations,
    loadConversation,
    newConversation,
    rename,
    remove,
    addMessage,
    updateLastMessage,
    setMessages,
    setActiveId,
  };
}

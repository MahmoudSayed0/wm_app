import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

type OrderRow = Database['public']['Tables']['orders']['Row'];
type MessageRow = Database['public']['Tables']['messages']['Row'];

interface OrderUpdate {
  id: string;
  status: string;
  washer_id: string | null;
  estimated_arrival: string | null;
  updated_at: string;
}

interface WasherLocation {
  washer_id: string;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  timestamp: string;
}

interface Message {
  id: string;
  order_id: string;
  sender_id: string;
  sender_type: 'customer' | 'washer';
  content: string;
  is_quick_reply: boolean;
  created_at: string;
  read_at: string | null;
}

interface UseRealtimeOrderReturn {
  orderStatus: string | null;
  washerLocation: WasherLocation | null;
  messages: Message[];
  estimatedArrival: string | null;
  isConnected: boolean;
  error: string | null;
  sendMessage: (content: string, isQuickReply?: boolean) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useRealtimeOrder(orderId: string): UseRealtimeOrderReturn {
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [washerLocation, setWasherLocation] = useState<WasherLocation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [estimatedArrival, setEstimatedArrival] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const orderChannelRef = useRef<RealtimeChannel | null>(null);
  const locationChannelRef = useRef<RealtimeChannel | null>(null);

  // Load initial order data
  const loadOrderData = useCallback(async () => {
    if (!orderId) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('status, washer_id')
        .eq('id', orderId)
        .single();

      if (fetchError) throw fetchError;

      if (data) {
        setOrderStatus((data as { status: string }).status);
      }
    } catch (err) {
      console.error('Error loading order:', err);
    }
  }, [orderId]);

  // Load initial messages
  const loadMessages = useCallback(async () => {
    if (!orderId) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      if (data) {
        // Map database rows to Message interface
        const mappedMessages: Message[] = (data as MessageRow[]).map((row) => ({
          id: row.id,
          order_id: row.order_id,
          sender_id: row.sender_id,
          sender_type: row.sender_type,
          content: row.content,
          is_quick_reply: false,
          created_at: row.created_at,
          read_at: row.is_read ? row.created_at : null,
        }));
        setMessages(mappedMessages);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  }, [orderId]);

  // Refetch all data
  const refetch = useCallback(async () => {
    await Promise.all([loadOrderData(), loadMessages()]);
  }, [loadOrderData, loadMessages]);

  // Subscribe to order updates
  useEffect(() => {
    if (!orderId) return;

    // Load initial data
    loadOrderData();
    loadMessages();

    // Subscribe to order changes
    const orderChannel = supabase
      .channel(`order:${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          const newData = payload.new as OrderUpdate;
          setOrderStatus(newData.status);
          setEstimatedArrival(newData.estimated_arrival);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          setError(null);
        } else if (status === 'CHANNEL_ERROR') {
          setError('Failed to connect to real-time updates');
          setIsConnected(false);
        }
      });

    orderChannelRef.current = orderChannel;

    // Subscribe to washer location broadcasts
    const locationChannel = supabase
      .channel(`washer-location:${orderId}`)
      .on('broadcast', { event: 'location' }, (payload) => {
        const location = payload.payload as WasherLocation;
        setWasherLocation(location);
      })
      .subscribe();

    locationChannelRef.current = locationChannel;

    // Cleanup
    return () => {
      if (orderChannelRef.current) {
        supabase.removeChannel(orderChannelRef.current);
        orderChannelRef.current = null;
      }
      if (locationChannelRef.current) {
        supabase.removeChannel(locationChannelRef.current);
        locationChannelRef.current = null;
      }
    };
  }, [orderId, loadOrderData, loadMessages]);

  // Send message function
  const sendMessage = useCallback(
    async (content: string, _isQuickReply = false) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          throw new Error('Not authenticated');
        }

        const messageData: Database['public']['Tables']['messages']['Insert'] = {
          order_id: orderId,
          sender_id: user.id,
          sender_type: 'customer',
          content,
        };

        const { error: insertError } = await (supabase.from('messages') as any)
          .insert(messageData);

        if (insertError) throw insertError;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
        setError(errorMessage);
        throw err;
      }
    },
    [orderId]
  );

  return {
    orderStatus,
    washerLocation,
    messages,
    estimatedArrival,
    isConnected,
    error,
    sendMessage,
    refetch,
  };
}

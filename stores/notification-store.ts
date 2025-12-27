import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type NotificationType =
  | 'booking_confirmed'
  | 'washer_assigned'
  | 'washer_on_way'
  | 'washer_arrived'
  | 'wash_started'
  | 'wash_completed'
  | 'payment_received'
  | 'reminder';

export interface Notification {
  id: string;
  type: NotificationType;
  titleEn: string;
  titleAr: string;
  messageEn: string;
  messageAr: string;
  read: boolean;
  createdAt: Date;
  orderId?: string;
  data?: Record<string, unknown>;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (
    notification: Omit<Notification, 'id' | 'createdAt' | 'read'>
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  removeNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          read: false,
        };

        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep last 50
          unreadCount: state.unreadCount + 1,
        }));

        return newNotification;
      },

      markAsRead: (id) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          if (!notification || notification.read) return state;

          return {
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          };
        });
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },

      clearAll: () => {
        set({ notifications: [], unreadCount: 0 });
      },

      removeNotification: (id) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          return {
            notifications: state.notifications.filter((n) => n.id !== id),
            unreadCount:
              notification && !notification.read
                ? Math.max(0, state.unreadCount - 1)
                : state.unreadCount,
          };
        });
      },
    }),
    {
      name: 'washman-notifications',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        notifications: state.notifications.slice(0, 20), // Only persist last 20
      }),
    }
  )
);

// Helper to create booking notifications
export const createBookingNotification = (
  type: NotificationType,
  orderId: string,
  data?: Record<string, unknown>
): Omit<Notification, 'id' | 'createdAt' | 'read'> => {
  const notifications: Record<
    NotificationType,
    { titleEn: string; titleAr: string; messageEn: string; messageAr: string }
  > = {
    booking_confirmed: {
      titleEn: 'Booking Confirmed',
      titleAr: 'تم تأكيد الحجز',
      messageEn: `Your car wash has been scheduled successfully`,
      messageAr: 'تم جدولة غسيل سيارتك بنجاح',
    },
    washer_assigned: {
      titleEn: 'Washer Assigned',
      titleAr: 'تم تعيين الغاسل',
      messageEn: `${data?.washerName || 'A washer'} has been assigned to your order`,
      messageAr: `تم تعيين ${data?.washerName || 'غاسل'} لطلبك`,
    },
    washer_on_way: {
      titleEn: 'Washer On The Way',
      titleAr: 'الغاسل في الطريق',
      messageEn: `${data?.washerName || 'Your washer'} is heading to your location`,
      messageAr: `${data?.washerName || 'الغاسل'} في طريقه إلى موقعك`,
    },
    washer_arrived: {
      titleEn: 'Washer Arrived',
      titleAr: 'وصل الغاسل',
      messageEn: 'Your washer has arrived at your location',
      messageAr: 'وصل الغاسل إلى موقعك',
    },
    wash_started: {
      titleEn: 'Wash Started',
      titleAr: 'بدأ الغسيل',
      messageEn: 'Your car wash has started',
      messageAr: 'بدأ غسيل سيارتك',
    },
    wash_completed: {
      titleEn: 'Wash Completed',
      titleAr: 'اكتمل الغسيل',
      messageEn: 'Your car wash has been completed. Rate your experience!',
      messageAr: 'تم الانتهاء من غسيل سيارتك. قيم تجربتك!',
    },
    payment_received: {
      titleEn: 'Payment Received',
      titleAr: 'تم استلام الدفع',
      messageEn: 'Your payment has been received successfully',
      messageAr: 'تم استلام الدفع بنجاح',
    },
    reminder: {
      titleEn: 'Upcoming Appointment',
      titleAr: 'موعد قادم',
      messageEn: `Reminder: You have a car wash scheduled`,
      messageAr: 'تذكير: لديك موعد غسيل سيارة',
    },
  };

  return {
    type,
    ...notifications[type],
    orderId,
    data,
  };
};

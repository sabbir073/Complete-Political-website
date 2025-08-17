import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface LoadingState {
  [key: string]: boolean;
}

interface UIState {
  // Loading states
  loading: LoadingState;
  
  // Notifications
  notifications: Notification[];
  
  // Actions
  setLoading: (key: string, isLoading: boolean) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useUIStore = create<UIState>()(
  immer((set, get) => ({
    // Initial state
    loading: {},
    notifications: [],
    
    // Actions
    setLoading: (key: string, isLoading: boolean) => {
      set((state) => {
        state.loading[key] = isLoading;
      });
    },
    
    addNotification: (notification) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newNotification = { ...notification, id };
      
      set((state) => {
        state.notifications.push(newNotification);
      });
      
      // Auto-remove notification after duration
      if (notification.duration) {
        setTimeout(() => {
          get().removeNotification(id);
        }, notification.duration);
      }
    },
    
    removeNotification: (id: string) => {
      set((state) => {
        state.notifications = state.notifications.filter(n => n.id !== id);
      });
    },
    
    clearNotifications: () => {
      set((state) => {
        state.notifications = [];
      });
    },
  }))
);
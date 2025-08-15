import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface DatabaseUser {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  last_seen?: string;
  created_at: string;
}

export interface ChatMessage {
  id: number;
  room_id: string;
  sender: string;
  content: string;
  created_at: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'dm' | 'group' | 'game' | 'movie' | 'global' | 'ai';
  created_at: string;
}

export interface GameMove {
  id: number;
  room_id: string;
  move_type: 'tictactoe' | 'chess';
  data: any;
  created_at: string;
}

export interface QuizScore {
  id: number;
  username: string;
  category: string;
  score: number;
  streak: number;
  created_at: string;
}

export interface MessageReaction {
  id: number;
  message_id: number;
  username: string;
  emoji: string;
  created_at: string;
}

export interface MessageThread {
  id: number;
  room_id: string;
  parent_message_id: number;
  sender: string;
  content: string;
  created_at: string;
}

class SupabaseService {
  // User Management
  async createUser(email: string, username: string, fullName?: string): Promise<DatabaseUser | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            email,
            username,
            full_name: fullName,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<DatabaseUser | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  async updateUserProfile(userId: string, updates: Partial<DatabaseUser>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  }

  // Chat & Messaging
  async createRoom(roomId: string, name: string, type: ChatRoom['type']): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('rooms')
        .insert([
          {
            id: roomId,
            name,
            type,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error creating room:', error);
      return false;
    }
  }

  async sendMessage(roomId: string, sender: string, content: string): Promise<ChatMessage | null> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            room_id: roomId,
            sender,
            content,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  }

  async getRoomMessages(roomId: string, limit: number = 50): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting room messages:', error);
      return [];
    }
  }

  async subscribeToMessages(roomId: string, callback: (message: ChatMessage) => void) {
    return supabase
      .channel(`messages:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          callback(payload.new as ChatMessage);
        }
      )
      .subscribe();
  }

  // Gaming
  async saveGameMove(roomId: string, moveType: GameMove['move_type'], data: any): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('game_moves')
        .insert([
          {
            room_id: roomId,
            move_type: moveType,
            data,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error saving game move:', error);
      return false;
    }
  }

  async getGameMoves(roomId: string, limit: number = 100): Promise<GameMove[]> {
    try {
      const { data, error } = await supabase
        .from('game_moves')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting game moves:', error);
      return [];
    }
  }

  async saveQuizScore(username: string, category: string, score: number, streak: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('quiz_scores')
        .insert([
          {
            username,
            category,
            score,
            streak,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error saving quiz score:', error);
      return false;
    }
  }

  async getQuizLeaderboard(category: string, limit: number = 10): Promise<QuizScore[]> {
    try {
      const { data, error } = await supabase
        .from('quiz_scores')
        .select('*')
        .eq('category', category)
        .order('score', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting quiz leaderboard:', error);
      return [];
    }
  }

  // Reactions & Threads
  async addReaction(messageId: number, username: string, emoji: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('message_reactions')
        .insert([
          {
            message_id: messageId,
            username,
            emoji,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding reaction:', error);
      return false;
    }
  }

  async getMessageReactions(messageId: number): Promise<MessageReaction[]> {
    try {
      const { data, error } = await supabase
        .from('message_reactions')
        .select('*')
        .eq('message_id', messageId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting message reactions:', error);
      return [];
    }
  }

  async createThread(roomId: string, parentMessageId: number, sender: string, content: string): Promise<MessageThread | null> {
    try {
      const { data, error } = await supabase
        .from('message_threads')
        .insert([
          {
            room_id: roomId,
            parent_message_id: parentMessageId,
            sender,
            content,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating thread:', error);
      return null;
    }
  }

  async getThreadReplies(parentMessageId: number): Promise<MessageThread[]> {
    try {
      const { data, error } = await supabase
        .from('message_threads')
        .select('*')
        .eq('parent_message_id', parentMessageId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting thread replies:', error);
      return [];
    }
  }

  // Utility Functions
  async initializeDatabase(): Promise<boolean> {
    try {
      // Create global and AI rooms if they don't exist
      await this.createRoom('global', 'Global Chat', 'global');
      await this.createRoom('ai', 'AI Chat', 'ai');
      
      return true;
    } catch (error) {
      console.error('Error initializing database:', error);
      return false;
    }
  }

  // Real-time subscriptions
  subscribeToRealtime(callback: (payload: any) => void) {
    return supabase
      .channel('realtime')
      .on('postgres_changes', { event: '*', schema: 'public' }, callback)
      .subscribe();
  }
}

export const supabaseService = new SupabaseService();
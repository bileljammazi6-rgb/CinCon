import { supabase } from '../lib/supabase';

export type CommunityMessage = {
  id: string;
  room_id: string;
  sender: string;
  content: string;
  created_at: string;
};

export async function listMessages(roomId: string, sinceIso?: string, limit = 50): Promise<CommunityMessage[]> {
  let query = supabase
    .from('messages')
    .select('id, room_id, sender, content, created_at')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true })
    .limit(limit);
  if (sinceIso) {
    query = query.gte('created_at', sinceIso);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as CommunityMessage[];
}

export async function sendMessage(roomId: string, sender: string, content: string): Promise<void> {
  const { error } = await supabase.from('messages').insert({ room_id: roomId, sender, content });
  if (error) throw error;
}

export async function createInvite(type: 'game' | 'movie', fromUser: string, toUser: string, payload?: Record<string, any>): Promise<void> {
  const { error } = await supabase.from('invites').insert({ type, from_user: fromUser, to_user: toUser, payload: payload || null, status: 'pending' });
  if (error) throw error;
}
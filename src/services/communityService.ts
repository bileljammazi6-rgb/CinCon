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
    query = query.gt('created_at', sinceIso);
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

export function subscribeToMessages(roomId: string, onInsert: (msg: CommunityMessage) => void): () => void {
  const channel = supabase
    .channel(`messages-room-${roomId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` }, (payload) => {
      const row = payload.new as any;
      const msg: CommunityMessage = {
        id: String(row.id),
        room_id: row.room_id,
        sender: row.sender,
        content: row.content,
        created_at: row.created_at,
      };
      onInsert(msg);
    })
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}

export async function fetchProfiles(usernames: string[]): Promise<Record<string, { avatar_url?: string }>> {
  if (!usernames.length) return {};
  const { data, error } = await supabase
    .from('users')
    .select('username, avatar_url')
    .in('username', usernames);
  if (error) throw error;
  const map: Record<string, { avatar_url?: string }> = {};
  (data || []).forEach((u: any) => { map[u.username] = { avatar_url: u.avatar_url || undefined }; });
  return map;
}

export async function listUsers(limit = 50): Promise<{ username: string; avatar_url?: string }[]> {
  const { data, error } = await supabase
    .from('users')
    .select('username, avatar_url')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []) as any;
}
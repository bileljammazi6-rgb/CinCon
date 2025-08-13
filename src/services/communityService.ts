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

export async function listInvitesForUser(username: string) {
  const { data, error } = await supabase
    .from('invites')
    .select('id, type, from_user, to_user, status, payload, created_at')
    .eq('to_user', username)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function updateInviteStatus(inviteId: number, status: 'accepted'|'declined'|'cancelled') {
  const { error } = await supabase.from('invites').update({ status }).eq('id', inviteId);
  if (error) throw error;
}

export async function createRoom(roomId: string, name: string, type: 'dm'|'group'|'game'|'movie'|'global'): Promise<void> {
  const { error } = await supabase.from('rooms').insert({ id: roomId, name, type }).select().single();
  if (error && !String(error.message).includes('duplicate')) throw error;
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

// game moves
export async function sendGameMove(roomId: string, move_type: 'tictactoe'|'chess', data: Record<string, any>) {
  const { error } = await supabase.from('game_moves').insert({ room_id: roomId, move_type, data });
  if (error) throw error;
}

export function subscribeToGameMoves(roomId: string, onInsert: (payload: { move_type: string; data: any; created_at: string }) => void): () => void {
  const channel = supabase
    .channel(`game-moves-${roomId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'game_moves', filter: `room_id=eq.${roomId}` }, (payload) => {
      const row = payload.new as any;
      onInsert({ move_type: row.move_type, data: row.data, created_at: row.created_at });
    })
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}
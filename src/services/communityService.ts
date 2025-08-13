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
  const { data, error } = await supabase.from('invites').update({ status }).eq('id', inviteId).select('id, type, from_user, to_user, status, payload, created_at').single();
  if (error) throw error;
  return data;
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

export async function fetchProfiles(usernames: string[]): Promise<Record<string, { avatar_url?: string; last_seen?: string }>> {
  if (!usernames.length) return {} as any;
  const { data, error } = await supabase
    .from('users')
    .select('username, avatar_url, last_seen')
    .in('username', usernames);
  if (error) throw error;
  const map: Record<string, { avatar_url?: string; last_seen?: string }> = {};
  (data || []).forEach((u: any) => { map[u.username] = { avatar_url: u.avatar_url || undefined, last_seen: u.last_seen || undefined }; });
  return map;
}

export async function updateLastSeen(username: string) {
  const { error } = await supabase.from('users').update({ last_seen: new Date().toISOString() }).eq('username', username);
  if (error) throw error;
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
export async function sendGameMove(roomId: string, move_type: 'tictactoe'|'chess'|'cowatch'|'cowatch_chat'|'cowatch_presence'|'quiz', data: Record<string, any>) {
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

export async function saveQuizScore(username: string, category: string, score: number, streak: number) {
  const { error } = await supabase.from('quiz_scores').insert({ username, category, score, streak });
  if (error) throw error;
}

export type Reaction = { messageId: string; username: string; emoji: string };

export async function addReaction(messageId: string, username: string, emoji: string) {
  const { error } = await supabase.from('message_reactions').insert({ message_id: Number(messageId), username, emoji });
  if (error) throw error;
}

export async function listReactions(messageIds: string[]): Promise<Record<string, Reaction[]>> {
  if (!messageIds.length) return {} as any;
  const ids = messageIds.map(id => Number(id));
  const { data, error } = await supabase.from('message_reactions').select('message_id, username, emoji').in('message_id', ids);
  if (error) throw error;
  const map: Record<string, Reaction[]> = {};
  (data || []).forEach((r: any) => {
    const k = String(r.message_id);
    if (!map[k]) map[k] = [];
    map[k].push({ messageId: k, username: r.username, emoji: r.emoji });
  });
  return map;
}

export function subscribeToReactions(roomId: string, onInsert: (r: Reaction & { messageId: string }) => void): () => void {
  const channel = supabase
    .channel(`reactions-${roomId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'message_reactions' }, (payload) => {
      const row = payload.new as any;
      onInsert({ messageId: String(row.message_id), username: row.username, emoji: row.emoji });
    })
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}

export type ThreadReply = { id: string; parent_message_id: string; sender: string; content: string; created_at: string };

export async function addReply(roomId: string, parentMessageId: string, sender: string, content: string) {
  const { error } = await supabase.from('message_threads').insert({ room_id: roomId, parent_message_id: Number(parentMessageId), sender, content });
  if (error) throw error;
}

export async function listReplies(parentMessageId: string): Promise<ThreadReply[]> {
  const { data, error } = await supabase
    .from('message_threads')
    .select('id, parent_message_id, sender, content, created_at')
    .eq('parent_message_id', Number(parentMessageId))
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []) as any;
}

export function subscribeToReplies(parentMessageId: string, onInsert: (r: ThreadReply) => void): () => void {
  const channel = supabase
    .channel(`replies-${parentMessageId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'message_threads', filter: `parent_message_id=eq.${Number(parentMessageId)}` }, (payload) => {
      const row = payload.new as any;
      onInsert({ id: String(row.id), parent_message_id: String(row.parent_message_id), sender: row.sender, content: row.content, created_at: row.created_at });
    })
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}

export async function updateUserProfile(username: string, patch: { avatar_url?: string | null; bio?: string | null; full_name?: string | null; website?: string | null; location?: string | null; }) {
  const { error } = await supabase.from('users').update({ ...patch, updated_at: new Date().toISOString() as any }).eq('username', username);
  if (error) throw error;
}

export async function getUserProfile(username: string): Promise<{ username: string; avatar_url?: string | null; bio?: string | null; full_name?: string | null; website?: string | null; location?: string | null; }> {
  const { data, error } = await supabase.from('users').select('username, avatar_url, bio, full_name, website, location').eq('username', username).single();
  if (error) throw error;
  return data as any;
}

export async function createQuizRoom(roomId: string) {
  const { error } = await supabase.from('quiz_rooms').insert({ id: roomId, status: 'waiting' });
  if (error && !String(error.message).includes('duplicate')) throw error;
}

export async function setQuizRoomStatus(roomId: string, status: 'waiting'|'running'|'finished') {
  const { error } = await supabase.from('quiz_rooms').update({ status }).eq('id', roomId);
  if (error) throw error;
}

export async function upsertQuizParticipant(roomId: string, username: string, deltaScore = 0) {
  const { data, error } = await supabase.from('quiz_participants').upsert({ room_id: roomId, username, score: deltaScore }, { onConflict: 'room_id,username' }).select('room_id, username, score');
  if (error) throw error;
  if (deltaScore !== 0) {
    // Increment score
    await supabase.rpc('increment_quiz_score', { p_room: roomId, p_user: username, p_delta: deltaScore }).catch(async () => {
      // Fallback: manual update
      await supabase.from('quiz_participants').update({ score: (data?.[0]?.score || 0) + deltaScore }).eq('room_id', roomId).eq('username', username);
    });
  }
}

export async function listQuizParticipants(roomId: string): Promise<{ username: string; score: number }[]> {
  const { data, error } = await supabase.from('quiz_participants').select('username, score').eq('room_id', roomId).order('score', { ascending: false });
  if (error) throw error;
  return (data || []) as any;
}
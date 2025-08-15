-- CineFlix AI - Complete Entertainment Platform Schema
-- Created by Bilel Jammazi

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table - Core user management
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    location VARCHAR(100),
    website VARCHAR(255),
    date_of_birth DATE,
    preferences JSONB DEFAULT '{}',
    is_verified BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions for authentication
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Series table - TV series information
CREATE TABLE series (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tmdb_id INTEGER UNIQUE,
    title VARCHAR(255) NOT NULL,
    original_title VARCHAR(255),
    overview TEXT,
    poster_path TEXT,
    backdrop_path TEXT,
    first_air_date DATE,
    last_air_date DATE,
    status VARCHAR(50), -- 'Returning Series', 'Ended', 'Canceled', 'Pilot'
    type VARCHAR(50), -- 'Scripted', 'Reality', 'Documentary', 'News'
    number_of_seasons INTEGER DEFAULT 1,
    number_of_episodes INTEGER DEFAULT 0,
    vote_average DECIMAL(3,1),
    vote_count INTEGER DEFAULT 0,
    popularity DECIMAL(10,2),
    genres TEXT[],
    networks TEXT[],
    production_companies TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seasons table - Individual seasons of series
CREATE TABLE seasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    series_id UUID REFERENCES series(id) ON DELETE CASCADE,
    season_number INTEGER NOT NULL,
    title VARCHAR(255),
    overview TEXT,
    poster_path TEXT,
    air_date DATE,
    episode_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Episodes table - Individual episodes with download links
CREATE TABLE episodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    series_id UUID REFERENCES series(id) ON DELETE CASCADE,
    season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
    season_number INTEGER NOT NULL,
    episode_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    overview TEXT,
    still_path TEXT,
    air_date DATE,
    runtime INTEGER, -- in minutes
    vote_average DECIMAL(3,1),
    vote_count INTEGER DEFAULT 0,
    download_links TEXT[], -- Array of pixeldrain links
    quality_options JSONB DEFAULT '[]', -- Different quality versions
    subtitles JSONB DEFAULT '[]', -- Available subtitle tracks
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(series_id, season_number, episode_number)
);

-- Movies table - Individual movies
CREATE TABLE movies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tmdb_id INTEGER UNIQUE,
    title VARCHAR(255) NOT NULL,
    original_title VARCHAR(255),
    overview TEXT,
    poster_path TEXT,
    backdrop_path TEXT,
    release_date DATE,
    runtime INTEGER, -- in minutes
    status VARCHAR(50), -- 'Released', 'Post Production', 'In Production'
    vote_average DECIMAL(3,1),
    vote_count INTEGER DEFAULT 0,
    popularity DECIMAL(10,2),
    genres TEXT[],
    production_companies TEXT[],
    download_links TEXT[], -- Array of pixeldrain links
    quality_options JSONB DEFAULT '[]',
    subtitles JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User watch history
CREATE TABLE watch_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content_type VARCHAR(20) NOT NULL, -- 'movie' or 'episode'
    content_id UUID NOT NULL, -- movie_id or episode_id
    watch_progress DECIMAL(5,2) DEFAULT 0, -- percentage watched (0-100)
    current_time INTEGER DEFAULT 0, -- current position in seconds
    duration INTEGER, -- total duration in seconds
    is_completed BOOLEAN DEFAULT FALSE,
    last_watched TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User ratings and reviews
CREATE TABLE user_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content_type VARCHAR(20) NOT NULL, -- 'movie', 'episode', 'series'
    content_id UUID NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 10),
    review TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, content_type, content_id)
);

-- User favorites and watchlists
CREATE TABLE user_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    list_type VARCHAR(20) DEFAULT 'custom', -- 'favorites', 'watchlist', 'custom'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Items in user lists
CREATE TABLE list_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    list_id UUID REFERENCES user_lists(id) ON DELETE CASCADE,
    content_type VARCHAR(20) NOT NULL, -- 'movie', 'episode', 'series'
    content_id UUID NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    UNIQUE(list_id, content_type, content_id)
);

-- Chat rooms for messaging
CREATE TABLE chat_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100),
    type VARCHAR(20) NOT NULL, -- 'direct', 'group', 'community'
    description TEXT,
    avatar_url TEXT,
    is_private BOOLEAN DEFAULT FALSE,
    max_participants INTEGER DEFAULT 50,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat room participants
CREATE TABLE room_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member', -- 'admin', 'moderator', 'member'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_muted BOOLEAN DEFAULT FALSE,
    UNIQUE(room_id, user_id)
);

-- Chat messages
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text', -- 'text', 'image', 'file', 'system'
    metadata JSONB DEFAULT '{}', -- Additional message data
    reply_to_id UUID REFERENCES chat_messages(id),
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message reactions
CREATE TABLE message_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reaction VARCHAR(10) NOT NULL, -- emoji or reaction type
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id, reaction)
);

-- Gaming system
CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'chess', 'quiz', 'puzzle', 'strategy'
    description TEXT,
    rules TEXT,
    max_players INTEGER DEFAULT 1,
    is_ai_enabled BOOLEAN DEFAULT TRUE,
    difficulty_levels TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game sessions
CREATE TABLE game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'waiting', -- 'waiting', 'active', 'completed', 'abandoned'
    current_turn_user_id UUID REFERENCES users(id),
    game_state JSONB DEFAULT '{}',
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    winner_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game participants
CREATE TABLE game_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    player_number INTEGER NOT NULL,
    score INTEGER DEFAULT 0,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(session_id, user_id)
);

-- Game moves/actions
CREATE TABLE game_moves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
    player_id UUID REFERENCES users(id) ON DELETE CASCADE,
    move_data JSONB NOT NULL,
    move_number INTEGER NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz system
CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    difficulty VARCHAR(20), -- 'easy', 'medium', 'hard'
    time_limit INTEGER, -- in seconds, NULL for no limit
    total_questions INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz questions
CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) DEFAULT 'multiple_choice', -- 'multiple_choice', 'true_false', 'open_ended'
    options JSONB DEFAULT '[]', -- For multiple choice questions
    correct_answer TEXT,
    explanation TEXT,
    points INTEGER DEFAULT 1,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz attempts
CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 0,
    max_score INTEGER DEFAULT 0,
    time_taken INTEGER, -- in seconds
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz answers
CREATE TABLE quiz_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    question_id UUID REFERENCES quiz_questions(id) ON DELETE CASCADE,
    user_answer TEXT,
    is_correct BOOLEAN,
    points_earned INTEGER DEFAULT 0,
    time_taken INTEGER, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url TEXT,
    category VARCHAR(50),
    points INTEGER DEFAULT 0,
    requirements JSONB DEFAULT '{}',
    is_hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievement unlocks
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress JSONB DEFAULT '{}',
    UNIQUE(user_id, achievement_id)
);

-- Notifications system
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'system', 'movie', 'series', 'chat', 'game', 'achievement'
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    metadata JSONB DEFAULT '{}',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences and settings
CREATE TABLE user_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'dark', -- 'light', 'dark', 'auto'
    language VARCHAR(10) DEFAULT 'en',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    auto_play BOOLEAN DEFAULT TRUE,
    auto_next_episode BOOLEAN DEFAULT TRUE,
    quality_preference VARCHAR(10) DEFAULT '1080p',
    subtitle_preference VARCHAR(10) DEFAULT 'en',
    privacy_level VARCHAR(20) DEFAULT 'public', -- 'public', 'friends', 'private'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Friends and social connections
CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'blocked'
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, friend_id)
);

-- Content recommendations
CREATE TABLE recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content_type VARCHAR(20) NOT NULL, -- 'movie', 'series', 'episode'
    content_id UUID NOT NULL,
    reason TEXT,
    score DECIMAL(5,2), -- recommendation strength (0-100)
    is_viewed BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_series_tmdb_id ON series(tmdb_id);
CREATE INDEX idx_movies_tmdb_id ON movies(tmdb_id);
CREATE INDEX idx_episodes_series_season ON episodes(series_id, season_number);
CREATE INDEX idx_watch_history_user_content ON watch_history(user_id, content_type, content_id);
CREATE INDEX idx_chat_messages_room_time ON chat_messages(room_id, created_at);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_recommendations_user_score ON recommendations(user_id, score DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_series_updated_at BEFORE UPDATE ON series FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_movies_updated_at BEFORE UPDATE ON movies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_lists_updated_at BEFORE UPDATE ON user_lists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_ratings_updated_at BEFORE UPDATE ON user_ratings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_rooms_updated_at BEFORE UPDATE ON chat_rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default data
INSERT INTO games (name, type, description, rules, max_players, is_ai_enabled, difficulty_levels) VALUES
('Chess', 'chess', 'Classic chess game with AI opponent', 'Standard chess rules apply', 2, true, ARRAY['beginner', 'intermediate', 'advanced', 'expert']),
('Movie Quiz', 'quiz', 'Test your movie knowledge', 'Answer questions about movies and TV shows', 1, true, ARRAY['easy', 'medium', 'hard']),
('Tic-Tac-Toe', 'puzzle', 'Simple but strategic game', 'Get three in a row to win', 2, true, ARRAY['easy', 'medium', 'hard']),
('Anime Trivia', 'quiz', 'Test your anime knowledge', 'Answer questions about anime series and movies', 1, true, ARRAY['easy', 'medium', 'hard']);

-- Insert default achievements
INSERT INTO achievements (name, description, icon_url, category, points, requirements) VALUES
('First Watch', 'Watch your first movie or episode', '/achievements/first-watch.png', 'watching', 10, '{"type": "first_watch"}'),
('Series Binger', 'Watch 10 episodes in a day', '/achievements/series-binger.png', 'watching', 50, '{"type": "episodes_per_day", "count": 10}'),
('Movie Critic', 'Rate 50 movies or episodes', '/achievements/movie-critic.png', 'rating', 100, '{"type": "ratings_count", "count": 50}'),
('Chat Master', 'Send 100 messages', '/achievements/chat-master.png', 'social', 75, '{"type": "messages_count", "count": 100}'),
('Game Champion', 'Win 10 games', '/achievements/game-champion.png', 'gaming', 150, '{"type": "games_won", "count": 10}'),
('Quiz Expert', 'Get perfect score on 5 quizzes', '/achievements/quiz-expert.png', 'gaming', 200, '{"type": "perfect_quizzes", "count": 5}');

-- Insert default chat rooms
INSERT INTO chat_rooms (name, type, description, is_private) VALUES
('General Discussion', 'community', 'General chat for all users', false),
('Movie Recommendations', 'community', 'Share and discuss movie recommendations', false),
('Series Discussion', 'community', 'Discuss your favorite TV series', false),
('Gaming Corner', 'community', 'Chat about games and challenges', false);

-- Create views for common queries
CREATE VIEW series_with_episodes AS
SELECT 
    s.*,
    COUNT(e.id) as total_episodes,
    COUNT(DISTINCT e.season_number) as total_seasons
FROM series s
LEFT JOIN episodes e ON s.id = e.series_id
GROUP BY s.id;

CREATE VIEW user_watch_stats AS
SELECT 
    u.id,
    u.username,
    COUNT(wh.id) as total_watched,
    COUNT(CASE WHEN wh.content_type = 'movie' THEN 1 END) as movies_watched,
    COUNT(CASE WHEN wh.content_type = 'episode' THEN 1 END) as episodes_watched,
    AVG(wh.watch_progress) as avg_watch_progress
FROM users u
LEFT JOIN watch_history wh ON u.id = wh.user_id
GROUP BY u.id, u.username;

CREATE VIEW popular_content AS
SELECT 
    'movie' as content_type,
    m.id,
    m.title,
    m.poster_path,
    m.vote_average,
    COUNT(wh.id) as watch_count
FROM movies m
LEFT JOIN watch_history wh ON m.id = wh.content_id AND wh.content_type = 'movie'
GROUP BY m.id, m.title, m.poster_path, m.vote_average
UNION ALL
SELECT 
    'series' as content_type,
    s.id,
    s.title,
    s.poster_path,
    s.vote_average,
    COUNT(wh.id) as watch_count
FROM series s
LEFT JOIN watch_history wh ON s.id = wh.content_id AND wh.content_type = 'episode'
GROUP BY s.id, s.title, s.poster_path, s.vote_average
ORDER BY watch_count DESC, vote_average DESC;
-- PollRoom Database Schema
-- Initial migration for MVP serverless architecture

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Rooms table
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(6) UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Polls table
CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  poll_type VARCHAR(20) NOT NULL DEFAULT 'multiple_choice',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Votes table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  choice TEXT NOT NULL,
  session_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_id, session_id)
);

-- Indexes for performance
CREATE INDEX idx_rooms_code ON rooms(code);
CREATE INDEX idx_polls_room_id ON polls(room_id);
CREATE INDEX idx_votes_poll_id ON votes(poll_id);
CREATE INDEX idx_votes_session ON votes(session_id, poll_id);

-- Row Level Security (RLS) Setup
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow all for MVP - tighten later)
CREATE POLICY "Allow all operations on rooms" ON rooms USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on polls" ON polls USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on votes" ON votes USING (true) WITH CHECK (true);

-- Real-time publications for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE polls;
ALTER PUBLICATION supabase_realtime ADD TABLE votes;

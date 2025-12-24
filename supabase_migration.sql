-- Add session_id column to chat_history table
-- Run this in your Supabase SQL Editor

ALTER TABLE chat_history 
ADD COLUMN session_id text;

-- Optional: Create an index for performance if you have many chats
CREATE INDEX idx_chat_history_session_id ON chat_history(session_id);

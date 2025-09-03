-- Migration: Create guild_settings table
-- This migration is idempotent and can be run multiple times safely

CREATE TABLE IF NOT EXISTS guild_settings (
    guild_id TEXT PRIMARY KEY NOT NULL,
    stats_channel_id TEXT,
    leaderboard_channel_id TEXT,
    admin_role_id TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_guild_settings_guild_id ON guild_settings(guild_id);

-- Insert default settings for existing guilds (if any)
-- This ensures the table structure is always up to date
INSERT OR IGNORE INTO guild_settings (guild_id) 
SELECT DISTINCT guild_id FROM (
    SELECT '000000000000000000' as guild_id
    WHERE NOT EXISTS (SELECT 1 FROM guild_settings)
);

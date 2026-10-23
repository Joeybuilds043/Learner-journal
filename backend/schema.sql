-- Phase 2 SQL schema draft. Existing journal entries remain in browser localStorage;
-- this schema does not read, migrate, or delete the legacy journal storage key.
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL DEFAULT '',
  experience_level TEXT NOT NULL DEFAULT 'beginner',
  market_focus TEXT NOT NULL DEFAULT 'crypto',
  preferred_language TEXT NOT NULL DEFAULT 'English',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS watchlist_items (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE(profile_id, symbol)
);
CREATE TABLE IF NOT EXISTS research_reports (
  id TEXT PRIMARY KEY,
  profile_id TEXT,
  report_type TEXT NOT NULL CHECK(report_type IN ('daily_brief','asset_analysis','macro_review')),
  title TEXT NOT NULL,
  body_markdown TEXT NOT NULL,
  data_sources_json TEXT NOT NULL DEFAULT '[]',
  generated_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(profile_id) REFERENCES profiles(id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS analyst_messages (
  id TEXT PRIMARY KEY,
  profile_id TEXT,
  conversation_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('user','assistant')),
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(profile_id) REFERENCES profiles(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_reports_profile_date ON research_reports(profile_id, generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_date ON analyst_messages(conversation_id, created_at);

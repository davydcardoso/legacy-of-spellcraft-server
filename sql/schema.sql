-- PostgreSQL schema for MMORPG example
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  password_hash TEXT,
  level INT DEFAULT 1,
  xp BIGINT DEFAULT 0,
  house TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS player_attributes (
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  hp INT,
  mp INT,
  strength INT,
  agility INT,
  magic INT,
  PRIMARY KEY (player_id)
);

CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  data JSONB,
  stackable BOOLEAN DEFAULT false,
  max_stack INT DEFAULT 1
);

CREATE TABLE IF NOT EXISTS player_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  item_id TEXT REFERENCES items(id),
  quantity INT DEFAULT 1,
  slot INT, -- nullable for 'pockets' or indexed slots
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS player_equipment (
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  slot TEXT, -- e.g. head, body, feet, accessory
  item_id TEXT REFERENCES items(id),
  PRIMARY KEY (player_id, slot)
);

CREATE TABLE IF NOT EXISTS spells (
  id TEXT PRIMARY KEY,
  name TEXT,
  data JSONB
);

CREATE TABLE IF NOT EXISTS player_spells (
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  spell_id TEXT REFERENCES spells(id),
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (player_id, spell_id)
);

CREATE TABLE IF NOT EXISTS zones (
  id TEXT PRIMARY KEY,
  name TEXT,
  meta JSONB
);

CREATE TABLE IF NOT EXISTS mobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zone_id TEXT REFERENCES zones(id),
  template_id TEXT,
  x INT,
  y INT,
  data JSONB
);

CREATE INDEX IF NOT EXISTS idx_player_inventory_player ON player_inventory(player_id);
CREATE INDEX IF NOT EXISTS idx_player_equipment_player ON player_equipment(player_id);

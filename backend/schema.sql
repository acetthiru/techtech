-- ====================================================================
-- TECH BRIDGE '26: Visual Technical Rebus Challenge
-- Production PostgreSQL Database Schema
-- CSE Department Technical Symposium
-- ====================================================================

-- 1. Admins Table
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(64) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) DEFAULT 'ORGANIZER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- 2. Teams Table
CREATE TABLE IF NOT EXISTS teams (
    id VARCHAR(16) PRIMARY KEY, -- e.g. "TB-7001"
    name VARCHAR(128) UNIQUE NOT NULL,
    college VARCHAR(255) NOT NULL,
    department VARCHAR(128) NOT NULL,
    year VARCHAR(32) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    status VARCHAR(32) DEFAULT 'ACTIVE', -- 'ACTIVE', 'WARNED', 'DISQUALIFIED'
    round1_score INT DEFAULT 0,
    round2_score INT DEFAULT 0,
    round3_score INT DEFAULT 0,
    total_score INT DEFAULT 0,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Participants Table (Supports Individual or Team of 2)
CREATE TABLE IF NOT EXISTS participants (
    id SERIAL PRIMARY KEY,
    team_id VARCHAR(16) REFERENCES teams(id) ON DELETE CASCADE,
    full_name VARCHAR(128) NOT NULL,
    is_primary BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Rounds Table
CREATE TABLE IF NOT EXISTS rounds (
    round_number INT PRIMARY KEY,
    title VARCHAR(128) NOT NULL,
    duration_seconds INT NOT NULL, -- 1800, 900, 900
    total_questions INT NOT NULL,  -- 30, 15, 10
    points_per_question INT NOT NULL, -- 1, 2, 3
    is_buzzer_round BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Questions Table
CREATE TABLE IF NOT EXISTS questions (
    id VARCHAR(32) PRIMARY KEY, -- e.g. "q101"
    round INT REFERENCES rounds(round_number),
    question_number INT NOT NULL,
    domain VARCHAR(128) NOT NULL,
    image_url TEXT NOT NULL,
    rebus_formula TEXT,
    correct_answer VARCHAR(255) NOT NULL, -- AUTHORITATIVE: NEVER EXPOSED TO CLIENT
    aliases JSONB DEFAULT '[]'::jsonb,    -- Accepted alternative spellings/synonyms
    points INT NOT NULL,
    difficulty VARCHAR(32) NOT NULL,      -- 'Medium', 'Hard', 'Very Hard'
    explanation TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_round_question UNIQUE (round, question_number)
);

-- 6. Submissions Table (Authoritative One-Submission-Per-Question)
CREATE TABLE IF NOT EXISTS submissions (
    id VARCHAR(64) PRIMARY KEY,
    team_id VARCHAR(16) REFERENCES teams(id) ON DELETE CASCADE,
    question_id VARCHAR(32) REFERENCES questions(id) ON DELETE CASCADE,
    round INT NOT NULL,
    question_number INT NOT NULL,
    submitted_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    points_awarded INT NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_team_question_submission UNIQUE (team_id, question_id)
);

-- 7. Scores Table (Aggregated Audit Ledger)
CREATE TABLE IF NOT EXISTS scores (
    id SERIAL PRIMARY KEY,
    team_id VARCHAR(16) REFERENCES teams(id) ON DELETE CASCADE,
    round INT NOT NULL,
    total_points INT DEFAULT 0,
    correct_count INT DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_team_round_score UNIQUE (team_id, round)
);

-- 8. Buzzer Events Table (Round 3 Microsecond/Millisecond Timestamp Resolution)
CREATE TABLE IF NOT EXISTS buzzer_events (
    id VARCHAR(64) PRIMARY KEY,
    question_id VARCHAR(32) REFERENCES questions(id) ON DELETE CASCADE,
    round INT NOT NULL,
    team_id VARCHAR(16) REFERENCES teams(id) ON DELETE CASCADE,
    server_timestamp BIGINT NOT NULL, -- Microsecond/millisecond atomic precision
    won BOOLEAN DEFAULT FALSE,
    points_awarded INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Anti-Cheat Events Table
CREATE TABLE IF NOT EXISTS anti_cheat_events (
    id VARCHAR(64) PRIMARY KEY,
    team_id VARCHAR(16) REFERENCES teams(id) ON DELETE CASCADE,
    event_type VARCHAR(64) NOT NULL, -- 'APP_BACKGROUND', 'WINDOW_FOCUS_LOST', 'MULTI_WINDOW_DETECTED', etc.
    details TEXT,
    severity VARCHAR(32) NOT NULL,   -- 'INFO', 'WARNING', 'CRITICAL'
    server_timestamp BIGINT NOT NULL,
    action_taken VARCHAR(32),        -- 'WARNED', 'DISQUALIFIED', 'IGNORED'
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Event Settings Table (State Machine)
CREATE TABLE IF NOT EXISTS event_settings (
    id INT PRIMARY KEY DEFAULT 1,
    status VARCHAR(32) DEFAULT 'WAITING', -- 'WAITING', 'RUNNING', 'PAUSED', 'COMPLETED'
    current_round INT DEFAULT 1,
    current_question_index INT DEFAULT 0,
    round_started_at TIMESTAMP WITH TIME ZONE,
    round_ends_at TIMESTAMP WITH TIME ZONE,
    is_paused BOOLEAN DEFAULT FALSE,
    paused_remaining_seconds INT DEFAULT 1800,
    show_leaderboard BOOLEAN DEFAULT TRUE,
    buzzer_active BOOLEAN DEFAULT FALSE,
    buzzer_winner_team_id VARCHAR(16),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT single_row CHECK (id = 1)
);

-- Indexes for ultra-fast query execution under 300+ concurrent symposium teams
CREATE INDEX IF NOT EXISTS idx_submissions_team ON submissions(team_id);
CREATE INDEX IF NOT EXISTS idx_submissions_question ON submissions(question_id);
CREATE INDEX IF NOT EXISTS idx_anti_cheat_team ON anti_cheat_events(team_id);
CREATE INDEX IF NOT EXISTS idx_buzzer_question ON buzzer_events(question_id, server_timestamp);

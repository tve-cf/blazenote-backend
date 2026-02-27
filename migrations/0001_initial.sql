-- Migration number: 0001 	 2026-02-27T10:46:59.995Z
-- UUID7 Generation View
-- This creates a view that generates UUID7 identifiers for our records
DROP VIEW IF EXISTS uuid7;
CREATE VIEW uuid7 AS
WITH unixtime AS (
	SELECT CAST((STRFTIME('%s') * 1000) + ((STRFTIME('%f') * 1000) % 1000) AS INTEGER) AS time
)
SELECT FORMAT('%08x-%04x-%04x-%04x-%012x',
       (select time from unixtime) >> 16,
       (select time from unixtime) & 0xffff,
       ABS(RANDOM()) % 0x0fff + 0x7000,
       ABS(RANDOM()) % 0x3fff + 0x8000,
       ABS(RANDOM()) >> 16) AS next;

-- Notes Table
-- Stores the main note data with title and description
CREATE TABLE note (
    id TEXT PRIMARY KEY,                      -- UUID as a string
    title TEXT NOT NULL,                      -- Title of the note
    description TEXT,                         -- Description of the note (can be NULL)
    created_at INTEGER DEFAULT (strftime('%s', 'now')),  -- Unix epoch timestamp for creation
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))   -- Unix epoch timestamp for last update
);

-- Update Trigger for Notes
-- Automatically updates the updated_at field when a note is modified
CREATE TRIGGER update_note_before_update
AFTER UPDATE ON note
FOR EACH ROW
BEGIN
    UPDATE note SET updated_at = strftime('%s', 'now') WHERE id = OLD.id;
END;

-- Auto-ID Trigger for Notes
-- Automatically generates UUID7 for new notes if no ID is provided
DROP TRIGGER IF EXISTS trigger_after_insert_on_note;
CREATE TRIGGER trigger_after_insert_on_note
    AFTER INSERT ON note WHEN NEW.id IS NULL
BEGIN
	UPDATE note SET id = (SELECT next FROM uuid7) WHERE ROWID = NEW.ROWID;
END;

-- Files Table
-- Stores file attachments associated with notes
CREATE TABLE file (
    id TEXT PRIMARY KEY,                                 -- UUID as a string
    note_id TEXT,                                     -- Reference to note id
    name TEXT NOT NULL,                                  -- File name
    created_at INTEGER DEFAULT (strftime('%s', 'now')), -- Unix epoch timestamp for creation
    updated_at INTEGER DEFAULT (strftime('%s', 'now')), -- Unix epoch timestamp for last update
    FOREIGN KEY (note_id) REFERENCES note(id)          -- Foreign key relationship
);

-- Update Trigger for Files
-- Automatically updates the updated_at field when a file record is modified
CREATE TRIGGER update_file_before_update
AFTER UPDATE ON file
FOR EACH ROW
BEGIN
    UPDATE file SET updated_at = strftime('%s', 'now') WHERE id = OLD.id;
END;

-- Auto-ID Trigger for Files
-- Automatically generates UUID7 for new files if no ID is provided
DROP TRIGGER IF EXISTS trigger_after_insert_on_file;
CREATE TRIGGER trigger_after_insert_on_file
    AFTER INSERT ON file WHEN NEW.id IS NULL
BEGIN
	UPDATE file SET id = (SELECT next FROM uuid7) WHERE ROWID = NEW.ROWID;
END;
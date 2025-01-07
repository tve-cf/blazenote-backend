-- Migration number: 0002 	 2024-12-30T04:10:53.177Z

CREATE TABLE file (
    id TEXT PRIMARY KEY,                                 -- UUID as a string
    note_id INTEGER,                                     -- Reference to note id
    name TEXT NOT NULL,                                  -- File name
    url TEXT NOT NULL,                                   -- Url of the file
    created_at INTEGER DEFAULT (strftime('%s', 'now')),  -- Unix epoch timestamp for creation (defaults to current time)
    updated_at INTEGER DEFAULT (strftime('%s', 'now')),  -- Unix epoch timestamp for last update (defaults to current time)
FOREIGN KEY (note_id) REFERENCES note(id)
);

-- Trigger to automatically update the `updated_at` field when a record is modified
CREATE TRIGGER update_file_before_update
AFTER UPDATE ON file
FOR EACH ROW
BEGIN
    UPDATE file SET updated_at = strftime('%s', 'now') WHERE id = OLD.id;
END;

-- Create the trigger using built-in SQLite functions
DROP TRIGGER IF EXISTS trigger_after_insert_on_file;
CREATE TRIGGER trigger_after_insert_on_file
    AFTER INSERT ON file WHEN NEW.id IS NULL
BEGIN
	UPDATE file SET id = (SELECT next FROM uuid7) WHERE ROWID = NEW.ROWID;
END;
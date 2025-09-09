-- PollRoom Sample Data
-- Test data for development and validation

-- Insert sample rooms
INSERT INTO rooms (code, name) VALUES 
  ('ABC123', 'Sample Training Room'),
  ('XYZ789', 'Team Meeting Room'),
  ('TEST01', 'Development Test Room');

-- Insert sample polls for the first room
INSERT INTO polls (room_id, question, options, poll_type) VALUES 
  (
    (SELECT id FROM rooms WHERE code = 'ABC123'),
    'How would you rate this presentation?',
    '["1 - Poor", "2 - Fair", "3 - Good", "4 - Very Good", "5 - Excellent"]',
    'rating'
  ),
  (
    (SELECT id FROM rooms WHERE code = 'ABC123'),
    'What topic interests you most?',
    '["Real-time Features", "Database Design", "API Development", "UI/UX"]',
    'multiple_choice'
  ),
  (
    (SELECT id FROM rooms WHERE code = 'XYZ789'),
    'Should we implement this feature?',
    '[]',
    'yes_no'
  );

-- Insert sample votes
INSERT INTO votes (poll_id, choice, session_id) VALUES 
  (
    (SELECT id FROM polls WHERE question = 'How would you rate this presentation?'),
    '4',
    'session_001'
  ),
  (
    (SELECT id FROM polls WHERE question = 'How would you rate this presentation?'),
    '5',
    'session_002'
  ),
  (
    (SELECT id FROM polls WHERE question = 'What topic interests you most?'),
    'Real-time Features',
    'session_001'
  ),
  (
    (SELECT id FROM polls WHERE question = 'What topic interests you most?'),
    'API Development',
    'session_003'
  ),
  (
    (SELECT id FROM polls WHERE question = 'Should we implement this feature?'),
    'yes',
    'session_002'
  );

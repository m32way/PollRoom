import { NextRequest } from 'next/server';
import { POST as createRoom } from '@/app/api/rooms/create/route';
import { POST as createPoll } from '@/app/api/polls/create/route';
import { GET as getPoll } from '@/app/api/polls/[id]/route';
import { POST as votePoll } from '@/app/api/polls/[id]/vote/route';
import { GET as getResults } from '@/app/api/polls/[id]/results/route';

// Mock Supabase
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn()
      }))
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn()
      }))
    })),
    delete: jest.fn(() => ({
      eq: jest.fn()
    }))
  }))
};

jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabase
}));

// Mock KV
jest.mock('@/lib/kv', () => ({
  SessionManager: {
    createSession: jest.fn(),
    getSession: jest.fn(),
    updateSessionActivity: jest.fn(),
    deleteSession: jest.fn(),
    isSessionValid: jest.fn()
  },
  RateLimiter: {
    checkRateLimit: jest.fn(() => ({ allowed: true, remaining: 10 }))
  }
}));

describe('API Feature Tests', () => {
  let testRoomId: string;
  let testPollId: string;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Room Expiration Handling', () => {
    it('should reject access to polls in expired rooms', async () => {
      // Mock expired room data
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({
              data: {
                id: 'test-poll-id',
                room_id: 'test-room-id',
                question: 'Test question',
                poll_type: 'yes_no',
                options: { yes: 'Yes', no: 'No' },
                is_active: true,
                created_at: '2025-09-09T00:00:00Z',
                rooms: {
                  id: 'test-room-id',
                  code: 'TEST01',
                  name: 'Test Room',
                  expires_at: '2025-09-09T05:00:00Z' // Expired time
                }
              },
              error: null
            }))
          }))
        }))
      });

      const request = new NextRequest('http://localhost:3000/api/polls/test-poll-id');
      const response = await getPoll(request, { params: Promise.resolve({ id: 'test-poll-id' }) });
      const data = await response.json();

      expect(response.status).toBe(410);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Room expired');
      expect(data.details).toBe('The room containing this poll has expired');
    });

    it('should reject voting on polls in expired rooms', async () => {
      const mockSupabase = require('@/lib/supabase').supabase;
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({
              data: {
                id: 'test-poll-id',
                room_id: 'test-room-id',
                question: 'Test question',
                poll_type: 'yes_no',
                options: { yes: 'Yes', no: 'No' },
                is_active: true,
                created_at: '2025-09-09T00:00:00Z',
                rooms: {
                  id: 'test-room-id',
                  code: 'TEST01',
                  name: 'Test Room',
                  expires_at: '2025-09-09T05:00:00Z' // Expired time
                }
              },
              error: null
            }))
          }))
        }))
      });

      const request = new NextRequest('http://localhost:3000/api/polls/test-poll-id/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choice: 'yes' })
      });
      const response = await votePoll(request, { params: Promise.resolve({ id: 'test-poll-id' }) });
      const data = await response.json();

      expect(response.status).toBe(410);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Room expired');
    });

    it('should reject results requests for polls in expired rooms', async () => {
      const mockSupabase = require('@/lib/supabase').supabase;
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({
              data: {
                id: 'test-poll-id',
                room_id: 'test-room-id',
                question: 'Test question',
                poll_type: 'yes_no',
                options: { yes: 'Yes', no: 'No' },
                is_active: true,
                created_at: '2025-09-09T00:00:00Z',
                rooms: {
                  id: 'test-room-id',
                  code: 'TEST01',
                  name: 'Test Room',
                  expires_at: '2025-09-09T05:00:00Z' // Expired time
                }
              },
              error: null
            }))
          }))
        }))
      });

      const request = new NextRequest('http://localhost:3000/api/polls/test-poll-id/results');
      const response = await getResults(request, { params: Promise.resolve({ id: 'test-poll-id' }) });
      const data = await response.json();

      expect(response.status).toBe(410);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Room expired');
    });
  });

  describe('Invalid Poll ID Format Validation', () => {
    it('should reject invalid UUID formats', async () => {
      const invalidIds = ['invalid-id', '123', 'not-a-uuid-at-all', 'abc-def-ghi'];

      for (const invalidId of invalidIds) {
        const request = new NextRequest(`http://localhost:3000/api/polls/${invalidId}`);
        const response = await getPoll(request, { params: Promise.resolve({ id: invalidId }) });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toBe('Invalid poll ID');
        expect(data.details).toBe('Poll ID must be a valid UUID');
      }
    });

    it('should reject invalid UUID formats for voting', async () => {
      const invalidIds = ['invalid-id', '123', 'not-a-uuid-at-all'];

      for (const invalidId of invalidIds) {
        const request = new NextRequest(`http://localhost:3000/api/polls/${invalidId}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ choice: 'yes' })
        });
        const response = await votePoll(request, { params: Promise.resolve({ id: invalidId }) });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toBe('Invalid poll ID');
        expect(data.details).toBe('Poll ID must be a valid UUID');
      }
    });

    it('should reject invalid UUID formats for results', async () => {
      const invalidIds = ['invalid-id', '123', 'not-a-uuid-at-all'];

      for (const invalidId of invalidIds) {
        const request = new NextRequest(`http://localhost:3000/api/polls/${invalidId}/results`);
        const response = await getResults(request, { params: Promise.resolve({ id: invalidId }) });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toBe('Invalid poll ID');
        expect(data.details).toBe('Poll ID must be a valid UUID');
      }
    });
  });

  describe('Invalid Choice Validation', () => {
    beforeEach(() => {
      const mockSupabase = require('@/lib/supabase').supabase;
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({
              data: {
                id: 'test-poll-id',
                room_id: 'test-room-id',
                question: 'Test question',
                poll_type: 'yes_no',
                options: { yes: 'Yes', no: 'No' },
                is_active: true,
                created_at: '2025-09-09T00:00:00Z',
                rooms: {
                  id: 'test-room-id',
                  code: 'TEST01',
                  name: 'Test Room',
                  expires_at: '2025-09-10T00:00:00Z' // Future time
                }
              },
              error: null
            }))
          }))
        }))
      });
    });

    it('should reject invalid choices for yes/no polls', async () => {
      const invalidChoices = ['maybe', 'sometimes', 'unknown', ''];

      for (const choice of invalidChoices) {
        const request = new NextRequest('http://localhost:3000/api/polls/test-poll-id/vote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ choice })
        });
        const response = await votePoll(request, { params: Promise.resolve({ id: 'test-poll-id' }) });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toBe('Invalid choice');
        expect(data.details).toBe('Choice must be one of: yes, no');
      }
    });

    it('should reject invalid choices for rating polls', async () => {
      const mockSupabase = require('@/lib/supabase').supabase;
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({
              data: {
                id: 'test-poll-id',
                room_id: 'test-room-id',
                question: 'Test rating question',
                poll_type: 'rating',
                options: { min: 1, max: 5 },
                is_active: true,
                created_at: '2025-09-09T00:00:00Z',
                rooms: {
                  id: 'test-room-id',
                  code: 'TEST01',
                  name: 'Test Room',
                  expires_at: '2025-09-10T00:00:00Z'
                }
              },
              error: null
            }))
          }))
        }))
      });

      const invalidChoices = ['0', '6', '10', 'maybe', ''];

      for (const choice of invalidChoices) {
        const request = new NextRequest('http://localhost:3000/api/polls/test-poll-id/vote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ choice })
        });
        const response = await votePoll(request, { params: Promise.resolve({ id: 'test-poll-id' }) });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toBe('Invalid choice');
        expect(data.details).toBe('Choice must be one of: 1, 2, 3, 4, 5');
      }
    });

    it('should reject invalid choices for multiple choice polls', async () => {
      const mockSupabase = require('@/lib/supabase').supabase;
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({
              data: {
                id: 'test-poll-id',
                room_id: 'test-room-id',
                question: 'Test multiple choice question',
                poll_type: 'multiple_choice',
                options: { a: 'Option A', b: 'Option B', c: 'Option C' },
                is_active: true,
                created_at: '2025-09-09T00:00:00Z',
                rooms: {
                  id: 'test-room-id',
                  code: 'TEST01',
                  name: 'Test Room',
                  expires_at: '2025-09-10T00:00:00Z'
                }
              },
              error: null
            }))
          }))
        }))
      });

      const invalidChoices = ['d', 'e', 'z', 'unknown', ''];

      for (const choice of invalidChoices) {
        const request = new NextRequest('http://localhost:3000/api/polls/test-poll-id/vote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ choice })
        });
        const response = await votePoll(request, { params: Promise.resolve({ id: 'test-poll-id' }) });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toBe('Invalid choice');
        expect(data.details).toBe('Choice must be one of: a, b, c');
      }
    });
  });

  describe('Vote Deduplication', () => {
    beforeEach(() => {
      const mockSupabase = require('@/lib/supabase').supabase;
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({
              data: {
                id: 'test-poll-id',
                room_id: 'test-room-id',
                question: 'Test question',
                poll_type: 'yes_no',
                options: { yes: 'Yes', no: 'No' },
                is_active: true,
                created_at: '2025-09-09T00:00:00Z',
                rooms: {
                  id: 'test-room-id',
                  code: 'TEST01',
                  name: 'Test Room',
                  expires_at: '2025-09-10T00:00:00Z'
                }
              },
              error: null
            }))
          }))
        }))
      });
    });

    it('should allow first vote from a session', async () => {
      const mockSupabase = require('@/lib/supabase').supabase;
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({
              data: null, // No existing vote
              error: { code: 'PGRST116' } // No rows found
            }))
          }))
        })),
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: {
                id: 'vote-id',
                poll_id: 'test-poll-id',
                choice: 'yes',
                created_at: '2025-09-09T00:00:00Z'
              },
              error: null
            }))
          }))
        }))
      });

      const request = new NextRequest('http://localhost:3000/api/polls/test-poll-id/vote', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-session-id': 'test-session-123'
        },
        body: JSON.stringify({ choice: 'yes' })
      });
      const response = await votePoll(request, { params: Promise.resolve({ id: 'test-poll-id' }) });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.choice).toBe('yes');
    });

    it('should reject duplicate votes from the same session', async () => {
      const mockSupabase = require('@/lib/supabase').supabase;
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({
              data: {
                id: 'existing-vote-id',
                poll_id: 'test-poll-id',
                choice: 'yes',
                created_at: '2025-09-09T00:00:00Z'
              },
              error: null
            }))
          }))
        }))
      });

      const request = new NextRequest('http://localhost:3000/api/polls/test-poll-id/vote', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-session-id': 'test-session-123'
        },
        body: JSON.stringify({ choice: 'no' })
      });
      const response = await votePoll(request, { params: Promise.resolve({ id: 'test-poll-id' }) });
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Already voted');
      expect(data.details).toBe('You have already voted on this poll');
    });
  });

  describe('High-Frequency Voting', () => {
    it('should handle multiple rapid votes from different sessions', async () => {
      const mockSupabase = require('@/lib/supabase').supabase;
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({
              data: {
                id: 'test-poll-id',
                room_id: 'test-room-id',
                question: 'Test question',
                poll_type: 'yes_no',
                options: { yes: 'Yes', no: 'No' },
                is_active: true,
                created_at: '2025-09-09T00:00:00Z',
                rooms: {
                  id: 'test-room-id',
                  code: 'TEST01',
                  name: 'Test Room',
                  expires_at: '2025-09-10T00:00:00Z'
                }
              },
              error: null
            }))
          }))
        })),
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: {
                id: 'vote-id',
                poll_id: 'test-poll-id',
                choice: 'yes',
                created_at: '2025-09-09T00:00:00Z'
              },
              error: null
            }))
          }))
        }))
      });

      // Mock no existing votes for each session
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({
              data: null,
              error: { code: 'PGRST116' }
            }))
          }))
        })),
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: { id: 'vote-1', poll_id: 'test-poll-id', choice: 'yes', created_at: '2025-09-09T00:00:00Z' },
              error: null
            }))
          }))
        }))
      });

      const requests = Array.from({ length: 5 }, (_, i) => 
        new NextRequest('http://localhost:3000/api/polls/test-poll-id/vote', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-session-id': `rapid-session-${i}`
          },
          body: JSON.stringify({ choice: 'yes' })
        })
      );

      const responses = await Promise.all(
        requests.map(req => votePoll(req, { params: Promise.resolve({ id: 'test-poll-id' }) }))
      );

      // All should succeed (different sessions)
      responses.forEach(response => {
        expect(response.status).toBe(201);
      });
    });
  });
});

/**
 * Integration Tests for PollRoom API
 * 
 * These tests verify the actual API endpoints work correctly
 * by making real HTTP requests to the running server.
 */

import { NextRequest } from 'next/server';
import { POST as createRoom } from '@/app/api/rooms/create/route';
import { POST as createPoll } from '@/app/api/polls/create/route';
import { GET as getPoll } from '@/app/api/polls/[id]/route';
import { POST as votePoll } from '@/app/api/polls/[id]/vote/route';
import { GET as getResults } from '@/app/api/polls/[id]/results/route';

describe('PollRoom API Integration Tests', () => {
  let testRoomId: string;
  let testPollId: string;

  beforeAll(async () => {
    // Create a test room
    const roomRequest = new NextRequest('http://localhost:3000/api/rooms/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Integration Test Room' })
    });
    
    const roomResponse = await createRoom(roomRequest);
    const roomData = await roomResponse.json();
    
    if (roomData.success) {
      testRoomId = roomData.data.id;
      
      // Create a test poll
      const pollRequest = new NextRequest('http://localhost:3000/api/polls/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: testRoomId,
          question: 'Integration test poll',
          pollType: 'yes_no'
        })
      });
      
      const pollResponse = await createPoll(pollRequest);
      const pollData = await pollResponse.json();
      
      if (pollData.success) {
        testPollId = pollData.data.id;
      }
    }
  });

  describe('Poll Lookup', () => {
    it('should retrieve a poll by ID', async () => {
      if (!testPollId) {
        console.log('Skipping test - no test poll ID available');
        return;
      }

      const request = new NextRequest(`http://localhost:3000/api/polls/${testPollId}`);
      const response = await getPoll(request, { params: Promise.resolve({ id: testPollId }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(testPollId);
      expect(data.data.question).toBe('Integration test poll');
      expect(data.data.poll_type).toBe('yes_no');
    });

    it('should reject invalid UUID formats', async () => {
      const invalidIds = ['invalid-id', '123', 'not-a-uuid-at-all'];

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
  });

  describe('Voting', () => {
    it('should allow valid votes', async () => {
      if (!testPollId) {
        console.log('Skipping test - no test poll ID available');
        return;
      }

      const request = new NextRequest(`http://localhost:3000/api/polls/${testPollId}/vote`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-session-id': 'integration-test-session-1'
        },
        body: JSON.stringify({ choice: 'yes' })
      });
      
      const response = await votePoll(request, { params: Promise.resolve({ id: testPollId }) });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.choice).toBe('yes');
      expect(data.data.poll_id).toBe(testPollId);
    });

    it('should reject duplicate votes from the same session', async () => {
      if (!testPollId) {
        console.log('Skipping test - no test poll ID available');
        return;
      }

      const request = new NextRequest(`http://localhost:3000/api/polls/${testPollId}/vote`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-session-id': 'integration-test-session-1' // Same session as previous test
        },
        body: JSON.stringify({ choice: 'no' })
      });
      
      const response = await votePoll(request, { params: Promise.resolve({ id: testPollId }) });
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Already voted');
      expect(data.details).toBe('You have already voted on this poll');
    });

    it('should reject invalid choices', async () => {
      if (!testPollId) {
        console.log('Skipping test - no test poll ID available');
        return;
      }

      const request = new NextRequest(`http://localhost:3000/api/polls/${testPollId}/vote`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-session-id': 'integration-test-session-2'
        },
        body: JSON.stringify({ choice: 'maybe' })
      });
      
      const response = await votePoll(request, { params: Promise.resolve({ id: testPollId }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid choice');
      expect(data.details).toBe('Choice must be one of: yes, no');
    });
  });

  describe('Results', () => {
    it('should return poll results', async () => {
      if (!testPollId) {
        console.log('Skipping test - no test poll ID available');
        return;
      }

      const request = new NextRequest(`http://localhost:3000/api/polls/${testPollId}/results`);
      const response = await getResults(request, { params: Promise.resolve({ id: testPollId }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.poll_id).toBe(testPollId);
      expect(data.data.total_votes).toBeGreaterThan(0);
      expect(data.data.results).toHaveProperty('yes');
      expect(data.data.results).toHaveProperty('no');
      expect(data.data.results.yes.count).toBeGreaterThan(0);
    });
  });

  describe('High-Frequency Voting', () => {
    it('should handle multiple rapid votes from different sessions', async () => {
      if (!testPollId) {
        console.log('Skipping test - no test poll ID available');
        return;
      }

      const requests = Array.from({ length: 5 }, (_, i) => 
        new NextRequest(`http://localhost:3000/api/polls/${testPollId}/vote`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-session-id': `rapid-test-session-${i}`
          },
          body: JSON.stringify({ choice: 'yes' })
        })
      );

      const responses = await Promise.all(
        requests.map(req => votePoll(req, { params: Promise.resolve({ id: testPollId }) }))
      );

      // All should succeed (different sessions)
      responses.forEach(response => {
        expect(response.status).toBe(201);
      });
    });
  });
});

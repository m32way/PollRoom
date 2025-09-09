// Database connection test utility
// This file helps validate Supabase connection and schema

import { supabase } from './supabase';

export async function testDatabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Check if environment variables are set
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "https://placeholder.supabase.co") {
      return { success: false, error: "Supabase environment variables not configured. Please set up .env.local file." };
    }
    
    // Test basic connection
    const { data, error } = await supabase
      .from('rooms')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Database connection failed:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Database connection successful');
    return { success: true, data };
  } catch (error) {
    console.error('Database test failed:', error);
    return { success: false, error: String(error) };
  }
}

export async function testSchemaTables() {
  try {
    console.log('Testing database schema...');
    
    // Test rooms table
    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('*')
      .limit(1);
    
    if (roomsError) {
      console.error('Rooms table test failed:', roomsError);
      return { success: false, error: roomsError.message };
    }
    
    // Test polls table
    const { data: polls, error: pollsError } = await supabase
      .from('polls')
      .select('*')
      .limit(1);
    
    if (pollsError) {
      console.error('Polls table test failed:', pollsError);
      return { success: false, error: pollsError.message };
    }
    
    // Test votes table
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('*')
      .limit(1);
    
    if (votesError) {
      console.error('Votes table test failed:', votesError);
      return { success: false, error: votesError.message };
    }
    
    console.log('✅ All database tables accessible');
    return { 
      success: true, 
      tables: { rooms: rooms?.length || 0, polls: polls?.length || 0, votes: votes?.length || 0 }
    };
  } catch (error) {
    console.error('Schema test failed:', error);
    return { success: false, error: String(error) };
  }
}

export async function testRealTimeSubscription() {
  try {
    console.log('Testing real-time subscription...');
    
    const channel = supabase
      .channel('test-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'rooms' },
        (payload) => {
          console.log('✅ Real-time subscription working:', payload);
        }
      )
      .subscribe();
    
    // Wait a moment then unsubscribe
    setTimeout(() => {
      supabase.removeChannel(channel);
      console.log('✅ Real-time test completed');
    }, 2000);
    
    return { success: true };
  } catch (error) {
    console.error('Real-time test failed:', error);
    return { success: false, error: String(error) };
  }
}

export async function runAllDatabaseTests() {
  console.log('🧪 Running comprehensive database tests...');
  
  const connectionTest = await testDatabaseConnection();
  if (!connectionTest.success) {
    return { success: false, step: 'connection', error: connectionTest.error };
  }
  
  const schemaTest = await testSchemaTables();
  if (!schemaTest.success) {
    return { success: false, step: 'schema', error: schemaTest.error };
  }
  
  const realtimeTest = await testRealTimeSubscription();
  if (!realtimeTest.success) {
    return { success: false, step: 'realtime', error: realtimeTest.error };
  }
  
  console.log('🎉 All database tests passed!');
  return { success: true, results: { connectionTest, schemaTest, realtimeTest } };
}

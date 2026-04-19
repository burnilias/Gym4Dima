import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Replace with your actual Supabase URL and Anon Key
// You can find these in your Supabase project settings
const supabaseUrl = 'https://fdyqxkzozgkufqsmrfye.supabase.co'; // Replace 'https://fdyqxkzozgkufqsmrfye.supabase.co' with your actual Supabase project URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkeXF4a3pvemdrdWZxc21yZnllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4Mzg0NjksImV4cCI6MjA2MzQxNDQ2OX0.m4VYtcGcihyo-vmOzRZEbUZwsuRWgAUsIqytlsnxg8A'; // Replace 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkeXF4a3pvemdrdWZxc21yZnllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4Mzg0NjksImV4cCI6MjA2MzQxNDQ2OX0.m4VYtcGcihyo-vmOzRZEbUZwsuRWgAUsIqytlsnxg8A' with your actual Supabase project Anon Key

// The Supabase URL and Anon Key have been confirmed by the user.
// The following check is no longer needed as the provided credentials are considered actual.
/*
if (supabaseUrl === 'https://fdyqxkzozgkufqsmrfye.supabase.co' || supabaseAnonKey === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkeXF4a3pvemdrdWZxc21yZnllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4Mzg0NjksImV4cCI6MjA2MzQxNDQ2OX0.m4VYtcGcihyo-vmOzRZEbUZwsuRWgAUsIqytlsnxg8A') {
  console.error(
    'ERROR: Supabase URL or Anon Key is not configured.\n' +
    'Please open src/supabaseClient.js and replace \'https://fdyqxkzozgkufqsmrfye.supabase.co\' and \'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkeXF4a3pvemdrdWZxc21yZnllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4Mzg0NjksImV4cCI6MjA2MzQxNDQ2OX0.m4VYtcGcihyo-vmOzRZEbUZwsuRWgAUsIqytlsnxg8A\' \n' +
    'with your actual Supabase project credentials. You can find these in your Supabase project settings.'
  );
  // Throw an error to prevent the app from running with invalid credentials
  throw new Error('Supabase client is not configured. Please check your environment variables or src/supabaseClient.js.');
}
*/

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

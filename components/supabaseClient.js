import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mfhvuzdxtthejvqjnjkq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1maHZ1emR4dHRoZWp2cWpuamtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyMTQ1NjEsImV4cCI6MjEwMzc5MDU2MX0.dprrhboRrwgDnC5WoHA8Se3WvyayhLPu0noIiTqSU8w';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

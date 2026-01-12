import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://hfbkuxvscmiruqyceyhr.supabase.co';
const supabaseAnonKey = 'sb_publishable_2sW2I_ccoA72XEbpiDobHA_7IkrHBl-';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
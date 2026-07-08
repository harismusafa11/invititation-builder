import { createClient } from '@supabase/supabase-js';

const supabaseUrl = ((import.meta as any).env.VITE_SUPABASE_URL as string) || '';
const supabaseAnonKey = ((import.meta as any).env.VITE_SUPABASE_ANON_KEY as string) || '';

// Detect if we should use the real Supabase or run in Simulator mode
const isSimulator = !supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('YOUR_') || supabaseAnonKey.includes('YOUR_');

let supabase: any;

if (!isSimulator) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.warn("Supabase initialization failed, falling back to simulator:", err);
  }
}

if (!supabase) {
  console.log("[Auth] Initializing in Sandbox Simulator Mode (No Supabase config detected)");
  
  // Listeners list for mock onAuthStateChange
  const listeners: Array<(event: string, session: any) => void> = [];
  
  const getMockUser = () => {
    const data = localStorage.getItem('mock_user_session');
    return data ? JSON.parse(data) : null;
  };

  const setMockUser = (user: any) => {
    if (user) {
      localStorage.setItem('mock_user_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('mock_user_session');
    }
  };

  supabase = {
    isSimulator: true,
    auth: {
      signUp: async ({ email, password }: any) => {
        const users = JSON.parse(localStorage.getItem('mock_users') || '{}');
        if (users[email]) {
          return { data: { user: null }, error: new Error('User already exists in simulator db') };
        }
        users[email] = password;
        localStorage.setItem('mock_users', JSON.stringify(users));
        
        const session = { 
          user: { 
            id: `mock-usr-${email.replace(/[^a-zA-Z0-9]/g, '-')}`, 
            email 
          }, 
          access_token: 'mock-token' 
        };
        setMockUser(session);
        
        listeners.forEach(cb => cb('SIGNED_IN', session));
        return { data: { user: session.user, session }, error: null };
      },
      signInWithPassword: async ({ email, password }: any) => {
        const users = JSON.parse(localStorage.getItem('mock_users') || '{}');
        // Pre-create a couple of accounts for quick testing
        const defaultUsers: any = { 
          'admin@wedding.com': 'password', 
          'test@example.com': 'password' 
        };
        
        const registeredPassword = users[email] || defaultUsers[email];
        
        if (registeredPassword && registeredPassword === password) {
          const session = { 
            user: { 
              id: `mock-usr-${email.replace(/[^a-zA-Z0-9]/g, '-')}`, 
              email 
            }, 
            access_token: 'mock-token' 
          };
          setMockUser(session);
          listeners.forEach(cb => cb('SIGNED_IN', session));
          return { data: { user: session.user, session }, error: null };
        }
        return { data: { user: null, session: null }, error: new Error('Invalid email or password in simulator db') };
      },
      signInWithOAuth: async ({ provider }: any) => {
        console.log(`[Auth Simulator] Mocking OAuth via provider: ${provider}...`);
        const session = { 
          user: { 
            id: 'mock-usr-google-profile', 
            email: 'google.wedding@gmail.com',
            name: 'Google Wedding Builder User' 
          }, 
          access_token: 'mock-token' 
        };
        setMockUser(session);
        listeners.forEach(cb => cb('SIGNED_IN', session));
        return { data: { provider, url: '#' }, error: null };
      },
      signOut: async () => {
        setMockUser(null);
        listeners.forEach(cb => cb('SIGNED_OUT', null));
        return { error: null };
      },
      getSession: async () => {
        const session = getMockUser();
        return { data: { session }, error: null };
      },
      getUser: async () => {
        const session = getMockUser();
        return { data: { user: session ? session.user : null }, error: null };
      },
      onAuthStateChange: (callback: any) => {
        listeners.push(callback);
        const session = getMockUser();
        // Trigger initial state
        setTimeout(() => {
          callback(session ? 'SIGNED_IN' : 'INITIAL_SESSION', session);
        }, 10);
        
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                const idx = listeners.indexOf(callback);
                if (idx !== -1) listeners.splice(idx, 1);
              }
            }
          }
        };
      }
    }
  };
}

export { supabase };

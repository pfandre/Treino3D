import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Substitua pela sua chave pública (anon key) completa copiada do Supabase
const supabaseUrl = 'https://zgzzmjxitepbdflqfmyg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnenptanhpdGVwYmRmbHFmbXlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2NzYwMTQsImV4cCI6MjEwNTI1MjAxNH0.heMztj4ZPMJYMwInZGtBstFraVa4hx1ZM2Z0xMapV7Y';

export const supabase = createClient(supabaseUrl, supabaseKey);
window.supabase = supabase;

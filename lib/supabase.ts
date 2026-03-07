import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gqinohfqneydndgakodk.supabase.co'
const supabaseKey = 'sb_publishable_c5gow1SfUZvOQPYRuqf7lw_BG5qXt26'

export const supabase = createClient(supabaseUrl, supabaseKey)

const SUPABASE_URL = 'https://iwemdbiacogasixlltm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_GdtbMIw91Qam1Ppg_i6B7g_wRJHlNAV';

async function testSupabase() {
    console.log("Testing Supabase Connection via Fetch...");
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            console.error("Supabase Query Error:");
            console.error(data);
        } else {
            console.log("Success! Data:");
            console.log(data);
        }
    } catch (e) {
        console.error("Exception:", e);
    }
}

testSupabase();

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method=== 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { pinHash, action, payload } = req.body;

  // Verify the PIN hash securely on the server
  const validHashes = [
    '8c07cfdfbe255d306247038188b8020416cdb8c97260969c13cfb06378d8cba2', // Ore (1999)
    '39a7cc6fbd4379686efcca59317abe6ac88f6a35af4b043faa5e977ff3c9bf19', // Dara (2003)
    'e13f99645f87a7c2aab8b5ae9074165318cde28e754a566087006120fca132e7', // Groom's fam
    '42ff322c7b6c9b702d027adeb217b1f226a41d71a86f9a9dcfdcf38a21cf515d', // Bride's fam
    'ec9de88936216680d2661d006be2e47b070650b6c8d5c177ccf7c4e13fe943d8'  // Ore's dad
  ];

  if (!validHashes.includes(pinHash)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase credentials');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  try {
    let data, error;
    
    switch (action) {
      case 'getStoredRsvps':
        ({ data, error } = await supabaseAdmin.from('rsvps').select('*').order('created_at', { ascending: false }));
        break;
      case 'deleteRsvp':
        ({ data, error } = await supabaseAdmin.from('rsvps').delete().eq('id', payload.id));
        break;
      case 'getStoredGiftPledgesAdmin':
        ({ data, error } = await supabaseAdmin.from('gift_pledges').select('*').order('created_at', { ascending: false }));
        break;
      case 'deleteGiftPledge':
        ({ data, error } = await supabaseAdmin.from('gift_pledges').delete().eq('id', payload.id));
        break;
      case 'getInviteCodes':
        ({ data, error } = await supabaseAdmin.from('invite_codes').select('*').order('created_at', { ascending: false }));
        break;
      case 'generateInviteCode':
        ({ data, error } = await supabaseAdmin.from('invite_codes').upsert([payload.code], { onConflict: 'code', ignoreDuplicates: true }).select().single());
        break;
      case 'bulkGenerateInviteCodes':
        ({ data, error } = await supabaseAdmin.from('invite_codes').upsert(payload.codes, { onConflict: 'code', ignoreDuplicates: true }).select());
        break;
      case 'deleteInviteCodes':
        ({ data, error } = await supabaseAdmin.from('invite_codes').delete().in('id', payload.ids));
        break;
      case 'markInviteCodeAsShared':
        ({ data, error } = await supabaseAdmin.from('invite_codes').update({ is_shared: true }).eq('id', payload.id));
        break;
      case 'unmarkInviteCodeAsShared':
        ({ data, error } = await supabaseAdmin.from('invite_codes').update({ is_shared: false }).eq('id', payload.id));
        break;
      case 'saveWishlistItem':
        ({ data, error } = await supabaseAdmin.from('wishlist_items').upsert([payload.item]).select().single());
        break;
      case 'deleteWishlistItem':
        ({ data, error } = await supabaseAdmin.from('wishlist_items').delete().eq('id', payload.id));
        break;
      default:
        return res.status(400).json({ error: 'Unknown action' });
    }

    if (error) {
      console.error('Supabase admin error:', error);
      return res.status(500).json({ error: error.message });
    }
    
    return res.status(200).json({ success: true, data });
  } catch (err: any) {
    console.error('Admin DB error:', err);
    return res.status(500).json({ error: err.message });
  }
}

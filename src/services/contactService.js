import { supabase } from '../lib/supabaseClient';

export const contactLandlord = async (payload) => {
  const { data, error } = await supabase.from('landlord_contacts').insert(payload).select().single();
  if (error) throw error;
  return data;
};

export const getLandlordMessages = async (landlordId) => {
  const { data, error } = await supabase
    .from('landlord_contacts')
    .select('*')
    .eq('landlord_id', landlordId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
};

export const updateContactStatus = async (contactId, status) => {
  const { data, error } = await supabase
    .from('landlord_contacts')
    .update({ status })
    .eq('id', contactId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

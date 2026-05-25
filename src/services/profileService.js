import { supabase } from '../lib/supabaseClient';

export const getProfile = async (userId) => {
  const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return data;
};

export const updateProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getLandlordProfile = async (userId) => {
  const { data, error } = await supabase
    .from('landlord_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const getTenantProfile = async (userId) => {
  const { data, error } = await supabase
    .from('tenant_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const upsertLandlordProfile = async (userId, updates = {}) => {
  const payload = { user_id: userId, ...updates };
  const { data, error } = await supabase
    .from('landlord_profiles')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const upsertTenantProfile = async (userId, updates = {}) => {
  const payload = { user_id: userId, ...updates };
  const { data, error } = await supabase
    .from('tenant_profiles')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getTopLandlords = async (limit = 3) => {
  const { data: reviewRows, error: reviewError } = await supabase
    .from('landlord_reviews')
    .select('landlord_id, overall_rating');

  if (reviewError) throw reviewError;

  const statsMap = new Map();
  (reviewRows || []).forEach((row) => {
    if (!row?.landlord_id) return;
    const prev = statsMap.get(row.landlord_id) || { total: 0, count: 0 };
    statsMap.set(row.landlord_id, {
      total: prev.total + Number(row.overall_rating || 0),
      count: prev.count + 1
    });
  });

  const rankedIds = [...statsMap.entries()]
    .map(([id, stat]) => ({
      id,
      rating: stat.count > 0 ? Number((stat.total / stat.count).toFixed(1)) : 0,
      reviewsCount: stat.count
    }))
    .sort((a, b) => {
      const byRating = b.rating - a.rating;
      if (byRating !== 0) return byRating;
      return b.reviewsCount - a.reviewsCount;
    })
    .slice(0, limit);

  const userIds = rankedIds.map((item) => item.id).filter(Boolean);

  if (userIds.length === 0) return [];

  const { data: profileRows, error: profileError } = await supabase
    .from('profiles')
    .select('user_id, full_name, avatar_url')
    .in('user_id', userIds);

  if (profileError) throw profileError;

  const { data: propertyRows, error: propertyError } = await supabase
    .from('properties')
    .select('landlord_id')
    .in('landlord_id', userIds);

  if (propertyError) throw propertyError;

  const profileMap = new Map((profileRows ?? []).map((row) => [row.user_id, row]));
  const propertyCountMap = new Map();
  (propertyRows || []).forEach((row) => {
    if (!row?.landlord_id) return;
    propertyCountMap.set(row.landlord_id, (propertyCountMap.get(row.landlord_id) || 0) + 1);
  });

  return rankedIds.map((row) => ({
    id: row.id,
    name: profileMap.get(row.id)?.full_name || 'Landlord',
    avatarUrl: profileMap.get(row.id)?.avatar_url || null,
    rating: Number(row.rating || 0),
    reviewsCount: Number(row.reviewsCount || 0),
    propertiesCount: Number(propertyCountMap.get(row.id) || 0),
    isVerified: false,
    bio: ''
  }));
};

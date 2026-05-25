import { supabase } from '../lib/supabaseClient';

const withTenantProfiles = async (reviews = [], tenantKey = 'tenant_id') => {
  const tenantIds = [...new Set((reviews || []).map((item) => item[tenantKey]).filter(Boolean))];
  if (tenantIds.length === 0) return reviews;

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('user_id, full_name, avatar_url')
    .in('user_id', tenantIds);

  if (error) throw error;

  const profileMap = new Map((profiles || []).map((profile) => [profile.user_id, profile]));

  return reviews.map((review) => ({
    ...review,
    tenant_profile: profileMap.get(review[tenantKey]) || null
  }));
};

export const createPropertyReview = async (payload) => {
  if (payload?.tenant_id && payload?.landlord_id && payload.tenant_id === payload.landlord_id) {
    throw new Error('Landlords cannot review their own properties.');
  }

  const { data, error } = await supabase.from('property_reviews').insert(payload).select().single();
  if (error) throw error;
  return data;
};

export const createLandlordReview = async (payload) => {
  if (payload?.tenant_id && payload?.landlord_id && payload.tenant_id === payload.landlord_id) {
    throw new Error('Landlords cannot review themselves.');
  }

  const { data, error } = await supabase.from('landlord_reviews').insert(payload).select().single();
  if (error) throw error;
  return data;
};

export const checkTenantReviewEligibility = async ({ tenantId, propertyId, landlordId }) => {
  if (!tenantId || !propertyId) {
    return { allowed: false, reason: 'Missing tenant or property context.' };
  }

  let query = supabase
    .from('tenant_property_links')
    .select('id, status, landlord_id')
    .eq('tenant_id', tenantId)
    .eq('property_id', propertyId)
    .in('status', ['active', 'past'])
    .limit(1);

  if (landlordId) {
    query = query.eq('landlord_id', landlordId);
  }

  const { data, error } = await query.maybeSingle();
  if (error) throw error;

  if (!data) {
    return {
      allowed: false,
      reason: 'You can review this property only after the landlord links your tenant account.'
    };
  }

  return { allowed: true, reason: '' };
};

export const getPropertyReviews = async (propertyId) => {
  const { data, error } = await supabase
    .from('property_reviews')
    .select('*')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return withTenantProfiles(data ?? []);
};

export const getLandlordReviews = async (landlordId) => {
  const { data, error } = await supabase
    .from('landlord_reviews')
    .select('*')
    .eq('landlord_id', landlordId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return withTenantProfiles(data ?? []);
};

export const getTenantReviewQueue = async (tenantId) => {
  if (!tenantId) return [];

  const { data: linkRows, error: linkError } = await supabase
    .from('tenant_property_links')
    .select(
      `
      id,
      tenant_id,
      landlord_id,
      property_id,
      status,
      start_date,
      end_date,
      properties(id,title,location,availability_status,average_rating)
    `
    )
    .eq('tenant_id', tenantId)
    .in('status', ['active', 'past'])
    .order('created_at', { ascending: false });

  if (linkError) throw linkError;

  const links = linkRows ?? [];
  const propertyIds = [...new Set(links.map((row) => row.property_id).filter(Boolean))];

  if (propertyIds.length === 0) return [];

  const { data: reviewRows, error: reviewError } = await supabase
    .from('property_reviews')
    .select('id,property_id,tenant_id,created_at')
    .eq('tenant_id', tenantId)
    .in('property_id', propertyIds);

  if (reviewError) throw reviewError;

  const reviewedPropertyIds = new Set((reviewRows ?? []).map((row) => row.property_id));

  return links.map((row) => ({
    ...row,
    has_reviewed: reviewedPropertyIds.has(row.property_id)
  }));
};

export const getPropertyReviewAveragesForLandlord = async (landlordId) => {
  if (!landlordId) return {};

  const { data, error } = await supabase
    .from('property_reviews')
    .select('property_id, overall_rating')
    .eq('landlord_id', landlordId);

  if (error) throw error;

  const grouped = new Map();
  (data || []).forEach((row) => {
    if (!row?.property_id) return;
    const previous = grouped.get(row.property_id) || { total: 0, count: 0 };
    grouped.set(row.property_id, {
      total: previous.total + Number(row.overall_rating || 0),
      count: previous.count + 1
    });
  });

  const result = {};
  grouped.forEach((value, key) => {
    result[key] = {
      average: value.count > 0 ? Number((value.total / value.count).toFixed(1)) : 0,
      count: value.count
    };
  });

  return result;
};

export const getTestimonials = async (limit = 3) => {
  const { data, error } = await supabase
    .from('landlord_reviews')
    .select('*')
    .not('comment', 'is', null)
    .neq('comment', '')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  const withProfiles = await withTenantProfiles(data ?? []);

  return withProfiles.map((row) => ({
    id: row.id,
    name: row.tenant_profile?.full_name || 'Tenant',
    role: 'Tenant',
    text: row.comment || '',
    rating: Number(row.overall_rating || 0)
  }));
};

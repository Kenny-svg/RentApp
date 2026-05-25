import { supabase } from '../lib/supabaseClient';

const normalizeEmail = (email = '') => email.trim().toLowerCase();
const MISSING_TABLE_FALLBACK = [];

const isTenantLinkRequestsTableMissing = (error) => {
  if (!error) return false;
  const message = String(error.message || '').toLowerCase();
  return (
    error.code === 'PGRST205' ||
    (message.includes('tenant_link_requests') && message.includes('schema cache')) ||
    message.includes("could not find the table 'public.tenant_link_requests'")
  );
};

const throwMissingTableActionError = () => {
  throw new Error(
    'Tenant link flow is not set up in your database yet. Run supabase/schema.sql, supabase/policies.sql, and supabase/triggers.sql in Supabase SQL Editor.'
  );
};

const withTenantProfiles = async (requests = []) => {
  const tenantIds = [...new Set((requests || []).map((row) => row.tenant_id).filter(Boolean))];
  if (tenantIds.length === 0) return requests;

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('user_id, full_name, email, phone')
    .in('user_id', tenantIds);

  if (error) throw error;

  const profileMap = new Map((profiles || []).map((row) => [row.user_id, row]));

  return (requests || []).map((row) => ({
    ...row,
    tenant_profile: profileMap.get(row.tenant_id) || null
  }));
};

const findLandlordByEmail = async (landlordEmail) => {
  const normalizedEmail = normalizeEmail(landlordEmail);
  if (!normalizedEmail) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('user_id, full_name, email, role')
    .ilike('email', normalizedEmail)
    .eq('role', 'landlord')
    .maybeSingle();

  if (error) throw error;
  return data || null;
};

export const ensureTenantLinkRequest = async ({
  tenantId,
  tenantName,
  tenantEmail,
  landlordEmail,
  note = null
}) => {
  const normalizedLandlordEmail = normalizeEmail(landlordEmail);
  if (!tenantId || !normalizedLandlordEmail) return null;

  const landlordProfile = await findLandlordByEmail(normalizedLandlordEmail);

  const payload = {
    tenant_id: tenantId,
    tenant_name: tenantName || null,
    tenant_email: tenantEmail ? normalizeEmail(tenantEmail) : null,
    landlord_email: normalizedLandlordEmail,
    landlord_id: landlordProfile?.user_id || null,
    status: 'pending',
    note: note || null,
    requested_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('tenant_link_requests')
    .upsert(payload, { onConflict: 'tenant_id,landlord_email' })
    .select()
    .single();

  if (isTenantLinkRequestsTableMissing(error)) return null;
  if (error) throw error;
  return data;
};

export const getTenantLinkRequests = async (tenantId) => {
  const { data, error } = await supabase
    .from('tenant_link_requests')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (isTenantLinkRequestsTableMissing(error)) return MISSING_TABLE_FALLBACK;
  if (error) throw error;
  return data ?? [];
};

export const getLandlordLinkRequests = async (landlordId, status = 'pending', landlordEmail = '') => {
  let query = supabase.from('tenant_link_requests').select('*').order('created_at', { ascending: false });

  const normalizedEmail = normalizeEmail(landlordEmail);
  if (normalizedEmail) {
    query = query.or(`landlord_id.eq.${landlordId},landlord_email.eq.${normalizedEmail}`);
  } else {
    query = query.eq('landlord_id', landlordId);
  }

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (isTenantLinkRequestsTableMissing(error)) return MISSING_TABLE_FALLBACK;
  if (error) throw error;

  return withTenantProfiles(data ?? []);
};

export const approveTenantLinkRequest = async ({ requestId, landlordId, propertyId, landlordEmail = '' }) => {
  if (!requestId || !landlordId || !propertyId) {
    throw new Error('Missing request, landlord, or property context.');
  }

  let requestQuery = supabase.from('tenant_link_requests').select('*').eq('id', requestId);

  const normalizedEmail = normalizeEmail(landlordEmail);
  if (normalizedEmail) {
    requestQuery = requestQuery.or(`landlord_id.eq.${landlordId},landlord_email.eq.${normalizedEmail}`);
  } else {
    requestQuery = requestQuery.eq('landlord_id', landlordId);
  }

  const { data: requestRow, error: requestError } = await requestQuery.single();

  if (isTenantLinkRequestsTableMissing(requestError)) throwMissingTableActionError();
  if (requestError) throw requestError;

  if (!requestRow?.tenant_id) {
    throw new Error('Invalid tenant request row.');
  }

  const { data: existingLink, error: existingLinkError } = await supabase
    .from('tenant_property_links')
    .select('id, status')
    .eq('tenant_id', requestRow.tenant_id)
    .eq('property_id', propertyId)
    .maybeSingle();

  if (existingLinkError) throw existingLinkError;

  if (existingLink?.id) {
    const { error: updateLinkError } = await supabase
      .from('tenant_property_links')
      .update({
        landlord_id: landlordId,
        status: 'active',
        start_date: new Date().toISOString().slice(0, 10)
      })
      .eq('id', existingLink.id);

    if (updateLinkError) throw updateLinkError;
  } else {
    const { error: insertLinkError } = await supabase.from('tenant_property_links').insert({
      tenant_id: requestRow.tenant_id,
      landlord_id: landlordId,
      property_id: propertyId,
      status: 'active',
      start_date: new Date().toISOString().slice(0, 10)
    });

    if (insertLinkError) throw insertLinkError;
  }

  const { data: updatedRequest, error: requestUpdateError } = await supabase
    .from('tenant_link_requests')
    .update({
      landlord_id: landlordId,
      status: 'approved',
      property_id: propertyId,
      resolved_at: new Date().toISOString(),
      resolved_by: landlordId
    })
    .eq('id', requestId)
    .select()
    .single();

  if (isTenantLinkRequestsTableMissing(requestUpdateError)) throwMissingTableActionError();
  if (requestUpdateError) throw requestUpdateError;
  return updatedRequest;
};

export const rejectTenantLinkRequest = async ({
  requestId,
  landlordId,
  landlordEmail = '',
  reason = null
}) => {
  let query = supabase
    .from('tenant_link_requests')
    .update({
      status: 'rejected',
      resolved_at: new Date().toISOString(),
      resolved_by: landlordId,
      note: reason || null
    })
    .eq('id', requestId);

  const normalizedEmail = normalizeEmail(landlordEmail);
  if (normalizedEmail) {
    query = query.or(`landlord_id.eq.${landlordId},landlord_email.eq.${normalizedEmail}`);
  } else {
    query = query.eq('landlord_id', landlordId);
  }

  const { data, error } = await query.select().single();

  if (isTenantLinkRequestsTableMissing(error)) throwMissingTableActionError();
  if (error) throw error;
  return data;
};

export const getLandlordTenantStats = async (landlordId) => {
  if (!landlordId) {
    return {
      totalTenants: 0,
      activeTenancies: 0,
      pastTenancies: 0
    };
  }

  const { data, error } = await supabase
    .from('tenant_property_links')
    .select('tenant_id,status')
    .eq('landlord_id', landlordId)
    .in('status', ['active', 'past']);

  if (error) throw error;

  const rows = data ?? [];
  const uniqueTenantIds = new Set(rows.map((row) => row.tenant_id).filter(Boolean));
  const activeTenancies = rows.filter((row) => row.status === 'active').length;
  const pastTenancies = rows.filter((row) => row.status === 'past').length;

  return {
    totalTenants: uniqueTenantIds.size,
    activeTenancies,
    pastTenancies
  };
};

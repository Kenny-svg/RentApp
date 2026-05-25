import { supabase } from '../lib/supabaseClient';

const resolveImageSrc = (image) => {
  if (image?.image_base64) {
    const mime = image.image_mime_type || 'image/jpeg';
    return `data:${mime};base64,${image.image_base64}`;
  }
  return image?.image_url || null;
};

const normalizePropertyImages = (property) => {
  const images = (property?.property_images || []).map((image) => {
    const imageSrc = resolveImageSrc(image);
    return {
      ...image,
      image_src: imageSrc,
      // Keep compatibility with existing UI code that reads image_url.
      image_url: imageSrc || image.image_url || null
    };
  });

  return {
    ...property,
    property_images: images
  };
};

const uniqueById = (rows = []) => {
  const seen = new Set();
  return rows.filter((row) => {
    if (!row?.id) return true;
    if (seen.has(row.id)) return false;
    seen.add(row.id);
    return true;
  });
};

const attachLandlordProfiles = async (properties = []) => {
  const landlordIds = [...new Set((properties || []).map((item) => item.landlord_id).filter(Boolean))];

  if (landlordIds.length === 0) {
    return properties.map((item) => ({ ...item, landlord_profile: null }));
  }

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('user_id, full_name, avatar_url, phone')
    .in('user_id', landlordIds);

  if (error) throw error;

  const profileMap = new Map((profiles || []).map((profile) => [profile.user_id, profile]));

  return properties.map((item) => ({
    ...item,
    landlord_profile: profileMap.get(item.landlord_id) || null
  }));
};

const attachLandlordRatings = async (properties = []) => {
  const landlordIds = [...new Set((properties || []).map((item) => item.landlord_id).filter(Boolean))];
  if (landlordIds.length === 0) return properties;

  const { data: landlordReviews, error } = await supabase
    .from('landlord_reviews')
    .select('landlord_id, overall_rating')
    .in('landlord_id', landlordIds);

  if (error) throw error;

  const ratingAccumulator = new Map();
  (landlordReviews || []).forEach((row) => {
    if (!row?.landlord_id) return;
    const prev = ratingAccumulator.get(row.landlord_id) || { total: 0, count: 0 };
    ratingAccumulator.set(row.landlord_id, {
      total: prev.total + Number(row.overall_rating || 0),
      count: prev.count + 1
    });
  });

  return properties.map((item) => ({
    ...item,
    landlord_rating:
      ratingAccumulator.get(item.landlord_id)?.count > 0
        ? Number(
            (
              ratingAccumulator.get(item.landlord_id).total /
              ratingAccumulator.get(item.landlord_id).count
            ).toFixed(1)
          )
        : 0
  }));
};

const attachPropertyRatings = async (properties = []) => {
  const propertyIds = [...new Set((properties || []).map((item) => item.id).filter(Boolean))];
  if (propertyIds.length === 0) return properties;

  const { data: propertyReviews, error } = await supabase
    .from('property_reviews')
    .select('property_id, overall_rating')
    .in('property_id', propertyIds);

  if (error) throw error;

  const ratingAccumulator = new Map();
  (propertyReviews || []).forEach((row) => {
    if (!row?.property_id) return;
    const prev = ratingAccumulator.get(row.property_id) || { total: 0, count: 0 };
    ratingAccumulator.set(row.property_id, {
      total: prev.total + Number(row.overall_rating || 0),
      count: prev.count + 1
    });
  });

  return properties.map((item) => {
    const ratingStats = ratingAccumulator.get(item.id);
    if (!ratingStats || ratingStats.count === 0) {
      return {
        ...item,
        average_rating: Number(item.average_rating || 0),
        total_reviews: Number(item.total_reviews || 0)
      };
    }

    return {
      ...item,
      average_rating: Number((ratingStats.total / ratingStats.count).toFixed(1)),
      total_reviews: ratingStats.count
    };
  });
};

export const createProperty = async (payload) => {
  const { data, error } = await supabase.from('properties').insert(payload).select().single();
  if (error) throw error;
  return data;
};

export const createPropertyImage = async ({
  propertyId,
  imageBase64,
  imageMimeType,
  fileName,
  fileSizeBytes,
  isCover = true
}) => {
  const mimeType = imageMimeType || 'image/jpeg';
  const inlineDataUrl = imageBase64 ? `data:${mimeType};base64,${imageBase64}` : null;

  const payload = {
    property_id: propertyId,
    // Keep compatibility with schemas where image_url is still NOT NULL.
    image_url: inlineDataUrl || '',
    image_base64: imageBase64,
    image_mime_type: mimeType,
    file_name: fileName || null,
    file_size_bytes: fileSizeBytes || null,
    is_cover: isCover
  };

  const { data, error } = await supabase.from('property_images').insert(payload).select().single();
  if (error) throw error;
  return data;
};

export const createPropertyAmenities = async (propertyId, amenities = []) => {
  if (!amenities.length) return [];

  const rows = amenities.map((amenity) => ({
    property_id: propertyId,
    amenity
  }));

  const { data, error } = await supabase.from('property_amenities').insert(rows).select();
  if (error) throw error;
  return data ?? [];
};

export const replacePropertyAmenities = async (propertyId, amenities = []) => {
  const { error: deleteError } = await supabase.from('property_amenities').delete().eq('property_id', propertyId);
  if (deleteError) throw deleteError;

  if (!amenities.length) return [];
  return createPropertyAmenities(propertyId, amenities);
};

export const getProperties = async (filters = {}) => {
  let query = supabase
    .from('properties')
    .select(
      `
      *,
      property_images(id,image_url,image_base64,image_mime_type,file_name,file_size_bytes,is_cover),
      property_amenities(id,amenity)
    `
    )
    .order('created_at', { ascending: false });

  if (filters.location) query = query.ilike('location', `%${filters.location}%`);
  if (filters.propertyType) query = query.eq('property_type', filters.propertyType);
  if (filters.maxPrice) query = query.lte('rent_price', filters.maxPrice);

  const { data, error } = await query;
  if (error) throw error;

  const normalized = uniqueById((data ?? []).map(normalizePropertyImages));
  const withPropertyRatings = await attachPropertyRatings(normalized);
  const withProfiles = await attachLandlordProfiles(withPropertyRatings);
  return attachLandlordRatings(withProfiles);
};

export const getPropertyById = async (propertyId) => {
  const { data, error } = await supabase
    .from('properties')
    .select(
      `
      *,
      property_images(id,image_url,image_base64,image_mime_type,file_name,file_size_bytes,is_cover),
      property_amenities(id,amenity)
    `
    )
    .eq('id', propertyId)
    .single();
  if (error) throw error;

  const withPropertyRatings = await attachPropertyRatings([normalizePropertyImages(data)]);
  const withProfiles = await attachLandlordProfiles(withPropertyRatings);
  const withRatings = await attachLandlordRatings(withProfiles);
  return withRatings[0];
};

export const getLandlordProperties = async (landlordId) => {
  const { data, error } = await supabase
    .from('properties')
    .select(
      '*, property_images(id,image_url,image_base64,image_mime_type,file_name,file_size_bytes,is_cover), property_amenities(id,amenity)'
    )
    .eq('landlord_id', landlordId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  const normalized = uniqueById((data ?? []).map(normalizePropertyImages));
  return attachPropertyRatings(normalized);
};

export const getFeaturedProperties = async (limit = 3) => {
  const { data, error } = await supabase
    .from('properties')
    .select(
      '*, property_images(id,image_url,image_base64,image_mime_type,file_name,file_size_bytes,is_cover), property_amenities(id,amenity)'
    )
    .eq('availability_status', 'available')
    .order('average_rating', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  const normalized = uniqueById((data ?? []).map(normalizePropertyImages));
  const withPropertyRatings = await attachPropertyRatings(normalized);
  const withProfiles = await attachLandlordProfiles(withPropertyRatings);
  return attachLandlordRatings(withProfiles);
};

export const updateProperty = async (propertyId, updates) => {
  const { data, error } = await supabase
    .from('properties')
    .update(updates)
    .eq('id', propertyId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const upsertPropertyCoverImage = async ({
  propertyId,
  imageBase64,
  imageMimeType,
  fileName,
  fileSizeBytes
}) => {
  if (!imageBase64) return null;

  const mimeType = imageMimeType || 'image/jpeg';
  const inlineDataUrl = `data:${mimeType};base64,${imageBase64}`;

  const { error: unsetCoverError } = await supabase
    .from('property_images')
    .update({ is_cover: false })
    .eq('property_id', propertyId);
  if (unsetCoverError) throw unsetCoverError;

  const payload = {
    property_id: propertyId,
    image_url: inlineDataUrl,
    image_base64: imageBase64,
    image_mime_type: mimeType,
    file_name: fileName || null,
    file_size_bytes: fileSizeBytes || null,
    is_cover: true
  };

  const { data, error } = await supabase.from('property_images').insert(payload).select().single();
  if (error) throw error;
  return data;
};

export const deleteProperty = async (propertyId) => {
  const { error } = await supabase.from('properties').delete().eq('id', propertyId);
  if (error) throw error;
};

export const saveProperty = async ({ tenantId, propertyId }) => {
  const { data, error } = await supabase
    .from('saved_properties')
    .insert({ tenant_id: tenantId, property_id: propertyId })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const unsaveProperty = async ({ tenantId, propertyId }) => {
  const { error } = await supabase
    .from('saved_properties')
    .delete()
    .eq('tenant_id', tenantId)
    .eq('property_id', propertyId);
  if (error) throw error;
};

export const getSavedProperties = async (tenantId) => {
  const { data, error } = await supabase
    .from('saved_properties')
    .select(
      `
      id,
      created_at,
      properties(*, property_images(id,image_url,image_base64,image_mime_type,file_name,file_size_bytes,is_cover), property_amenities(id,amenity))
    `
    )
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const propertyRows = (data ?? []).map((row) => row.properties).filter(Boolean).map(normalizePropertyImages);
  const withPropertyRatings = await attachPropertyRatings(propertyRows);
  const withProfiles = await attachLandlordProfiles(withPropertyRatings);
  const propertyMap = new Map(withProfiles.map((property) => [property.id, property]));

  return (data ?? []).map((row) => ({
    ...row,
    properties: propertyMap.get(row.properties?.id) || row.properties
  }));
};

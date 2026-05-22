export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);

export const getAverageRating = (items, key = 'rating') => {
  if (!items?.length) return 0;
  const total = items.reduce((sum, item) => sum + (item[key] || 0), 0);
  return Number((total / items.length).toFixed(1));
};

/**
 * Currency utility functions for the freelancer marketplace
 * Handles USD formatting and conversion
 */

export const formatPrice = (price, options = {}) => {
  const {
    showCents = false,
    showSymbol = true,
    locale = 'en-US',
    currency = 'USD'
  } = options;

  if (typeof price !== 'number' || isNaN(price)) {
    return showSymbol ? '$0' : '0';
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  }).format(price);
};

export const formatPriceRange = (minPrice, maxPrice, options = {}) => {
  if (minPrice === maxPrice) {
    return formatPrice(minPrice, options);
  }
  return `${formatPrice(minPrice, options)} - ${formatPrice(maxPrice, options)}`;
};

export const calculateServiceFee = (amount, feePercentage = 5) => {
  return Math.round(amount * (feePercentage / 100));
};

export const calculateTotal = (amount, serviceFee = null) => {
  const fee = serviceFee !== null ? serviceFee : calculateServiceFee(amount);
  return amount + fee;
};

export const formatCompactPrice = (price, options = {}) => {
  if (price >= 1000000) {
    return `$${(price / 1000000).toFixed(1)}M`;
  }
  if (price >= 1000) {
    return `$${(price / 1000).toFixed(1)}K`;
  }
  return formatPrice(price, options);
};

// Note: All prices are assumed to be in USD by default

export default {
  formatPrice,
  formatPriceRange,
  calculateServiceFee,
  calculateTotal,
  formatCompactPrice
};

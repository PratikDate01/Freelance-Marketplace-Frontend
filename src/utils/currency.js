/**
 * Currency utility functions for the freelancer marketplace
 * Handles USD formatting and conversion
 */

export const formatPrice = (price, options = {}) => {
  const {
    showCents = false,
    showSymbol = true,
    locale = 'en-US'
  } = options;

  if (typeof price !== 'number' || isNaN(price)) {
    return showSymbol ? '$0' : '0';
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  }).format(price);
};

export const formatPriceRange = (minPrice, maxPrice) => {
  if (minPrice === maxPrice) {
    return formatPrice(minPrice);
  }
  return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
};

export const calculateServiceFee = (amount, feePercentage = 5) => {
  return Math.round(amount * (feePercentage / 100));
};

export const calculateTotal = (amount, serviceFee = null) => {
  const fee = serviceFee !== null ? serviceFee : calculateServiceFee(amount);
  return amount + fee;
};

export const formatCompactPrice = (price) => {
  if (price >= 1000000) {
    return `$${(price / 1000000).toFixed(1)}M`;
  }
  if (price >= 1000) {
    return `$${(price / 1000).toFixed(1)}K`;
  }
  return formatPrice(price);
};

// Note: All prices are assumed to be in USD

export default {
  formatPrice,
  formatPriceRange,
  calculateServiceFee,
  calculateTotal,
  formatCompactPrice
};

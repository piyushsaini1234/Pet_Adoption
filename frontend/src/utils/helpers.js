/**
 * Extract a user-friendly message from an Axios error response.
 */
export const getErrorMessage = (error) => {
  return error?.response?.data?.message || error?.message || 'Something went wrong';
};

/**
 * Capitalize the first letter of a string.
 */
export const capitalize = (str = '') => str.charAt(0).toUpperCase() + str.slice(1);

/**
 * Format a date string to a readable format.
 */
export const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Build a query string from a params object, omitting falsy values.
 */
export const buildQueryString = (params) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      query.append(key, value);
    }
  });
  return query.toString();
};

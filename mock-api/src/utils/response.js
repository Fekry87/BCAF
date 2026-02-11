// Standardized API response helpers

export const success = (data, message = null, meta = null) => {
  const response = {
    success: true,
    data,
  };
  if (message) response.message = message;
  if (meta) response.meta = meta;
  return response;
};

export const error = (message, errors = null, statusCode = 400) => {
  const response = {
    success: false,
    message,
  };
  if (errors) response.errors = errors;
  return response;
};

export const paginate = (data, page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  return {
    data,
    meta: {
      pagination: {
        current_page: page,
        per_page: limit,
        total,
        last_page: totalPages,
        has_more: page < totalPages,
      },
    },
  };
};

export const sanitizeUser = (user) => {
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return passwordRegex.test(password);
};

export const paginationUtils = {
  getPaginationParams: (query) => {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    return {
      skip,
      take: limit,
      page,
    };
  },

  getPaginationMetadata: (total, page, limit) => {
    return {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
    };
  },
};

export const formatResponse = (data, message = "Success", statusCode = 200) => {
  return {
    status: statusCode >= 200 && statusCode < 300 ? "success" : "error",
    message,
    data,
  };
};

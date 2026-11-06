/**
 * Standardized API response sender
 * Ensures all successful responses follow { success: true, statusCode, message, data }
 */
export const sendSuccess = (
  res,
  statusCode = 200,
  message = "Success",
  data = null,
) => {
  const payload = {
    success: true,
    statusCode,
    message,
  };

  if (data !== null && data !== undefined) {
    payload.data = data;
  }

  return res.status(statusCode).json(payload);
};


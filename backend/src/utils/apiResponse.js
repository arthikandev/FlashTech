const apiResponse = {
  success: (data, message = "Success") => ({ success: true, message, data }),
  error: (message = "An error occurred") => ({
    success: false,
    message,
    error: message,
    data: null,
  }),
};

module.exports = { apiResponse };

const { ApplicationError } = require("@strapi/utils").errors;

module.exports = async (policyContext, config, { strapi }) => {
  try {
    // Check if user is an admin
    const isAdmin = policyContext.state.user.isAdmin;
    console.log("isAdmin", isAdmin)
    if (!isAdmin) {
      throw new ApplicationError("You must be an admin to create category!");
    }

    return true;
  } catch (error) {
    // Rethrow ApplicationErrors directly
    if (error instanceof ApplicationError) {
      throw error;
    }

    // Convert other errors to ApplicationError with context
    throw new ApplicationError(
      `An error occurred while checking admin permissions: ${error.message}`,
      { code: 'ADMIN_PERMISSION_CHECK_ERROR' }
    );
  }
};
'use strict';

/**
 * `isAuthenticated` policy
 * Verifies that a valid JWT token is present and the user is authenticated
 */

module.exports = (policyContext, config, { strapi }) => {
  // Get the JWT token from the Authorization header
  const { request } = policyContext;
  const token = request.header.authorization;

  // Check if the token exists
  if (!token || !token.startsWith('Bearer ')) {
    return false;
  }

  // Extract the actual token
  const jwtToken = token.substring(7);

  try {
    // Verify and decode the token
    const decoded = strapi.plugins['users-permissions'].services.jwt.verify(jwtToken);

    // Set the authenticated user in the state
    policyContext.state.user = decoded;

    // Token is valid, allow the request to proceed
    return true;
  } catch (error) {
    // Token verification failed
    return false;
  }
};
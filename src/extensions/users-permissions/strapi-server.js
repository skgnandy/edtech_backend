const utils = require("@strapi/utils");
const _ = require("lodash");
const { sanitize } = utils;
const { ApplicationError, ValidationError } = utils.errors;
'use strict';
// Function to generate a username based on first name and random number
function generateUsername(firstName) {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000); // Random 4-digit number
  return `${firstName}${randomSuffix}`;
}

module.exports = (plugin) => {
  plugin.controllers.user.register = async (ctx) => {
    try {
      const { username, firstName, lastName, email, password } = ctx.request.body;

      if (!email || !password) {
        return ctx.badRequest("Email and password are required");
      }

      if (!firstName) {
        return ctx.badRequest("First name is required");
      }

      // Generate username if not provided
      let finalUsername = username || generateUsername(firstName);

      // Check if user already exists
      const existingUser = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          where: {
            $or: [
              { email: email.toLowerCase() },
              { username: finalUsername.toLowerCase() }
            ]
          },
        });

      if (existingUser) {
        const field = existingUser.email === email.toLowerCase() ? 'email' : 'username';

        // If username collision occurs, try to generate a new one
        if (field === 'username' && !username) {
          // User didn't specify a username, we generated one that collided
          // Let's try again with a different random number
          let newUsername;
          let usernameExists = true;
          let attempts = 0;

          // Try up to 5 times to generate a unique username
          while (usernameExists && attempts < 5) {
            newUsername = generateUsername(firstName);
            attempts++;

            // Check if this username exists
            const checkUser = await strapi.db
              .query("plugin::users-permissions.user")
              .findOne({
                where: { username: newUsername.toLowerCase() }
              });

            if (!checkUser) {
              usernameExists = false;
              finalUsername = newUsername;
            }
          }

          if (usernameExists) {
            return ctx.badRequest("Could not generate a unique username. Please provide one.");
          }
        } else {
          return ctx.badRequest(`A user with this ${field} already exists`);
        }
      }

      // Get default role for authenticated users
      const defaultRole = await strapi
        .query('plugin::users-permissions.role')
        .findOne({ where: { type: 'authenticated' } });

      if (!defaultRole) {
        return ctx.badRequest('Authenticated role not found');
      }

      // Create the new user with the final username (provided or generated)
      const newUser = await strapi.entityService.create('plugin::users-permissions.user', {
        data: {
          username: finalUsername,
          firstName,
          lastName: lastName ?? '', // Include the lastName field
          email: email.toLowerCase(),
          password,
          role: defaultRole.id,
          confirmed: true, // Set to false if email confirmation is required
          provider: 'local',
        },
      });

      // Generate JWT token
      const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: newUser.id,
      });

      // Remove sensitive information
      const sanitizedUser = { ...newUser };
      delete sanitizedUser.password;
      delete sanitizedUser.resetPasswordToken;
      delete sanitizedUser.confirmationToken;

      ctx.send({
        jwt,
        user: sanitizedUser,
      });
    } catch (err) {
      console.error("Registration error:", err);

      if (err instanceof ValidationError) {
        return ctx.badRequest(err.message, { details: err.details });
      }

      return ctx.internalServerError("Something went wrong during registration. Please try again.");
    }
  };
  plugin.controllers.user.signIn = async (ctx) => {
    try {
      const { email, password } = ctx.request.body;

      if (!email || !password) {
        return ctx.badRequest("Email and password are required");
      }

      // Find user by email
      const user = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          where: {
            email: email.toLowerCase(),
          },
        });

      if (!user) {
        return ctx.badRequest("No user found with this email");
      }

      // Check if user is active and not blocked
      if (!user.confirmed) {
        return ctx.badRequest("Your account email is not confirmed");
      }

      if (user.blocked) {
        return ctx.badRequest("Your account has been blocked by an administrator");
      }

      // Validate password
      const validPassword = await strapi.plugins['users-permissions'].services.user.validatePassword(
        password,
        user.password
      );

      if (!validPassword) {
        return ctx.badRequest("Invalid password");
      }

      // Generate JWT token
      const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id,
      });

      // Create a sanitized user object with all fields except password
      const sanitizedUser = { ...user };
      delete sanitizedUser.password; // Remove password field for security

      // Remove sensitive security fields
      delete sanitizedUser.resetPasswordToken;
      delete sanitizedUser.confirmationToken;

      // Return user and token
      ctx.send({
        jwt,
        user: sanitizedUser,
      });
    } catch (err) {
      console.error("Sign-in error:", err);
      return ctx.internalServerError("Something went wrong. Please try again.");
    }
  };
  plugin.controllers.user.update = async (ctx) => {
    try {
      const { id } = ctx.params;
      const { body } = ctx.request;

      // Check if user exists
      const userToUpdate = await strapi.entityService.findOne(
        'plugin::users-permissions.user',
        id
      );

      if (!userToUpdate) {
        return ctx.notFound('User not found');
      }

      // Security check - only allow the user to update their own record or admin users
      const user = ctx.state.user;
      const isAdmin = user && user.role && user.role.type === 'admin';

      if (!isAdmin && `${user.id}` !== `${id}`) {
        return ctx.forbidden('You are not allowed to perform this action');
      }

      // IMPORTANT: Remove 'isPaid' field from the update request
      // This ensures the 'isPaid' field cannot be modified through this API endpoint
      if (body.hasOwnProperty('isPaid')) {
        delete body.isPaid;
      }

      // Also prevent updating role if not admin
      if (!isAdmin && body.role) {
        delete body.role;
      }

      // Perform the update
      const updatedUser = await strapi.entityService.update(
        'plugin::users-permissions.user',
        id,
        { data: body }
      );
      // const sanitizedEntity = await plugin.controllers.user.sanitizeOutput(updatedUser, ctx);
      // Sanitize the response - remove sensitive fields
      delete updatedUser.password;
      delete updatedUser.resetPasswordToken;
      delete updatedUser.confirmationToken;


      return ctx.send({
        data: updatedUser
      });

    } catch (err) {
      strapi.log.error('Error updating user:', err);
      return ctx.badRequest('Error updating user profile');
    }
  };


  plugin.controllers.user.Forgotpassword = async (ctx) => {
    try {
      const { email } = ctx.request.body;

      if (!email) {
        return ctx.badRequest("Email is required");
      }
      const user = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          where: {
            email: email,
          },
        });
      if (!user) {
        return ctx.badRequest("No user found with this email");
      }

      // Generate a simple numeric reset code
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Store the reset code and its expiry time in the user attributes
      await strapi.entityService.update('plugin::users-permissions.user', user.id, {
        data: {
          resetCode,
          expiryTime: Date.now() + 3600000, // 1 hour from now
        }
      });

      // Send reset code email
      try {
        await strapi.plugin("email").service("email").send({
          to: user.email,
          from: "sknandy11@gmail.com", //'your-email@yourdomain.com',
          subject: "Password Reset Code",
          text: `Your password reset code is: ${resetCode}`,
          html: `<p>Your password reset code is: <strong>${resetCode}</strong>. Please use this OTP within the next 1 hour.</p>`,
        });

        ctx.send({ message: "Please check your email for the password reset code." });
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        return ctx.internalServerError("Failed to send email. Please try again later.");
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      return ctx.internalServerError("Something went wrong. Please try again.");
    }
  };


  plugin.controllers.user.Resetpassword = async (ctx) => {
    try {
      const { resetCode, password, email } = ctx.request.body;

      if (!resetCode || !password || !email) {
        return ctx.badRequest("Reset code, new password, and email ID are required.");
      }

      // Find the user and verify token
      const user = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          where: {
            email: email,
          },
        });

      if (!user?.resetCode) {
        return ctx.badRequest("The reset code is currently unavailable. Please request a new code to proceed..");
      }

      // Split stored token to get actual token and expiry
      const storedToken = user.resetCode;
      const resetCodeExpiry = user.expiryTime;

      // Verify token and expiry
      if (resetCode !== storedToken) {
        return ctx.badRequest("he reset code entered is invalid. Please check the code and try again.");
      }
      if (Date.now() > resetCodeExpiry) {
        return ctx.badRequest("This code has expired. Please request a new reset code to proceed.");
      }
      await strapi.entityService.update('plugin::users-permissions.user', user.id, {
        data: {
          password: password,
          resetCode: null,
          expiryTime: null,
        }
      });
      return ctx.send({
        message: "Your password has been reset successfully."
      });
    } catch (err) {
      console.error("Reset password error:", err);
      return ctx.throw(500, "Something went wrong. Please try again.");
    }
  };

  plugin.routes['content-api'].routes.push(
    {
      method: 'POST',
      path: '/auth/register',
      handler: 'user.register',
      config: {
        prefix: "",
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/auth/sign-in',
      handler: 'user.signIn',
      config: {
        prefix: "",
        auth: false,
      },
    },
    {
      method: 'PUT',
      path: '/users/:id',
      handler: 'user.update',
      config: {
        prefix: "",
        policies: ['global::is-authenticated']
      }
    },
    {
      method: 'POST',
      path: '/auth/forgot--password',
      handler: 'user.Forgotpassword',
      config: {
        prefix: "",
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/auth/reset--password',
      handler: 'user.Resetpassword',
      config: {
        prefix: "",
        auth: false,
      },
    }
  );
  return plugin;
};

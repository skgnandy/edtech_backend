const utils = require("@strapi/utils");
const _ = require("lodash");
const { sanitize } = utils;
const { ApplicationError, ValidationError } = utils.errors;
'use strict';
module.exports = (plugin) => {
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
      path: '/auth/sign-in',
      handler: 'user.signIn',
      config: {
        prefix: "",
        auth: false,
      },
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

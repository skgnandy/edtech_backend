//module.exports = () => ({});

// config/plugins.js
module.exports = ({ env }) => ({
    // Configure the email plugin 
    email: {
        config: {
            // Specify the provider as 'sendgrid'
            provider: 'sendgrid',
            // Provider options contain settings specific to the SendGrid service
            providerOptions: {
                apiKey: env('SENDGRID_API_KEY'), // Use the SendGrid API from environment variables for security
            },
            // Default email settings
            settings: {
                defaultFrom: 'sknandy11@gmail.com',//'your-email@yourdomain.com' // Email address used as the sender by default
                defaultReplyTo: 'sknandy11@gmail.com',//'your-email@yourdomain.com' // Email address used for replies by default
            },
        },
    },
});
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GridSpace API',
      version: '1.0.0',
      description: 'Production-ready space booking and management platform API',
      contact: {
        name: 'GridSpace API Support',
        email: 'support@gridspace.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production'
          ? process.env.PRODUCTION_URL || 'https://api.gridspace.com'
          : `http://localhost:${process.env.PORT || 5000}`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Description of the error'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '60f7b3b3b3b3b3b3b3b3b3b3'
            },
            fullname: {
              type: 'string',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com'
            },
            role: {
              type: 'string',
              enum: ['user', 'host', 'admin'],
              example: 'user'
            },
            profilePic: {
              type: 'string',
              example: 'https://example.com/avatar.jpg'
            },
            emailVerified: {
              type: 'boolean',
              example: true
            }
          }
        },
        Space: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '60f7b3b3b3b3b3b3b3b3b3b3'
            },
            title: {
              type: 'string',
              example: 'Modern Co-working Space'
            },
            description: {
              type: 'string',
              example: 'A beautiful workspace with modern amenities'
            },
            location: {
              type: 'string',
              example: 'Lagos Island'
            },
            pricePerHour: {
              type: 'number',
              example: 3000
            },
            capacity: {
              type: 'number',
              example: 20
            },
            amenities: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['WiFi', 'Air Conditioning', 'Projector', 'Coffee/Tea']
              }
            },
            purposes: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['Remote Work', 'Team Meetings', 'Presentations']
              }
            },
            images: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uri'
              }
            }
          }
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: [
    './routes/*.js',
    './controllers/*.js',
    './models/*.js'
  ]
};

// Generate swagger spec
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Organize swagger UI options
const swaggerUiOptions = {
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'list',
    filter: false,
    showExtensions: true,
    showCommonExtensions: true,
    requestInterceptor: (req) => {
      // Add any custom headers if needed
      return req;
    }
  },
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #2c3e50 }
    .swagger-ui .auth-wrapper { background: #f8f9fa; padding: 10px; margin: 10px 0; border-radius: 4px; }
  `,
  customSiteTitle: 'GridSpace API Documentation',
  customfavIcon: '/favicon.ico'
};

export { swaggerSpec, swaggerUiOptions };

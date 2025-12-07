import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Get API URL from environment or use default
const apiUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 5002}`;
const isProduction = process.env.NODE_ENV === 'production';

// Build servers array dynamically
const servers = [
  {
    url: `${apiUrl}/api/v1`,
    description: isProduction ? 'Production API' : 'Local Development',
    variables: {
      basePath: {
        default: '/api/v1',
        description: 'API base path',
      }
    }
  }
];

// Add localhost server in development if production URL is set
if (isProduction && apiUrl !== 'http://localhost:5002') {
  servers.push({
    url: 'http://localhost:5002/api/v1',
    description: 'Local Development',
    variables: {
      basePath: {
        default: '/api/v1',
        description: 'API base path',
      }
    }
  });
}

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GridSpace API',
      version: '1.1.0',
      description: 'Comprehensive API for managing workspaces, bookings, and user interactions',
      contact: {
        name: 'GridSpace Support',
        email: 'support@gridspace.com',
        url: 'https://gridspace.com/support'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers,
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"',
          in: 'header'
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
          description: 'JWT token stored in HTTP-only cookie (for browser-based access)'
        }
      },
      security: [
        {
          bearerAuth: []
        },
        {
          cookieAuth: []
        }
      ],
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
            },
            walletId: {
              type: 'string',
              description: 'Reference to user wallet',
              example: '60f7b3b3b3b3b3b3b3b3b3b3'
            },
            isActive: {
              type: 'boolean',
              description: 'Account active status',
              example: true
            },
            suspension: {
              type: 'object',
              properties: {
                isSuspended: {
                  type: 'boolean',
                  example: false
                },
                reason: {
                  type: 'string',
                  enum: ['fraud', 'policy_violation', 'chargeback_dispute', 'abuse', 'other', null],
                  example: null
                },
                suspendedAt: {
                  type: 'string',
                  format: 'date-time',
                  example: null
                }
              }
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
        },
        Booking: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '60f7b3b3b3b3b3b3b3b3b3b3'
            },
            userId: {
              type: 'string',
              example: '60f7b3b3b3b3b3b3b3b3b3b3'
            },
            spaceId: {
              type: 'string',
              example: '60f7b3b3b3b3b3b3b3b3b3b3'
            },
            startTime: {
              type: 'string',
              format: 'date-time',
              example: '2025-01-15T10:00:00.000Z'
            },
            endTime: {
              type: 'string',
              format: 'date-time',
              example: '2025-01-15T14:00:00.000Z'
            },
            guestCount: {
              type: 'number',
              example: 5
            },
            basePrice: {
              type: 'number',
              description: 'Host base price (100% goes to host)',
              example: 10000
            },
            markupPercentage: {
              type: 'number',
              description: 'Platform markup percentage',
              example: 15
            },
            markupAmount: {
              type: 'number',
              description: 'Platform fee amount',
              example: 1500
            },
            totalAmount: {
              type: 'number',
              description: 'Total amount user pays (basePrice + markupAmount)',
              example: 11500
            },
            hostEarnings: {
              type: 'number',
              description: 'Amount host receives (100% of basePrice)',
              example: 10000
            },
            status: {
              type: 'string',
              enum: ['pending', 'upcoming', 'in_progress', 'completed', 'cancelled'],
              example: 'upcoming'
            },
            paymentStatus: {
              type: 'string',
              enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
              example: 'paid'
            },
            paymentReference: {
              type: 'string',
              description: 'Monnify payment reference',
              example: 'GS-1234567890-60f7b3b3b3b3b3b3b3b3b3b3'
            },
            transactionReference: {
              type: 'string',
              description: 'Monnify transaction reference',
              example: 'MNFY|20|20250113...'
            },
            paidAt: {
              type: 'string',
              format: 'date-time',
              description: 'Payment completion timestamp',
              example: '2025-01-10T18:30:00.000Z'
            },
            hostPaidOut: {
              type: 'boolean',
              description: 'Whether host has been paid',
              example: false
            },
            hostPaidOutAt: {
              type: 'string',
              format: 'date-time',
              description: 'When host was paid (space approval)',
              example: null
            },
            bookingType: {
              type: 'string',
              enum: ['hourly', 'daily', 'weekly', 'monthly'],
              example: 'hourly'
            },
            duration: {
              type: 'number',
              description: 'Booking duration in units',
              example: 4
            },
            specialRequests: {
              type: 'string',
              example: 'Need projector setup'
            },
            expiresAt: {
              type: 'string',
              format: 'date-time',
              description: '5-minute payment window expiry',
              example: '2025-01-10T18:35:00.000Z'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-01-10T18:30:00.000Z'
            }
          }
        },
        Wallet: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '60f7b3b3b3b3b3b3b3b3b3b3'
            },
            userId: {
              type: 'string',
              example: '60f7b3b3b3b3b3b3b3b3b3b3'
            },
            availableBalance: {
              type: 'number',
              description: 'Balance available for withdrawal',
              example: 10000
            },
            pendingBalance: {
              type: 'number',
              description: 'Balance pending space approval',
              example: 5000
            },
            totalBalance: {
              type: 'number',
              description: 'Total balance (available + pending)',
              example: 15000
            },
            currency: {
              type: 'string',
              example: 'NGN'
            },
            dailyWithdrawalLimit: {
              type: 'number',
              example: 50000
            },
            monthlyWithdrawalLimit: {
              type: 'number',
              example: 500000
            }
          }
        },
        WalletTransaction: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '60f7b3b3b3b3b3b3b3b3b3b3'
            },
            walletId: {
              type: 'string',
              example: '60f7b3b3b3b3b3b3b3b3b3b3'
            },
            userId: {
              type: 'string',
              example: '60f7b3b3b3b3b3b3b3b3b3b3'
            },
            type: {
              type: 'string',
              enum: ['credit', 'debit'],
              example: 'credit'
            },
            category: {
              type: 'string',
              enum: ['booking_payment', 'host_earning', 'platform_fee', 'withdrawal', 'refund', 'deposit'],
              example: 'host_earning'
            },
            amount: {
              type: 'number',
              example: 10000
            },
            balanceBefore: {
              type: 'number',
              example: 5000
            },
            balanceAfter: {
              type: 'number',
              example: 15000
            },
            status: {
              type: 'string',
              enum: ['pending', 'completed', 'failed'],
              example: 'completed'
            },
            reference: {
              type: 'string',
              example: 'WTX-1234567890-60f7b3b3b3b3b3b3b3b3b3b3'
            },
            description: {
              type: 'string',
              example: 'Booking payment for Modern Co-working Space'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-01-10T18:30:00.000Z'
            }
          }
        },
        Withdrawal: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '60f7b3b3b3b3b3b3b3b3b3b3'
            },
            userId: {
              type: 'string',
              example: '60f7b3b3b3b3b3b3b3b3b3b3'
            },
            amount: {
              type: 'number',
              example: 10000
            },
            bankAccount: {
              type: 'object',
              properties: {
                accountNumber: {
                  type: 'string',
                  example: '0123456789'
                },
                accountName: {
                  type: 'string',
                  example: 'John Doe'
                },
                bankName: {
                  type: 'string',
                  example: 'GTBank'
                }
              }
            },
            status: {
              type: 'string',
              enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
              example: 'pending'
            },
            reference: {
              type: 'string',
              example: 'WD-1234567890-60f7b3b3b3b3b3b3b3b3b3b3'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-01-10T18:30:00.000Z'
            }
          }
        },
        Transaction: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '60f7b3b3b3b3b3b3b3b3b3b3'
            },
            bookingId: {
              type: 'string',
              example: '60f7b3b3b3b3b3b3b3b3b3b3'
            },
            userId: {
              type: 'string',
              example: '60f7b3b3b3b3b3b3b3b3b3b3'
            },
            paymentReference: {
              type: 'string',
              example: 'GS-1234567890-60f7b3b3b3b3b3b3b3b3b3b3'
            },
            transactionReference: {
              type: 'string',
              example: 'MNFY|20|20250113...'
            },
            amount: {
              type: 'number',
              example: 11500
            },
            status: {
              type: 'string',
              enum: ['pending', 'paid', 'failed'],
              example: 'paid'
            },
            paymentMethod: {
              type: 'string',
              example: 'CARD'
            },
            checkoutUrl: {
              type: 'string',
              example: 'https://sandbox.monnify.com/checkout/...'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-01-10T18:30:00.000Z'
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
    './routes/admin/*.js',
    './models/*.js',
    './controllers/**/*.js',
    './middleware/*.js',
    './validators/*.js'
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

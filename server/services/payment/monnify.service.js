import axios from 'axios';
import crypto from 'crypto';
import NodeCache from 'node-cache';
import env from '../../config/env.js';
import logger from '../../config/logger.js';
import AppError from '../../utils/AppError.js';

const tokenCache = new NodeCache({ stdTTL: 3600 });

class MonnifyService {
  constructor() {
    this.baseUrl = env.monnify.baseUrl;
    this.apiKey = env.monnify.apiKey;
    this.secretKey = env.monnify.secretKey;
    this.contractCode = env.monnify.contractCode;
    this.webhookSecret = env.monnify.webhookSecret;
    this.enabled = env.monnify.enabled;
  }

  async getAuthToken() {
    if (!this.enabled) {
      throw new AppError('Monnify payment gateway not configured', 500);
    }

    const cached = tokenCache.get('monnify_token');
    if (cached) return cached;

    try {
      const credentials = Buffer.from(`${this.apiKey}:${this.secretKey}`).toString('base64');
      
      const response = await axios.post(
        `${this.baseUrl}/api/v1/auth/login`,
        {},
        { headers: { 'Authorization': `Basic ${credentials}` } }
      );

      const token = response.data.responseBody.accessToken;
      tokenCache.set('monnify_token', token);
      logger.info('[Monnify] Token generated');
      return token;
    } catch (error) {
      logger.error('[Monnify] Auth failed', { error: error.message });
      throw new AppError('Payment gateway authentication failed', 500);
    }
  }

  async initializeTransaction(data) {
    const token = await this.getAuthToken();
    
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/v1/merchant/transactions/init-transaction`,
        {
          amount: data.amount,
          customerEmail: data.customerEmail,
          customerName: data.customerName,
          paymentReference: data.paymentReference,
          paymentDescription: data.paymentDescription,
          currencyCode: 'NGN',
          contractCode: this.contractCode,
          redirectUrl: data.redirectUrl,
          paymentMethods: ['CARD', 'ACCOUNT_TRANSFER']
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      logger.info('[Monnify] Transaction initialized', { 
        reference: data.paymentReference,
        amount: data.amount 
      });

      return response.data.responseBody;
    } catch (error) {
      logger.error('[Monnify] Init failed', { 
        error: error.response?.data || error.message 
      });
      throw new AppError('Failed to initialize payment', 500);
    }
  }

  async verifyTransaction(paymentReference) {
    const token = await this.getAuthToken();
    
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/v2/transactions/${encodeURIComponent(paymentReference)}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      return response.data.responseBody;
    } catch (error) {
      logger.error('[Monnify] Verification failed', { 
        reference: paymentReference,
        error: error.response?.data || error.message 
      });
      throw new AppError('Failed to verify payment', 500);
    }
  }

  validateWebhookSignature(signature, payload) {
    // CRITICAL FIX #4: Use HMAC-SHA512 (not plain SHA-512)
    // Monnify formula: SHA-512-HMAC(clientSecret, requestBody)
    const hash = crypto
      .createHmac('sha512', this.secretKey)
      .update(JSON.stringify(payload))
      .digest('hex');
    return hash === signature;
  }
}

export default new MonnifyService();

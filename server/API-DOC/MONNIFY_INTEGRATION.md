# Monnify Payment Integration Guide

This document details the integration of the Monnify Payment Gateway into the GridSpace application. It covers setup, payment initialization, webhook handling, and disbursements (withdrawals).

## 1. Prerequisites & Setup

### Environment Variables
Ensure the following variables are set in your `.env` file:

```env
MONNIFY_API_KEY=your_api_key
MONNIFY_SECRET_KEY=your_secret_key
MONNIFY_CONTRACT_CODE=your_contract_code
MONNIFY_BASE_URL=https://sandbox.monnify.com # or https://api.monnify.com for production
MONNIFY_WALLET_ACCOUNT_NUMBER=your_wallet_account_number
```

### Base URL
- **Sandbox:** `https://sandbox.monnify.com`
- **Production:** `https://api.monnify.com`

---

## 2. Authentication

All API requests (except the initial auth request) require a Bearer Token.

### Generate Access Token
**Endpoint:** `POST /api/v1/auth/login`
**Auth:** Basic Auth (Base64 encode `API_KEY:SECRET_KEY`)

**Response:**
```json
{
    "requestSuccessful": true,
    "responseMessage": "success",
    "responseCode": "0",
    "responseBody": {
        "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
        "expiresIn": 3600
    }
}
```
*The application automatically handles token generation and caching in `monnify.service.js`.*

---

## 3. Payment Flow (Collections)

### 3.1 Initialize Transaction
Used for both **Booking Payments** and **Wallet Deposits**.

**Endpoint:** `POST /api/v1/merchant/transactions/init-transaction`

**Payload:**
```json
{
    "amount": 5000.00,
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "paymentReference": "GS-1234567890", // Unique Reference
    "paymentDescription": "Wallet Deposit",
    "currencyCode": "NGN",
    "contractCode": "1234567890",
    "redirectUrl": "https://gridspace.com/payment/callback",
    "paymentMethods": ["CARD", "ACCOUNT_TRANSFER"]
}
```

**Response:**
```json
{
    "requestSuccessful": true,
    "responseBody": {
        "checkoutUrl": "https://sandbox.monnify.com/checkout/...",
        "paymentReference": "GS-1234567890",
        "transactionReference": "MNFY|12|2023..."
    }
}
```

---

## 4. Webhooks

Monnify sends webhooks to notify the system of transaction status changes.
**Endpoint:** `POST /api/v1/payments/monnify/webhook`

### 4.1 Signature Validation
To verify the webhook comes from Monnify, calculate the hash of the request body using your `SECRET_KEY` and compare it to the `monnify-signature` header.

```javascript
const crypto = require('crypto');
const calculatedHash = crypto.createHmac('sha512', process.env.MONNIFY_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest('hex');

if (calculatedHash === req.headers['monnify-signature']) {
    // Valid request
}
```

### 4.2 Successful Transaction Payload
Event: `SUCCESSFUL_TRANSACTION`

```json
{
    "eventType": "SUCCESSFUL_TRANSACTION",
    "eventData": {
        "product": {
            "type": "WEB_SDK",
            "reference": "GS-1234567890"
        },
        "transactionReference": "MNFY|12|2023...",
        "paymentReference": "GS-1234567890",
        "amountPaid": 5000.00,
        "totalPayable": 5000.00,
        "settlementAmount": 4900.00,
        "paidOn": "2023-05-20 10:00:00",
        "paymentStatus": "PAID",
        "paymentDescription": "Wallet Deposit",
        "currency": "NGN",
        "paymentMethod": "CARD",
        "customer": {
            "name": "John Doe",
            "email": "john@example.com"
        }
    }
}
```

---

## 5. Disbursements (Withdrawals)

Used to transfer funds from the GridSpace wallet to a user's bank account.

### 5.1 Initiate Transfer
**Endpoint:** `POST /api/v2/disbursements/single`

**Payload:**
```json
{
    "amount": 10000.00,
    "reference": "WD-1234567890",
    "narration": "Withdrawal from GridSpace",
    "destinationBankCode": "058", // GTBank
    "destinationAccountNumber": "0123456789",
    "currency": "NGN",
    "sourceAccountNumber": "YOUR_WALLET_ACCOUNT_NUMBER"
}
```

### 5.2 Disbursement Webhook
Event: `SUCCESSFUL_DISBURSEMENT` or `FAILED_DISBURSEMENT`

```json
{
    "eventType": "SUCCESSFUL_DISBURSEMENT",
    "eventData": {
        "reference": "WD-1234567890",
        "amount": 10000.00,
        "fee": 50.00,
        "status": "SUCCESS",
        "date": "2023-05-20 12:00:00",
        "destinationAccountName": "John Doe",
        "destinationBankName": "GTBank"
    }
}
```

---

## 6. Testing (Sandbox)

- **Test Cards:** Use Monnify provided test cards for successful/failed transactions.
- **Test Bank Transfer:** Use the simulated transfer option in the checkout modal.
- **Bank Codes:**
    - GTBank: `058`
    - Zenith Bank: `057`
    - First Bank: `011`

import Stripe from 'stripe';
import Logger from '../utils/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
    apiVersion: '2025-02-11' as any,
});

export class PaymentService {
    /**
     * Creates a secure Stripe Checkout Session
     */
    static async createCheckoutSession(userId: string, email: string) {
        try {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: 'My Socially Premium Credits',
                                description: 'Credits for generating dynamic images',
                            },
                            unit_amount: 1000, // $10.00
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.FRONTEND_URL}/cancel`,
                customer_email: email,
                client_reference_id: userId,
                metadata: {
                    userId,
                },
            });

            Logger.info(`Stripe Checkout Session created for user ${userId}: ${session.id}`);
            return session;
        } catch (error) {
            Logger.error('Stripe Checkout Error:', error);
            throw new Error('Failed to create payment session');
        }
    }

    /**
     * Processes a refund with an Idempotency Key for safety
     */
    static async processRefund(paymentIntentId: string) {
        try {
            // Production standard: use a unique idempotency key based on the intent and action
            const idempotencyKey = `refund_${paymentIntentId}`;

            const refund = await stripe.refunds.create(
                {
                    payment_intent: paymentIntentId,
                },
                {
                    idempotencyKey,
                }
            );

            Logger.info(`Refund processed successfully for Intent ${paymentIntentId}: ${refund.id}`);
            return refund;
        } catch (error: any) {
            Logger.error('Stripe Refund Error:', error);
            throw new Error(error.message || 'Failed to process refund');
        }
    }

    /**
     * Verifies Stripe Webhook Signature
     */
    static verifyWebhook(payload: Buffer, signature: string, secret: string) {
        try {
            return stripe.webhooks.constructEvent(payload, signature, secret);
        } catch (error: any) {
            Logger.error('Webhook Verification Failed:', error.message);
            throw new Error(`Webhook Error: ${error.message}`);
        }
    }
}

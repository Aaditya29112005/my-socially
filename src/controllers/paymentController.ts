import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/paymentService';
import Logger from '../utils/logger';

export class PaymentController {
    static async createCheckout(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            const email = req.user?.email;

            if (!userId || !email) {
                return res.status(401).json({
                    status: 'fail',
                    message: 'User authentication required',
                });
            }

            const session = await PaymentService.createCheckoutSession(userId, email);

            res.status(200).json({
                status: 'success',
                url: session.url,
            });
        } catch (error) {
            next(error);
        }
    }

    static async triggerRefund(req: Request, res: Response, next: NextFunction) {
        try {
            const { paymentIntentId } = req.body;

            if (!paymentIntentId) {
                return res.status(400).json({
                    status: 'fail',
                    message: 'Payment Intent ID is required',
                });
            }

            const refund = await PaymentService.processRefund(paymentIntentId);

            res.status(200).json({
                status: 'success',
                data: { refund },
            });
        } catch (error) {
            next(error);
        }
    }

    static async handleWebhook(req: Request, res: Response, next: NextFunction) {
        const sig = req.headers['stripe-signature'] as string;
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

        let event;

        try {
            // Note: We need the raw body for webhook verification
            event = PaymentService.verifyWebhook(req.body, sig, webhookSecret);
        } catch (err: any) {
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object as any;
                Logger.info(`Payment succeeded for session ${session.id}`);
                // Here we would fulfill the order in the database
                break;
            default:
                Logger.debug(`Unhandled webhook event type ${event.type}`);
        }

        res.status(200).json({ received: true });
    }
}

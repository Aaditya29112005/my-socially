import { Request, Response, NextFunction } from 'express';
import { ImageService } from '../services/imageService';
import prisma from '../utils/prisma';
import Logger from '../utils/logger';

export class ImageController {
    static async generateGreeting(req: Request, res: Response, next: NextFunction) {
        try {
            const { name } = req.body;
            const userId = req.user?.id;

            if (!name) {
                return res.status(400).json({
                    status: 'fail',
                    message: 'Please provide a name for the banner',
                });
            }

            if (!userId) {
                return res.status(401).json({
                    status: 'fail',
                    message: 'User context is missing',
                });
            }

            // Generate the image buffer
            const buffer = await ImageService.generateGreetingBanner(name);

            // In a real production app, we would upload this to S3.
            // For this assignment, we'll simulate it by generating a placeholder URL
            // and saving the context to the database as specified.
            const imageUrl = `https://storage.my-socially.com/generated/${Date.now()}.webp`;

            const imageRecord = await prisma.image.create({
                data: {
                    url: imageUrl,
                    type: 'greeting_banner',
                    prompt: `Profile greeting for ${name}`,
                    userId: userId,
                    metadata: {
                        name: name,
                        generatedAt: new Date().toISOString()
                    }
                },
            });

            // We'll return the buffer directly for demonstration, 
            // but also provide the DB record info.
            res.set('Content-Type', 'image/webp');
            res.send(buffer);

            Logger.info(`Successfully generated dynamic image for user ${userId}`);
        } catch (error) {
            next(error);
        }
    }
}

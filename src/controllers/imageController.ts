import { Request, Response, NextFunction } from 'express';
import { ImageService } from '../services/imageService';
import prisma from '../utils/prisma';
import Logger from '../utils/logger';

export class ImageController {
    static async generateGreeting(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, grayscale, blur, tint } = req.body;
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

            // Generate and save the image with filters
            const { buffer, fileName } = await ImageService.generateGreetingBanner(name, {
                grayscale: !!grayscale,
                blur: blur ? Number(blur) : undefined,
                tint: tint as string
            });

            // Relative URL for serving via express.static
            const imageUrl = `/public/uploads/${fileName}`;

            const imageRecord = await prisma.image.create({
                data: {
                    url: imageUrl,
                    type: 'greeting_banner',
                    prompt: `Profile greeting for ${name}`,
                    userId: userId,
                    metadata: {
                        name: name,
                        filters: { grayscale, blur, tint },
                        generatedAt: new Date().toISOString()
                    }
                },
            });

            // Send the image record info along with the buffer
            res.set('Content-Type', 'image/webp');
            res.set('X-Image-Id', imageRecord.id);
            res.send(buffer);

            Logger.info(`Successfully generated and persisted image for user ${userId}: ${fileName}`);
        } catch (error) {
            next(error);
        }
    }

    static async getUserImages(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({
                    status: 'fail',
                    message: 'User authentication required',
                });
            }

            const images = await prisma.image.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
            });

            res.status(200).json({
                status: 'success',
                results: images.length,
                data: { images },
            });
        } catch (error) {
            next(error);
        }
    }
}

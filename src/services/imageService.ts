import { createCanvas, registerFont } from 'canvas';
import sharp from 'sharp';
import Logger from '../utils/logger';
import path from 'path';
import fs from 'fs';

export class ImageService {
    private static readonly OUTPUT_DIR = path.join(process.cwd(), 'public', 'generated');

    constructor() {
        if (!fs.existsSync(ImageService.OUTPUT_DIR)) {
            fs.mkdirSync(ImageService.OUTPUT_DIR, { recursive: true });
        }
    }

    /**
   * Generates and saves a personalized greeting banner with optional filters
   * @param name User's name
   * @param options Processing options (grayscale, blur, tint)
   * @returns Object containing the buffer and the saved file path
   */
    static async generateGreetingBanner(
        name: string,
        options: { grayscale?: boolean; blur?: number; tint?: string } = {}
    ): Promise<{ buffer: Buffer; fileName: string }> {
        try {
            const width = 1200;
            const height = 630;
            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext('2d');

            // 1. Background Gradient
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, '#6a11cb');
            gradient.addColorStop(1, '#2575fc');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // 2. Add subtle pattern
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.beginPath();
            ctx.arc(width * 0.8, height * 0.2, 200, 0, Math.PI * 2);
            ctx.fill();

            // 3. Text Overlay
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';

            // Title
            ctx.font = 'bold 60px sans-serif';
            ctx.fillText('Welcome to My Socially,', width / 2, height / 2 - 40);

            // Personalized Name
            let fontSize = 100;
            ctx.font = `bold ${fontSize}px sans-serif`;
            const maxWidth = width - 100;
            while (ctx.measureText(name).width > maxWidth && fontSize > 40) {
                fontSize -= 5;
                ctx.font = `bold ${fontSize}px sans-serif`;
            }
            ctx.fillText(name, width / 2, height / 2 + 80);

            // 4. Subtext
            ctx.font = '30px sans-serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillText('Your production-grade workspace is ready.', width / 2, height / 2 + 160);

            // 5. Build Sharp Pipeline
            const buffer = canvas.toBuffer('image/png');
            let pipeline = sharp(buffer);

            if (options.grayscale) {
                pipeline = pipeline.grayscale();
            }

            if (options.blur) {
                pipeline = pipeline.blur(options.blur);
            }

            if (options.tint) {
                pipeline = pipeline.tint(options.tint);
            }

            const webpBuffer = await pipeline
                .webp({ quality: 80 })
                .toBuffer();

            // 6. Persist to public/uploads
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
            const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);

            if (!fs.existsSync(path.dirname(filePath))) {
                fs.mkdirSync(path.dirname(filePath), { recursive: true });
            }

            fs.writeFileSync(filePath, webpBuffer);

            return { buffer: webpBuffer, fileName };

        } catch (error) {
            Logger.error('Image Generation Service Error:', error);
            throw new Error('Failed to generate image');
        }
    }
}

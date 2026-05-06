import sharp, { type Sharp } from 'sharp';

export default class ImageProcessor {
    private pipeline: Sharp;

    constructor(fileBase64: string) {
        const base64Data = fileBase64.split(',')[1] || fileBase64;
        this.pipeline = sharp(Buffer.from(base64Data, 'base64'));
    }

    public resize(width: number, height: number = width) {
        this.pipeline = this.pipeline.resize(width, height, {
            fit: 'inside',
            withoutEnlargement: true
        });
        return this;
    }

    public optimize(quality: number = 75) {
        this.pipeline = this.pipeline.webp({ quality });
        return this;
    }

    public async toBuffer() {
        return this.pipeline.toBuffer();
    }

    public async getMetadata() {
        return this.pipeline.metadata();
    }
}

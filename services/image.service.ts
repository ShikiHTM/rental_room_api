import sharp, { type Sharp } from 'sharp';

export default class ImageProcessor {
    private pipeline: Sharp;

    constructor(input: string | Buffer) {
        if (Buffer.isBuffer(input)) {
            this.pipeline = sharp(input);
        }

        else if (typeof input === 'string') {
            const base64Data = input.split(',')[1] || input;
            this.pipeline = sharp(Buffer.from(base64Data, 'base64'));
        }

        else {
            throw new Error("Invalid input type provided to ImageProcessor. Expected: string | Buffer")
        }
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

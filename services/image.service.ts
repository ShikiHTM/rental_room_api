import sharp from 'sharp';

export default class ImageProcessor {
    private buffer: Buffer;
    private fileName: string

    constructor(fileBase64: string, fileName: string = 'image') {
        const base64Data = fileBase64.split(',')[1] || fileBase64;
        this.buffer = Buffer.from(base64Data, 'base64');
        this.fileName = fileName;
    }

    /**
     * Resizes image to desires dimension
     * @param width Width of the dimension
     * @param height Height of the dimension
     * @returns resized image
     */
    public async resize(width: number, height: number = width) {
        this.buffer = await sharp(this.buffer)
            .resize(width, height, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .toBuffer()

        return this;
    }

    /**
     * Compress and convert the extension to Webp
     * @param quality The quality of the image
     * @returns converted image
     */
    public async optimize(quality: number = 75) {
        this.buffer = await sharp(this.buffer)
            .webp({
                quality
            })
            .toBuffer();

        return this;
    }

    public getBuffer() {
        return this.buffer;
    }

    public getFilename() {
        return this.fileName;
    }

    /**
     * Get image's metadata
     * @returns image's metadata
     */
    public async getMetadata() {
        return await sharp(this.buffer).metadata();
    }
}

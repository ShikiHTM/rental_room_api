import { v2 as cloudinary } from 'cloudinary'
import { cloudinaryConfig } from '../config/cloudinary.config.js';
import ImageProcessor from './image.service.js';
import { logger } from './logger.service.js';
import crypto from 'node:crypto';

export interface UploadResponse {
    image_url: string;
    public_id: string;
}

class Cloudinary {
    constructor() {
        cloudinary.config({
            cloud_name: cloudinaryConfig.cloudName,
            api_key: cloudinaryConfig.apiKey,
            api_secret: cloudinaryConfig.secretKey
        });
    }

    private async getImageBuffer(input: string) {
        if (input.startsWith("http")) {
            const response = await fetch(input, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.statusText}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            return Buffer.from(arrayBuffer);
        }

        return input;
    }

    /**
     * Upload an image to cloudinary
     * @param fileBase64 - The image data in base64 format
     * @returns {Promise<UploadResponse>}
     */
    public async upload(input: string): Promise<UploadResponse> {

        try {
            const resolvedInput = await this.getImageBuffer(input);

            console.log(resolvedInput)

            const buffer = await new ImageProcessor(resolvedInput as any)
                .optimize(75)
                .resize(1200)
                .toBuffer();

            return new Promise((resolve, reject) => {
                const hash = crypto.createHash('sha256').update(buffer).digest('hex');

                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: "rental_room",
                        public_id: hash,
                        overwrite: true,
                        resource_type: 'auto'
                    },
                    (error, result) => {
                        if (error) {
                            logger.error("Cloudinary Error:", error);
                            return reject(new Error('Upload to Cloudinary failed'));
                        }

                        resolve({
                            image_url: result!.secure_url,
                            public_id: result!.public_id
                        })
                    }
                )

                stream.end(buffer);
            })
        } catch (error) {
            logger.error('Cloudinary Upload Error:', error);
            throw new Error('Uploads image failed')
        }
    }

    /**
     * Deletes an image from Cloudinary using its public ID.
     * * @param {string} public_id - The unique identifier of the image to be deleted.
     * @returns {Promise<boolean | null>} 
     * - Returns `true` if the image was successfully deleted.
     * - Returns `false` if the deletion failed or the image was not found.
     * - Returns `null` if no public_id was provided.
     * * @throws {Error} Throws an error if the Cloudinary API call fails.
     */
    public async destroy(public_id: string): Promise<boolean | null> {
        if (!public_id) {
            return null;
        }

        try {
            const response = await cloudinary.uploader.destroy(public_id);
            if (response.result === 'ok') {
                return true;
            }
            logger.warn(`Cloudinary delete warning: ${response.result} for ID: ${public_id}`);
            return false;
        } catch (error) {
            logger.error('Cloudinary Upload Error:', error);
            throw new Error('Deletes image failed')
        }
    }
}

const cloudinaryService = new Cloudinary();
export { cloudinaryService };

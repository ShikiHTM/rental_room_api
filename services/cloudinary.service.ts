import { v2 as cloudinary } from 'cloudinary'
import { cloudinaryConfig } from '../config/cloudinary.config.js';
import ImageProcessor from './image.service.js';

interface UploadResponse {
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

    /**
     * Upload an image to cloudinary
     * @param fileBase64 - The image data in base64 format
     * @returns {Promise<UploadResponse>}
     */
    public async upload(fileBase64: string): Promise<UploadResponse> {
        const image = new ImageProcessor(fileBase64);

        await image.optimize(75);
        await image.resize(1200);

        try {
            const buffer = image.getBuffer();

            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: "rental_room",
                        resource_type: 'auto'
                    },
                    (error, result) => {
                        if (error) {
                            console.error("Cloudinary Error:", error);
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
            console.error('Cloudinary Upload Error:', error);
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
            console.warn(`Cloudinary delete warning: ${response.result} for ID: ${public_id}`);
            return false;
        } catch (error) {
            console.error('Cloudinary Upload Error:', error);
            throw new Error('Deletes image failed')
        }
    }
}

const cloudinaryService = new Cloudinary();
export { cloudinaryService };

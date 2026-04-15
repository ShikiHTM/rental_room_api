import {v2 as cloudinary} from 'cloudinary'
import { cloudinaryConfig } from '../config/cloudinary.config.js';

cloudinary.config({
    cloud_name: cloudinaryConfig.cloudName,
    api_key: cloudinaryConfig.apiKey,
    api_secret: cloudinaryConfig.secretKey
});

export const uploadImage = async (fileBase64: string) => {
    const result = await cloudinary.uploader.upload(fileBase64, {
        folder: 'rental_rooms'
    })

    return result.secure_url;
}
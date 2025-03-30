import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config();

// Configure Cloudinary with credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create storage engine for products
const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "apl-shoes/products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1000, crop: "limit" }], // Resize images to max width 1000px
  },
});

// Create storage engine for brands
const brandStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "apl-shoes/brands",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 500, crop: "limit" }], // Brand logos typically smaller
  },
});

// Create multer upload instances
const uploadProduct = multer({
  storage: productStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(
      new Error("Hanya file gambar yang diperbolehkan (jpg, jpeg, png, webp)")
    );
  },
});

const uploadBrand = multer({
  storage: brandStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit for brand images
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(
      new Error("Hanya file gambar yang diperbolehkan (jpg, jpeg, png, webp)")
    );
  },
});

/**
 * Delete an image from Cloudinary
 * @param {string} imageUrl - The full URL of the image to delete
 * @returns {Promise} - Resolution of the deletion operation
 */
const deleteImage = async (imageUrl) => {
  try {
    // Extract public ID from the Cloudinary URL
    // URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.ext
    const urlParts = imageUrl.split("/");
    const fileName = urlParts[urlParts.length - 1];
    const folderPath = urlParts[urlParts.length - 2];

    // The public ID includes the folder
    let publicId = `${folderPath}/${fileName.split(".")[0]}`;

    // Handle version in the URL if present
    if (imageUrl.includes("/v")) {
      const versionMatch = imageUrl.match(/\/v\d+\//);
      if (versionMatch) {
        // Remove version from publicId calculation
        publicId = imageUrl.split(versionMatch[0])[1].replace(/\.[^/.]+$/, ""); // Remove file extension
      }
    }

    // Delete the image from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    throw error;
  }
};

/**
 * Upload an image buffer directly to Cloudinary (useful for programmatic uploads)
 * @param {Buffer} buffer - The image buffer
 * @param {string} folder - The folder to upload to (e.g., 'products', 'brands')
 * @returns {Promise} - The Cloudinary upload result
 */
const uploadBuffer = async (buffer, folder = "apl-shoes/products") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
};

export { uploadProduct, uploadBrand, deleteImage, uploadBuffer, cloudinary };

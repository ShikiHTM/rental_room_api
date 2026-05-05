import prisma from "../prisma/client.js";

// GET ALL REVIEW IMAGES
export const getAllReviewImages = async (req, res) => {
  try {
    const images = await prisma.reviewImage.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(images);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// GET REVIEW IMAGE BY ID
export const getReviewImageById = async (req, res) => {
  try {
    const { id } = req.params;

    const image = await prisma.reviewImage.findUnique({
      where: { id },
    });

    if (!image) {
      return res.status(404).json({ message: "Review image not found" });
    }

    return res.status(200).json(image);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// CREATE REVIEW IMAGE
export const createReviewImage = async (req, res) => {
  try {
    const { imageUrl, publicId, reviewId } = req.body;

    // Validate
    if (!imageUrl || !publicId || !reviewId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newImage = await prisma.reviewImage.create({
      data: {
        imageUrl,
        publicId,
        reviewId,
      },
    });

    return res.status(201).json(newImage);
  } catch (error) {
    // Bắt lỗi trùng publicId
    if (error.code === "P2002") {
      return res.status(400).json({ message: "Image publicId already exists" });
    }
    return res.status(500).json({ error: error.message });
  }
};

// UPDATE REVIEW IMAGE (Thực tế ít dùng, thường người ta xoá ảnh cũ rồi tạo ảnh mới)
export const updateReviewImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl, publicId } = req.body;

    // Check tồn tại
    const existing = await prisma.reviewImage.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Review image not found" });
    }

    const updatedImage = await prisma.reviewImage.update({
      where: { id },
      data: {
        ...(imageUrl && { imageUrl }),
        ...(publicId && { publicId }),
      },
    });

    return res.status(200).json(updatedImage);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ message: "Image publicId already exists" });
    }
    return res.status(500).json({ error: error.message });
  }
};

// DELETE REVIEW IMAGE
export const deleteReviewImage = async (req, res) => {
  try {
    const { id } = req.params;

    // Check tồn tại
    const existing = await prisma.reviewImage.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Review image not found" });
    }

    // Xoá record trong Database
    await prisma.reviewImage.delete({
      where: { id },
    });

    return res.status(200).json({
      message: "Review image deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

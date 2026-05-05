import prisma from "../prisma/client.js";

// GET ALL IMAGES
export const getAllReviewImages = async (req, res) => {
  try {
    const images = await prisma.reviewImage.findMany({
      include: {
        review: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(images);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// GET IMAGE BY ID
export const getReviewImageById = async (req, res) => {
  try {
    const { id } = req.params;

    const image = await prisma.reviewImage.findUnique({
      where: { id },
      include: {
        review: true,
      },
    });

    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    return res.status(200).json(image);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// CREATE IMAGE
export const createReviewImage = async (req, res) => {
  try {
    const { imageUrl, publicId, reviewId } = req.body;

    // validate
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
    // unique publicId
    if (error.code === "P2002") {
      return res.status(400).json({ message: "publicId already exists" });
    }

    return res.status(500).json({ error: error.message });
  }
};

// UPDATE IMAGE
export const updateReviewImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl, publicId } = req.body;

    const existing = await prisma.reviewImage.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Image not found" });
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
      return res.status(400).json({ message: "publicId already exists" });
    }

    return res.status(500).json({ error: error.message });
  }
};

// DELETE IMAGE
export const deleteReviewImage = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.reviewImage.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Image not found" });
    }

    await prisma.reviewImage.delete({
      where: { id },
    });

    return res.status(200).json({
      message: "Image deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

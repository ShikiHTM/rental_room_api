import prisma from "../prisma/client.js";

// GET ALL REVIEWS
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: true,
        room: true,
        images: true,
      },
    });

    return res.status(200).json(reviews);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// GET REVIEW BY ID
export const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        user: true,
        room: true,
        images: true,
      },
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    return res.status(200).json(review);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// CREATE REVIEW
export const createReview = async (req, res) => {
  try {
    const { rating, comment, userId, roomId } = req.body;

    // validate
    if (!rating || !userId || !roomId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be 1-5" });
    }

    const newReview = await prisma.review.create({
      data: {
        rating,
        comment,
        userId,
        roomId,
      },
    });

    return res.status(201).json(newReview);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// UPDATE REVIEW
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const existing = await prisma.review.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: "Rating must be 1-5" });
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        ...(rating && { rating }),
        ...(comment !== undefined && { comment }),
      },
    });

    return res.status(200).json(updatedReview);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// DELETE REVIEW
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.review.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Review not found" });
    }

    await prisma.review.delete({
      where: { id },
    });

    return res.status(200).json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

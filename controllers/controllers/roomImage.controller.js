import prisma from "../prisma/client.js";

// GET ALL ROOM IMAGES
export const getAllRoomImages = async (req, res) => {
  try {
    const images = await prisma.roomImage.findMany({
      include: {
        room: true,
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
export const getRoomImageById = async (req, res) => {
  try {
    const { id } = req.params;

    const image = await prisma.roomImage.findUnique({
      where: { id },
      include: {
        room: true,
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
export const createRoomImage = async (req, res) => {
  try {
    const { imageUrl, publicId, roomId } = req.body;

    // validate
    if (!imageUrl || !publicId || !roomId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newImage = await prisma.roomImage.create({
      data: {
        imageUrl,
        publicId,
        roomId,
      },
    });

    return res.status(201).json(newImage);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ message: "publicId already exists" });
    }

    return res.status(500).json({ error: error.message });
  }
};

// UPDATE IMAGE
export const updateRoomImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl, publicId } = req.body;

    const existing = await prisma.roomImage.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Image not found" });
    }

    const updatedImage = await prisma.roomImage.update({
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
export const deleteRoomImage = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.roomImage.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Image not found" });
    }

    await prisma.roomImage.delete({
      where: { id },
    });

    return res.status(200).json({
      message: "Room image deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

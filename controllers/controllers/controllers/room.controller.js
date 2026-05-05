import prisma from "../prisma/client.js";

// GET ALL ROOMS
export const getAllRooms = async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        images: true,
        host: true,
        bookings: true,
        reviews: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(rooms);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// GET ROOM BY ID
export const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        images: true,
        host: true,
        bookings: true,
        reviews: true,
      },
    });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    return res.status(200).json(room);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// CREATE ROOM
export const createRoom = async (req, res) => {
  try {
    const {
      title,
      description,
      address,
      city,
      pricePerNight,
      maxGuests,
      hostId,
    } = req.body;

    // validate
    if (!title || !address || !city || !pricePerNight || !maxGuests || !hostId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newRoom = await prisma.room.create({
      data: {
        title,
        description,
        address,
        city,
        pricePerNight,
        maxGuests,
        hostId,
      },
    });

    return res.status(201).json(newRoom);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// UPDATE ROOM
export const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      address,
      city,
      pricePerNight,
      maxGuests,
      status,
    } = req.body;

    const existing = await prisma.room.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Room not found" });
    }

    const updatedRoom = await prisma.room.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(address && { address }),
        ...(city && { city }),
        ...(pricePerNight && { pricePerNight }),
        ...(maxGuests && { maxGuests }),
        ...(status && { status }), // PENDING | APPROVED | REJECTED
      },
    });

    return res.status(200).json(updatedRoom);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// DELETE ROOM
export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.room.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Room not found" });
    }

    await prisma.room.delete({
      where: { id },
    });

    return res.status(200).json({
      message: "Room deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

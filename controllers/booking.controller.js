import prisma from "../prisma/client.js";

// GET ALL BOOKINGS
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: true,
        room: true,
        payments: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET BOOKING BY ID
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: true,
        room: true,
        payments: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// CREATE BOOKING
export const createBooking = async (req, res) => {
  try {
    const { checkInDate, checkOutDate, totalPrice, userId, roomId } = req.body;

    // validate cơ bản
    if (!checkInDate || !checkOutDate || !totalPrice || !userId || !roomId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const booking = await prisma.booking.create({
      data: {
        checkInDate: new Date(checkInDate),
        checkOutDate: new Date(checkOutDate),
        totalPrice,
        userId,
        roomId,
      },
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE BOOKING
export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkInDate, checkOutDate, totalPrice, status } = req.body;

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        ...(checkInDate && { checkInDate: new Date(checkInDate) }),
        ...(checkOutDate && { checkOutDate: new Date(checkOutDate) }),
        ...(totalPrice && { totalPrice }),
        ...(status && { status }), // PENDING | CONFIRMED | CANCELLED | COMPLETED
      },
    });

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE BOOKING
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.booking.delete({
      where: { id },
    });

    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

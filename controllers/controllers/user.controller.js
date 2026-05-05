import prisma from "../prisma/client.js";

// GET ALL USERS
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        rooms: true,
        bookings: true,
        reviews: true,
        payments: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// GET USER BY ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        rooms: true,
        bookings: true,
        reviews: true,
        payments: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// CREATE USER
export const createUser = async (req, res) => {
  try {
    const { email, password, fullName, phoneNumber, role } = req.body;

    // validate
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newUser = await prisma.user.create({
      data: {
        email,
        password,
        fullName,
        phoneNumber,
        role: role || "USER",
      },
    });

    return res.status(201).json(newUser);
  } catch (error) {
    // unique email / verifyToken
    if (error.code === "P2002") {
      return res.status(400).json({ message: "Email already exists" });
    }

    return res.status(500).json({ error: error.message });
  }
};

// UPDATE USER
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, fullName, phoneNumber, role } = req.body;

    const existing = await prisma.user.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(email && { email }),
        ...(password && { password }),
        ...(fullName && { fullName }),
        ...(phoneNumber !== undefined && { phoneNumber }),
        ...(role && { role }), // USER | HOST | ADMIN
      },
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ message: "Email already exists" });
    }

    return res.status(500).json({ error: error.message });
  }
};

// DELETE USER
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.user.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "User not found" });
    }

    await prisma.user.delete({
      where: { id },
    });

    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

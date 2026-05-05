import prisma from "../prisma/client.js";

// GET ALL TOKENS
export const getAllTokens = async (req, res) => {
  try {
    const tokens = await prisma.passwordResetTokens.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(tokens);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// GET TOKEN BY ID
export const getTokenById = async (req, res) => {
  try {
    const { id } = req.params;

    const token = await prisma.passwordResetTokens.findUnique({
      where: { id },
    });

    if (!token) {
      return res.status(404).json({ message: "Token not found" });
    }

    return res.status(200).json(token);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// CREATE TOKEN
export const createToken = async (req, res) => {
  try {
    const { userId, token, expiredAt } = req.body;

    // validate
    if (!userId || !token) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newToken = await prisma.passwordResetTokens.create({
      data: {
        userId,
        token,
        expiredAt: expiredAt ? new Date(expiredAt) : null,
      },
    });

    return res.status(201).json(newToken);
  } catch (error) {
    // handle unique constraint
    if (error.code === "P2002") {
      return res.status(400).json({ message: "Token already exists" });
    }

    return res.status(500).json({ error: error.message });
  }
};

// UPDATE TOKEN
export const updateToken = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, token, expiredAt } = req.body;

    // check tồn tại
    const existing = await prisma.passwordResetTokens.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Token not found" });
    }

    const updatedToken = await prisma.passwordResetTokens.update({
      where: { id },
      data: {
        ...(userId && { userId }),
        ...(token && { token }),
        ...(expiredAt && { expiredAt: new Date(expiredAt) }),
      },
    });

    return res.status(200).json(updatedToken);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ message: "Token already exists" });
    }

    return res.status(500).json({ error: error.message });
  }
};

// DELETE TOKEN
export const deleteToken = async (req, res) => {
  try {
    const { id } = req.params;

    // check tồn tại
    const existing = await prisma.passwordResetTokens.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Token not found" });
    }

    await prisma.passwordResetTokens.delete({
      where: { id },
    });

    return res.status(200).json({
      message: "Token deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

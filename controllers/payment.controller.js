import prisma from "../prisma/client.js";

// GET ALL PAYMENTS
export const getAllPayments = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        booking: true,
        user: {
          select: {
            id: true,
            // Bạn có thể thêm email, name... tuỳ schema của User, nhưng KHÔNG để password ở đây
            // email: true, 
            // name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(payments);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// GET PAYMENT BY ID
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        booking: true,
        user: {
          select: {
            id: true,
            // email: true,
          },
        },
      },
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    return res.status(200).json(payment);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// CREATE PAYMENT
export const createPayment = async (req, res) => {
  try {
    const { method, amount, bookingId, userId, transactionId } = req.body;

    // validate cơ bản
    if (!method || !amount || !bookingId || !userId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newPayment = await prisma.payment.create({
      data: {
        method, // CASH | BANK_TRANSFER | ONLINE
        amount,
        bookingId,
        userId,
        transactionId: transactionId || null,
      },
    });

    return res.status(201).json(newPayment);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// UPDATE PAYMENT
export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { method, status, amount, transactionId } = req.body;

    // check tồn tại
    const existing = await prisma.payment.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        ...(method && { method }),
        ...(status && { status }), // PENDING | COMPLETED | FAILED | CANCELLED
        ...(amount && { amount }),
        ...(transactionId !== undefined && { transactionId }),
      },
    });

    return res.status(200).json(updatedPayment);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// DELETE PAYMENT
export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.payment.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Payment not found" });
    }

    await prisma.payment.delete({
      where: { id },
    });

    return res.status(200).json({
      message: "Payment deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

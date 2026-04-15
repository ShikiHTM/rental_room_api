import { type Request, type Response } from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import db from '../Database/Utils/db.js';
import { authConfig } from "../config/auth.config.js";

export const register = async(req: Request, res: Response): Promise<any> => {
    try {
        const { email, password, fullName, phoneNumber } = req.body;

        if(!email || !password || !fullName || email.trim() === '' || password.trim() == '') {
            return res.status(400).json({message: 'Missing or empty required fields.'})
        }       

        // Check if email is already exists
        const existingUser = await db.user.findUnique({ where: {email} });

        if(existingUser) {
            return res.status(400).json({message: "Email has been used."});
        }

        // Hash password (salt = 10)
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = await db.user.create({
            data: {
                email: email,
                passwordHash: passwordHash,
                fullName: fullName,
                phoneNumber: phoneNumber,
            }
        });

        res.status(201).json({ message: "Register sucessfully!", userId: newUser.id })
    }catch(error) {
        console.error(error);
        res.status(500).json({ message: "Unexpected Error." });
    }
};

export const login = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, password } = req.body;

        if(!email || !password || email.trim() === '' || password.trim() == '') {
            return res.status(400).json({message: 'Missing or empty required fields.'})
        }       

        // Find user
        const user = await db.user.findUnique({ where: {email} });
        if(!user) {
            return res.status(400).json({ message: "Invalid username or password."});
        }

        // Password comparation
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if(!isMatch) {
            return res.status(400).json({ message: "Invalid username or password."});
        }

        // Token creation
        const token = jwt.sign(
            {userId: user.id, role: user.role },
            authConfig.JWTSecret,
            { expiresIn: authConfig.expiresIn }
        )

        res.status(200).json({
            message: 'Login Successfully.',
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role
            }
        });
    }catch(error) {
        console.error(error);
        res.status(500).json({message: "Unexpected Error."})
    }
}
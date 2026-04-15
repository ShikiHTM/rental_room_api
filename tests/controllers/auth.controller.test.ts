import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcrypt';
import {app} from '../../index.js'
import db from '../../Database/Utils/db.js'

// Làm giả kết nối Database
vi.mock('../../src/utils/db.js', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe('Auth Controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should return 400 if email is already in use', async () => {
      // Giả lập DB trả về một user (nghĩa là email đã tồn tại)
      (db.user.findUnique as any).mockResolvedValue({ id: '1' });

      const res = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Email is already in use');
      expect(db.user.create).not.toHaveBeenCalled(); // Đảm bảo không gọi hàm tạo
    });

    it('should register successfully and return 201', async () => {
      // Giả lập email chưa tồn tại
      vi.mocked(db.user.findUnique).mockResolvedValue(null);
      // Giả lập DB tạo user thành công
      (db.user.create as any).mockResolvedValue({ id: 'new-user-123' });

      const res = await request(app).post('/api/auth/register').send({
        email: 'new@example.com',
        password: 'password123',
        fullName: 'New User',
      });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Registration successful');
      expect(res.body.userId).toBe('new-user-123');
      expect(db.user.create).toHaveBeenCalled(); // Phải gọi hàm lưu vào DB
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return 400 if user does not exist', async () => {
      // Giả lập DB không tìm thấy email
      vi.mocked(db.user.findUnique).mockResolvedValue(null);

      const res = await request(app).post('/api/auth/login').send({
        email: 'notfound@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid email or password');
    });

    it('should return 400 if password does not match', async () => {
      // 1. Tạo một mật khẩu thật đã mã hóa cho DB giả
      const hashedPass = await bcrypt.hash('realPassword', 10);
      
      vi.mocked(db.user.findUnique).mockResolvedValue({
        id: '123',
        email: 'test@example.com',
        passwordHash: hashedPass,
      } as any);

      // 2. Gửi request với mật khẩu sai
      const res = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'wrongPassword',
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid email or password');
    });

    it('should return 200 and a token if login is successful', async () => {
      const hashedPass = await bcrypt.hash('correctPassword', 10);
      
      vi.mocked(db.user.findUnique).mockResolvedValue({
        id: '123',
        email: 'test@example.com',
        passwordHash: hashedPass,
        fullName: 'Test User',
        role: 'USER'
      } as any);

      const res = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'correctPassword',
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Login successful');
      expect(res.body).toHaveProperty('token'); // Xác nhận có trả về token
      expect(res.body.user.email).toBe('test@example.com');
    });
  });
});
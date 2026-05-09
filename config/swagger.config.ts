import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'QuanLyDatThuePhong API',
            version: '1.0.0',
            description: 'API quản lý đặt thuê phòng',
        },
        servers: [{ url: '/api/v1' }],
        components: {
            securitySchemes: {
                cookieAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'token',
                },
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                    },
                },
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        email: { type: 'string', format: 'email' },
                        fullName: { type: 'string' },
                        phoneNumber: { type: 'string', nullable: true },
                        role: { type: 'string', enum: ['USER', 'HOST', 'ADMIN'] },
                        verifiedAt: { type: 'string', format: 'date-time', nullable: true },
                        bannedAt: { type: 'string', format: 'date-time', nullable: true },
                        banReason: { type: 'string', nullable: true },
                        banExpiresAt: { type: 'string', format: 'date-time', nullable: true },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Room: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        title: { type: 'string' },
                        description: { type: 'string', nullable: true },
                        address: { type: 'string' },
                        city: { type: 'string' },
                        pricePerNight: { type: 'number' },
                        maxGuests: { type: 'integer' },
                        status: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] },
                        hostId: { type: 'string', format: 'uuid' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Booking: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        checkInDate: { type: 'string', format: 'date-time' },
                        checkOutDate: { type: 'string', format: 'date-time' },
                        totalPrice: { type: 'number' },
                        status: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'] },
                        userId: { type: 'string', format: 'uuid' },
                        roomId: { type: 'string', format: 'uuid' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Review: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        rating: { type: 'integer', minimum: 1, maximum: 5 },
                        comment: { type: 'string', nullable: true },
                        userId: { type: 'string', format: 'uuid' },
                        roomId: { type: 'string', format: 'uuid' },
                        bookingId: { type: 'string', format: 'uuid' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
            },
        },
        paths: {
            // ─── Auth ────────────────────────────────────────────────────────
            '/auth/register': {
                post: {
                    tags: ['Auth'],
                    summary: 'Đăng ký tài khoản',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['email', 'password', 'fullName'],
                                    properties: {
                                        email: { type: 'string', format: 'email' },
                                        password: { type: 'string' },
                                        fullName: { type: 'string' },
                                        phoneNumber: { type: 'string' },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        201: { description: 'Đăng ký thành công, trả về JWT cookie' },
                        400: { description: 'Email đã tồn tại hoặc dữ liệu không hợp lệ' },
                    },
                },
            },
            '/auth/login': {
                post: {
                    tags: ['Auth'],
                    summary: 'Đăng nhập',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['email', 'password'],
                                    properties: {
                                        email: { type: 'string', format: 'email' },
                                        password: { type: 'string' },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: { description: 'Đăng nhập thành công, set JWT cookie' },
                        400: { description: 'Sai email hoặc mật khẩu' },
                    },
                },
            },
            '/auth/logout': {
                post: {
                    tags: ['Auth'],
                    summary: 'Đăng xuất',
                    security: [{ cookieAuth: [] }],
                    responses: {
                        200: { description: 'Đăng xuất thành công' },
                    },
                },
            },
            '/auth/verify': {
                get: {
                    tags: ['Auth'],
                    summary: 'Xác thực email',
                    parameters: [{ in: 'query', name: 'token', required: true, schema: { type: 'string' } }],
                    responses: {
                        200: { description: 'Xác thực thành công' },
                        400: { description: 'Token không hợp lệ hoặc đã hết hạn' },
                    },
                },
            },
            '/auth/forgot-password': {
                post: {
                    tags: ['Auth'],
                    summary: 'Yêu cầu reset mật khẩu',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['email'],
                                    properties: { email: { type: 'string', format: 'email' } },
                                },
                            },
                        },
                    },
                    responses: { 200: { description: 'Gửi email reset nếu email tồn tại trong hệ thống' } },
                },
            },
            '/auth/reset-password': {
                post: {
                    tags: ['Auth'],
                    summary: 'Đặt lại mật khẩu',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['token', 'password'],
                                    properties: {
                                        token: { type: 'string' },
                                        password: { type: 'string' },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: { description: 'Đặt lại mật khẩu thành công' },
                        400: { description: 'Token không hợp lệ hoặc đã hết hạn' },
                    },
                },
            },

            // ─── Users ───────────────────────────────────────────────────────
            '/users': {
                get: {
                    tags: ['Users'],
                    summary: 'Lấy thông tin bản thân',
                    security: [{ cookieAuth: [] }],
                    responses: {
                        200: { description: 'Thông tin user hiện tại', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
                        401: { description: 'Chưa đăng nhập' },
                    },
                },
                patch: {
                    tags: ['Users'],
                    summary: 'Cập nhật thông tin bản thân',
                    security: [{ cookieAuth: [] }],
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        fullName: { type: 'string' },
                                        phoneNumber: { type: 'string' },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: { description: 'Cập nhật thành công' },
                        401: { description: 'Chưa đăng nhập' },
                    },
                },
            },
            '/users/reviews': {
                get: {
                    tags: ['Users'],
                    summary: 'Lấy danh sách review của bản thân',
                    security: [{ cookieAuth: [] }],
                    responses: {
                        200: { description: 'Danh sách review' },
                        401: { description: 'Chưa đăng nhập' },
                    },
                },
            },

            // ─── Rooms ───────────────────────────────────────────────────────
            '/rooms/search': {
                get: {
                    tags: ['Rooms'],
                    summary: 'Tìm kiếm phòng (Meilisearch)',
                    parameters: [
                        { in: 'query', name: 'q', schema: { type: 'string' }, description: 'Từ khóa tìm kiếm' },
                        { in: 'query', name: 'city', schema: { type: 'string' }, description: 'Lọc theo thành phố' },
                        { in: 'query', name: 'minPrice', schema: { type: 'number' }, description: 'Giá tối thiểu' },
                        { in: 'query', name: 'maxPrice', schema: { type: 'number' }, description: 'Giá tối đa' },
                        { in: 'query', name: 'maxGuests', schema: { type: 'integer' }, description: 'Số khách tối đa' },
                    ],
                    responses: {
                        200: { description: 'Kết quả tìm kiếm phòng', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Room' } } } } },
                    },
                },
            },
            '/rooms': {
                get: {
                    tags: ['Rooms'],
                    summary: 'Lấy danh sách phòng (chỉ APPROVED, admin thấy tất cả)',
                    responses: {
                        200: { description: 'Danh sách phòng', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Room' } } } } },
                    },
                },
            },
            '/rooms/{id}': {
                get: {
                    tags: ['Rooms'],
                    summary: 'Lấy chi tiết một phòng',
                    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
                    responses: {
                        200: { description: 'Chi tiết phòng' },
                        404: { description: 'Không tìm thấy phòng' },
                    },
                },
                put: {
                    tags: ['Rooms'],
                    summary: 'Cập nhật phòng (chủ phòng hoặc admin)',
                    security: [{ cookieAuth: [] }],
                    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        title: { type: 'string' },
                                        description: { type: 'string' },
                                        address: { type: 'string' },
                                        city: { type: 'string' },
                                        pricePerNight: { type: 'number' },
                                        maxGuests: { type: 'integer' },
                                        images: { type: 'array', items: { type: 'string' }, description: 'Base64 hoặc URL ảnh' },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: { description: 'Cập nhật thành công' },
                        403: { description: 'Không có quyền' },
                        404: { description: 'Không tìm thấy phòng' },
                    },
                },
                delete: {
                    tags: ['Rooms'],
                    summary: 'Xóa phòng (chủ phòng hoặc admin)',
                    security: [{ cookieAuth: [] }],
                    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
                    responses: {
                        200: { description: 'Xóa thành công' },
                        403: { description: 'Không có quyền' },
                        404: { description: 'Không tìm thấy phòng' },
                    },
                },
            },
            '/rooms/apply': {
                post: {
                    tags: ['Rooms'],
                    summary: 'Đăng ký trở thành host (tạo phòng đầu tiên)',
                    security: [{ cookieAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['title', 'address', 'city', 'pricePerNight', 'maxGuests'],
                                    properties: {
                                        title: { type: 'string' },
                                        description: { type: 'string' },
                                        address: { type: 'string' },
                                        city: { type: 'string' },
                                        pricePerNight: { type: 'number' },
                                        maxGuests: { type: 'integer' },
                                        images: { type: 'array', items: { type: 'string' } },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        201: { description: 'Gửi đơn thành công, chờ admin duyệt' },
                        400: { description: 'User đã là Host' },
                    },
                },
            },
            '/rooms/create': {
                post: {
                    tags: ['Rooms'],
                    summary: 'Tạo phòng mới (Host/Admin)',
                    security: [{ cookieAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['title', 'address', 'city', 'pricePerNight', 'maxGuests'],
                                    properties: {
                                        title: { type: 'string' },
                                        description: { type: 'string' },
                                        address: { type: 'string' },
                                        city: { type: 'string' },
                                        pricePerNight: { type: 'number' },
                                        maxGuests: { type: 'integer' },
                                        images: { type: 'array', items: { type: 'string' } },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        201: { description: 'Tạo phòng thành công, chờ admin duyệt' },
                        403: { description: 'Không phải Host hoặc Admin' },
                    },
                },
            },

            // ─── Bookings ────────────────────────────────────────────────────
            '/bookings': {
                post: {
                    tags: ['Bookings'],
                    summary: 'Tạo booking',
                    security: [{ cookieAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['roomId', 'checkIn', 'checkOut'],
                                    properties: {
                                        roomId: { type: 'string', format: 'uuid' },
                                        checkIn: { type: 'string', format: 'date-time' },
                                        checkOut: { type: 'string', format: 'date-time' },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        201: { description: 'Booking tạo thành công' },
                        400: { description: 'Ngày không hợp lệ hoặc phòng đã được đặt' },
                        404: { description: 'Không tìm thấy phòng' },
                    },
                },
                get: {
                    tags: ['Bookings'],
                    summary: 'Lấy danh sách booking của bản thân',
                    security: [{ cookieAuth: [] }],
                    responses: {
                        200: { description: 'Danh sách booking' },
                    },
                },
            },
            '/bookings/{id}/cancel': {
                patch: {
                    tags: ['Bookings'],
                    summary: 'Hủy booking (chỉ PENDING)',
                    security: [{ cookieAuth: [] }],
                    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
                    responses: {
                        200: { description: 'Hủy thành công' },
                        400: { description: 'Booking không ở trạng thái PENDING' },
                        403: { description: 'Không phải booking của bạn' },
                    },
                },
            },
            '/bookings/{id}/status': {
                patch: {
                    tags: ['Bookings'],
                    summary: 'Cập nhật trạng thái booking (Host/Admin)',
                    security: [{ cookieAuth: [] }],
                    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['status'],
                                    properties: {
                                        status: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'] },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: { description: 'Cập nhật thành công' },
                        400: { description: 'Status không hợp lệ' },
                        403: { description: 'Không có quyền' },
                        404: { description: 'Không tìm thấy booking' },
                    },
                },
            },

            // ─── Reviews ─────────────────────────────────────────────────────
            '/reviews/{roomId}': {
                get: {
                    tags: ['Reviews'],
                    summary: 'Lấy review theo phòng (public)',
                    parameters: [{ in: 'path', name: 'roomId', required: true, schema: { type: 'string', format: 'uuid' } }],
                    responses: {
                        200: { description: 'Danh sách review của phòng' },
                    },
                },
            },
            '/reviews': {
                post: {
                    tags: ['Reviews'],
                    summary: 'Tạo review (phải có booking COMPLETED)',
                    security: [{ cookieAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['rating', 'roomId', 'bookingId'],
                                    properties: {
                                        rating: { type: 'integer', minimum: 1, maximum: 5 },
                                        comment: { type: 'string', nullable: true },
                                        roomId: { type: 'string', format: 'uuid' },
                                        bookingId: { type: 'string', format: 'uuid' },
                                        images: { type: 'array', items: { type: 'string' } },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: { description: 'Tạo review thành công' },
                        400: { description: 'Booking chưa hoàn thành hoặc không khớp phòng' },
                        403: { description: 'Booking không thuộc về bạn' },
                    },
                },
            },
            '/reviews/{reviewId}': {
                put: {
                    tags: ['Reviews'],
                    summary: 'Cập nhật review (chủ review hoặc admin)',
                    security: [{ cookieAuth: [] }],
                    parameters: [{ in: 'path', name: 'reviewId', required: true, schema: { type: 'string', format: 'uuid' } }],
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        rating: { type: 'integer', minimum: 1, maximum: 5 },
                                        comment: { type: 'string', nullable: true },
                                        images: { type: 'array', items: { type: 'string' } },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: { description: 'Cập nhật thành công' },
                        403: { description: 'Không có quyền' },
                        404: { description: 'Không tìm thấy review' },
                    },
                },
                delete: {
                    tags: ['Reviews'],
                    summary: 'Xóa review (chủ review hoặc admin)',
                    security: [{ cookieAuth: [] }],
                    parameters: [{ in: 'path', name: 'reviewId', required: true, schema: { type: 'string', format: 'uuid' } }],
                    responses: {
                        200: { description: 'Xóa thành công' },
                        403: { description: 'Không có quyền' },
                        404: { description: 'Không tìm thấy review' },
                    },
                },
            },

            // ─── Admin ───────────────────────────────────────────────────────
            '/admin/rooms': {
                get: {
                    tags: ['Admin'],
                    summary: 'Lấy tất cả phòng kể cả PENDING/REJECTED',
                    security: [{ cookieAuth: [] }],
                    responses: { 200: { description: 'Danh sách phòng' } },
                },
            },
            '/admin/rooms/{id}': {
                get: {
                    tags: ['Admin'],
                    summary: 'Lấy chi tiết phòng bất kỳ',
                    security: [{ cookieAuth: [] }],
                    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
                    responses: { 200: { description: 'Chi tiết phòng' }, 404: { description: 'Không tìm thấy' } },
                },
                delete: {
                    tags: ['Admin'],
                    summary: 'Xóa phòng',
                    security: [{ cookieAuth: [] }],
                    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
                    responses: { 200: { description: 'Xóa thành công' }, 404: { description: 'Không tìm thấy' } },
                },
            },
            '/admin/rooms/{roomId}/approve': {
                patch: {
                    tags: ['Admin'],
                    summary: 'Duyệt phòng (tự động upgrade host lên role HOST)',
                    security: [{ cookieAuth: [] }],
                    parameters: [{ in: 'path', name: 'roomId', required: true, schema: { type: 'string', format: 'uuid' } }],
                    responses: { 200: { description: 'Duyệt thành công' }, 404: { description: 'Không tìm thấy' } },
                },
            },
            '/admin/rooms/{roomId}/reject': {
                patch: {
                    tags: ['Admin'],
                    summary: 'Từ chối phòng',
                    security: [{ cookieAuth: [] }],
                    parameters: [{ in: 'path', name: 'roomId', required: true, schema: { type: 'string', format: 'uuid' } }],
                    responses: { 200: { description: 'Từ chối thành công' }, 404: { description: 'Không tìm thấy' } },
                },
            },
            '/admin/users': {
                get: {
                    tags: ['Admin'],
                    summary: 'Lấy danh sách tất cả user',
                    security: [{ cookieAuth: [] }],
                    responses: { 200: { description: 'Danh sách user' } },
                },
            },
            '/admin/users/{id}/ban': {
                patch: {
                    tags: ['Admin'],
                    summary: 'Ban user',
                    security: [{ cookieAuth: [] }],
                    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        banReason: { type: 'string', default: 'No reason' },
                                        banExpiresAt: { type: 'string', format: 'date-time', nullable: true },
                                    },
                                },
                            },
                        },
                    },
                    responses: { 200: { description: 'Ban thành công' }, 404: { description: 'Không tìm thấy user' } },
                },
            },
            '/admin/users/{id}/unban': {
                patch: {
                    tags: ['Admin'],
                    summary: 'Unban user',
                    security: [{ cookieAuth: [] }],
                    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
                    responses: {
                        200: { description: 'Unban thành công' },
                        400: { description: 'User không bị ban' },
                        404: { description: 'Không tìm thấy user' },
                    },
                },
            },
            '/admin/bookings': {
                get: {
                    tags: ['Admin'],
                    summary: 'Lấy tất cả booking trong hệ thống',
                    security: [{ cookieAuth: [] }],
                    responses: { 200: { description: 'Danh sách booking' } },
                },
            },
            '/admin/bookings/search': {
                get: {
                    tags: ['Admin'],
                    summary: 'Tìm kiếm booking (Meilisearch)',
                    security: [{ cookieAuth: [] }],
                    parameters: [
                        { in: 'query', name: 'q', schema: { type: 'string' }, description: 'Từ khóa tìm kiếm' },
                        { in: 'query', name: 'status', schema: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'] }, description: 'Lọc theo trạng thái' },
                        { in: 'query', name: 'userId', schema: { type: 'string', format: 'uuid' }, description: 'Lọc theo user' },
                        { in: 'query', name: 'roomId', schema: { type: 'string', format: 'uuid' }, description: 'Lọc theo phòng' },
                    ],
                    responses: {
                        200: { description: 'Kết quả tìm kiếm booking' },
                    },
                },
            },
            '/admin/bookings/{id}/status': {
                patch: {
                    tags: ['Admin'],
                    summary: 'Cập nhật trạng thái booking',
                    security: [{ cookieAuth: [] }],
                    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['status'],
                                    properties: {
                                        status: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'] },
                                    },
                                },
                            },
                        },
                    },
                    responses: { 200: { description: 'Cập nhật thành công' } },
                },
            },
        },
    },
    apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);

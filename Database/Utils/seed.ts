import db from "./db.js";

async function main() {
  const hostId = ""; // <-- THAY ID CỦA BẠN VÀO ĐÂY

  const rooms = [
    {
      title: "Luxury Ocean View Studio",
      description: "Căn hộ view biển cực đẹp tại Mỹ Khê, đầy đủ tiện nghi.",
      address: "123 Võ Nguyên Giáp",
      city: "Da Nang",
      pricePerNight: 1500000,
      maxGuests: 2,
      status: "APPROVED",
      images: ["https://res.cloudinary.com/demo/image/upload/v1/sample.jpg"]
    },
    {
      title: "Cozy Garden House",
      description: "Không gian xanh yên tĩnh giữa lòng Hà Nội.",
      address: "45 Ngõ Tạm Thương",
      city: "Hanoi",
      pricePerNight: 850000,
      maxGuests: 3,
      status: "APPROVED",
      images: ["https://res.cloudinary.com/demo/image/upload/v2/sample.jpg"]
    },
    {
      title: "Modern Minimalist Apartment",
      description: "Phong cách tối giản cho dân làm việc từ xa.",
      address: "Lê Văn Lương, Q.7",
      city: "Ho Chi Minh",
      pricePerNight: 1200000,
      maxGuests: 2,
      status: "PENDING",
      images: []
    },
    {
      title: "Vintage Da Lat Villa",
      description: "Biệt thự cổ điển ngắm sương mù mỗi sáng.",
      address: "Trần Hưng Đạo, P.10",
      city: "Da Lat",
      pricePerNight: 2500000,
      maxGuests: 6,
      status: "APPROVED",
      images: []
    },
    {
      title: "Penthouse Riverside",
      description: "Đẳng cấp thượng lưu view sông Sài Gòn.",
      address: "Tôn Đức Thắng, Q.1",
      city: "Ho Chi Minh",
      pricePerNight: 5000000,
      maxGuests: 4,
      status: "PENDING",
      images: []
    },
    {
      title: "Sunny Beachfront Bungalow",
      description: "Cách biển chỉ vài bước chân.",
      address: "Hàm Tiến",
      city: "Phan Thiet",
      pricePerNight: 1800000,
      maxGuests: 2,
      status: "APPROVED",
      images: []
    },
    {
      title: "Old Quarter Homestay",
      description: "Trải nghiệm văn hóa phố cổ ngàn năm văn hiến.",
      address: "Hàng Bè",
      city: "Hanoi",
      pricePerNight: 700000,
      maxGuests: 2,
      status: "APPROVED",
      images: []
    },
    {
      title: "Mountain Retreat Cabin",
      description: "Yên tĩnh tuyệt đối để 'đi trốn' khỏi thành phố.",
      address: "Thung lũng Mường Hoa",
      city: "Sapa",
      pricePerNight: 1100000,
      maxGuests: 2,
      status: "PENDING",
      images: []
    },
    {
      title: "Artist Loft - District 3",
      description: "Dành cho những tâm hồn nghệ thuật.",
      address: "Võ Văn Tần",
      city: "Ho Chi Minh",
      pricePerNight: 950000,
      maxGuests: 2,
      status: "APPROVED",
      images: []
    },
    {
      title: "Heritage House Hoi An",
      description: "Nhà cổ ngay trung tâm phố Hội.",
      address: "Nguyễn Thái Học",
      city: "Hoi An",
      pricePerNight: 1300000,
      maxGuests: 4,
      status: "APPROVED",
      images: []
    }
  ];

  for (const room of rooms) {
    await db.room.create({
      data: {
        ...room as any,
        hostId: hostId
      }
    });
  }
  console.log('10 room entried!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
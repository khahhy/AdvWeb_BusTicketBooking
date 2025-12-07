import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Paste danh sach JSON cac locations toi da gui vao day
  const rawLocations = [
    {
      name: 'Ben xe Mien Dong',
      city: 'Ho Chi Minh',
      address: '292 Dinh Bo Linh, Phuong 26, Quan Binh Thanh',
      lat: 10.811364,
      lng: 106.712173,
    },
    {
      name: 'Ben xe Mien Tay',
      city: 'Ho Chi Minh',
      address: '395 Kinh Duong Vuong, Phuong An Lac, Quan Binh Tan',
      lat: 10.742468,
      lng: 106.613624,
    },
    {
      name: 'Van phong Phuong Trang - Le Hong Phong',
      city: 'Ho Chi Minh',
      address: '233 Le Hong Phong, Phuong 4, Quan 5',
      lat: 10.765412,
      lng: 106.678235,
    },
    {
      name: 'Ben xe My Dinh',
      city: 'Ha Noi',
      address: '20 Pham Hung, My Dinh, Quan Nam Tu Liem',
      lat: 21.028441,
      lng: 105.778083,
    },
    {
      name: 'Ben xe Giap Bat',
      city: 'Ha Noi',
      address: 'Giai Phong, Giap Bat, Quan Hoang Mai',
      lat: 20.983023,
      lng: 105.843075,
    },
    {
      name: 'Ben xe Nuoc Ngam',
      city: 'Ha Noi',
      address: 'Ngoc Hoi, Phuong Hoang Liet, Quan Hoang Mai',
      lat: 20.963471,
      lng: 105.843372,
    },
    {
      name: 'Ben xe Trung tam Da Nang',
      city: 'Da Nang',
      address: '185 Ton Duc Thang, Phuong Hoa Minh, Quan Lien Chieu',
      lat: 16.050309,
      lng: 108.171358,
    },
    {
      name: 'Ben xe Lien tinh Da Lat',
      city: 'Lam Dong',
      address: '01 To Hien Thanh, Phuong 3, Thanh pho Da Lat',
      lat: 11.927643,
      lng: 108.445213,
    },
    {
      name: 'Ben xe Trung tam TP. Can Tho',
      city: 'Can Tho',
      address: 'Khu Do Thi Nam Can Tho, QL1A, Quan Cai Rang',
      lat: 10.007612,
      lng: 105.728945,
    },
    {
      name: 'Ben xe Phia Bac Nha Trang',
      city: 'Khanh Hoa',
      address: 'So 1, Duong 2/4, Phuong Vinh Hoa, TP. Nha Trang',
      lat: 12.285834,
      lng: 109.196521,
    },
    {
      name: 'Ben xe An Suong',
      city: 'Ho Chi Minh',
      address: 'QL22, Ba Diem, Huyen Hoc Mon',
      lat: 10.844789,
      lng: 106.612128,
    },
    {
      name: 'Ben xe Gia Lam',
      city: 'Ha Noi',
      address: '9 Ngo Gia Kham, Quan Long Bien',
      lat: 21.049635,
      lng: 105.882371,
    },
    {
      name: 'Ben xe Yen Nghia',
      city: 'Ha Noi',
      address: 'QL6, Phu Lam, Quan Ha Dong',
      lat: 20.948256,
      lng: 105.753361,
    },
    {
      name: 'Ben xe Vinh Niem',
      city: 'Hai Phong',
      address: 'Duong Bui Vien, Phuong Vinh Niem, Quan Le Chan',
      lat: 20.843657,
      lng: 106.669834,
    },
    {
      name: 'Ben xe Phia Nam Hue',
      city: 'Thua Thien Hue',
      address: '97 An Duong Vuong, Phuong An Dong, TP. Hue',
      lat: 16.449678,
      lng: 107.600812,
    },
    {
      name: 'Ben xe Quy Nhon',
      city: 'Binh Dinh',
      address: '71 Tay Son, Phuong Ghenh Rang, TP. Quy Nhon',
      lat: 13.763421,
      lng: 109.217845,
    },
    {
      name: 'Ben xe Phia Nam Buon Ma Thuot',
      city: 'Dak Lak',
      address: 'Vo Van Kiet, Phuong Khanh Xuan, TP. Buon Ma Thuot',
      lat: 12.645732,
      lng: 108.012589,
    },
    {
      name: 'Ben xe Vung Tau',
      city: 'Ba Ria - Vung Tau',
      address: '192 Nam Ky Khoi Nghia, Phuong 3, TP. Vung Tau',
      lat: 10.358245,
      lng: 107.085967,
    },
    {
      name: 'Ben xe Ca Mau',
      city: 'Ca Mau',
      address: 'QL1A, Ly Thuong Kiet, Phuong 6, TP. Ca Mau',
      lat: 9.186834,
      lng: 105.143256,
    },
    {
      name: 'Ben xe Bai Chay',
      city: 'Quang Ninh',
      address: 'So 17 Duong 279, Phuong Bai Chay, TP. Ha Long',
      lat: 20.963162,
      lng: 107.042531,
    },
    {
      name: 'Ben xe Khach Sapa',
      city: 'Lao Cai',
      address: '573 Duong Dien Bien Phu, Thi xa Sapa',
      lat: 22.342139,
      lng: 103.849206,
    },
    {
      name: 'Ben xe Bac Vinh',
      city: 'Nghe An',
      address: 'Xom 1, Xa Nghi Kim, TP. Vinh',
      lat: 18.726591,
      lng: 105.658234,
    },
    {
      name: 'Ben xe Binh Thuan (Phan Thiet)',
      city: 'Binh Thuan',
      address: '01 Tu Van Tu, Phuong Phu Trinh, TP. Phan Thiet',
      lat: 10.936647,
      lng: 108.103986,
    },
    {
      name: 'Ben xe Rach Gia',
      city: 'Kien Giang',
      address: '260A Nguyen Binh Khiem, Phuong Vinh Quang, TP. Rach Gia',
      lat: 10.026417,
      lng: 105.080516,
    },
    {
      name: 'Ben xe Chau Doc',
      city: 'An Giang',
      address: 'QL91, Phuong Vinh My, TP. Chau Doc',
      lat: 10.686523,
      lng: 105.091245,
    },
    {
      name: 'Ben xe Phia Bac Thanh Hoa',
      city: 'Thanh Hoa',
      address: 'Duong Ba Trieu, Phuong Nam Ngan, TP. Thanh Hoa',
      lat: 19.824589,
      lng: 105.776512,
    },
    {
      name: 'Ben xe Dong Hoi',
      city: 'Quang Binh',
      address: 'Duong Tran Hung Dao, Phuong Duc Ninh Dong, TP. Dong Hoi',
      lat: 17.464523,
      lng: 106.602514,
    },
    {
      name: 'Ben xe Tay Ninh',
      city: 'Tay Ninh',
      address: '136 Trung Nu Vuong, Khu pho 1, Phuong 2, TP. Tay Ninh',
      lat: 11.314589,
      lng: 106.096523,
    },
    {
      name: 'Ben xe Trung tam Thai Nguyen',
      city: 'Thai Nguyen',
      address: 'Ngo 398 Thong Nhat, Phuong Dong Quang, TP. Thai Nguyen',
      lat: 21.574612,
      lng: 105.836512,
    },
  ];

  console.log(`Start seeding ${rawLocations.length} locations...`);

  // 2. Transform du lieu de khop voi Schema (lat -> latitude, lng -> longitude)
  const dataToInsert = rawLocations.map((loc) => ({
    name: loc.name,
    city: loc.city,
    address: loc.address,
    latitude: loc.lat,
    longitude: loc.lng,
  }));

  // 3. Insert vao Database
  await prisma.locations.createMany({
    data: dataToInsert,
    skipDuplicates: true,
  });

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 초기 데이터 시딩을 시작합니다...');

  // 기존 데이터 삭제
  await prisma.repairJob.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.workshop.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();

  console.log('✅ 기존 데이터 삭제 완료');

  // 역할 생성
  const adminRole = await prisma.role.create({
    data: {
      name: 'admin',
      description: '시스템 관리자',
    },
  });

  const workshopManagerRole = await prisma.role.create({
    data: {
      name: 'workshop_manager',
      description: '정비소 관리자',
    },
  });

  const mechanicRole = await prisma.role.create({
    data: {
      name: 'mechanic',
      description: '정비사',
    },
  });

  const customerRole = await prisma.role.create({
    data: {
      name: 'customer',
      description: '고객',
    },
  });

  const driverRole = await prisma.role.create({
    data: {
      name: 'driver',
      description: '탁송 기사',
    },
  });

  console.log('✅ 역할 생성 완료');

  // 관리자 사용자 생성
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@cargoro.com',
      password: adminPassword,
      name: '시스템 관리자',
      phone: '010-1234-5678',
      roleId: adminRole.id,
    },
  });

  // 정비소 관리자 생성
  const managerPassword = await bcrypt.hash('manager123', 10);
  const workshopManager = await prisma.user.create({
    data: {
      email: 'manager@cargoro.com',
      password: managerPassword,
      name: '정비소 관리자',
      phone: '010-2345-6789',
      roleId: workshopManagerRole.id,
    },
  });

  // 정비사 생성
  const mechanicPassword = await bcrypt.hash('mechanic123', 10);
  const mechanic = await prisma.user.create({
    data: {
      email: 'mechanic@cargoro.com',
      password: mechanicPassword,
      name: '김정비',
      phone: '010-3456-7890',
      roleId: mechanicRole.id,
    },
  });

  // 고객 생성
  const customerPassword = await bcrypt.hash('customer123', 10);
  const customer = await prisma.user.create({
    data: {
      email: 'customer@example.com',
      password: customerPassword,
      name: '홍길동',
      phone: '010-4567-8901',
      roleId: customerRole.id,
    },
  });

  // 탁송 기사 생성
  const driverPassword = await bcrypt.hash('driver123', 10);
  const driver = await prisma.user.create({
    data: {
      email: 'driver@cargoro.com',
      password: driverPassword,
      name: '이탁송',
      phone: '010-5678-9012',
      roleId: driverRole.id,
    },
  });

  console.log('✅ 사용자 생성 완료');

  // 정비소 생성
  const workshop1 = await prisma.workshop.create({
    data: {
      name: '카고로 강남점',
      address: '서울 강남구 테헤란로 123',
      phone: '02-123-4567',
      managerId: workshopManager.id,
      latitude: 37.5047,
      longitude: 127.0494,
      openingHours: '09:00-18:00',
      description: '최첨단 시설을 갖춘 카고로 강남 지점입니다.',
      isActive: true,
    },
  });

  const workshop2 = await prisma.workshop.create({
    data: {
      name: '카고로 종로점',
      address: '서울 종로구 종로 1길 30',
      phone: '02-345-6789',
      managerId: workshopManager.id,
      latitude: 37.5701,
      longitude: 126.992,
      openingHours: '09:00-18:00',
      description: '정비 전문가들이 모인 카고로 종로 지점입니다.',
      isActive: true,
    },
  });

  console.log('✅ 정비소 생성 완료');

  // 차량 생성
  const vehicle1 = await prisma.vehicle.create({
    data: {
      make: '현대',
      model: '아반떼',
      year: 2021,
      licensePlate: '12가 3456',
      vin: 'KMHD841CBNU123456',
      ownerId: customer.id,
    },
  });

  const vehicle2 = await prisma.vehicle.create({
    data: {
      make: '기아',
      model: 'K5',
      year: 2022,
      licensePlate: '34나 5678',
      vin: 'KNAG341ABNU789012',
      ownerId: customer.id,
    },
  });

  console.log('✅ 차량 생성 완료');

  // 예약 생성
  const appointment1 = await prisma.appointment.create({
    data: {
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // 내일
      time: '10:00',
      status: 'scheduled',
      customerId: customer.id,
      vehicleId: vehicle1.id,
      workshopId: workshop1.id,
      description: '엔진 오일 교체 및 점검',
    },
  });

  const appointment2 = await prisma.appointment.create({
    data: {
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3일 후
      time: '14:00',
      status: 'scheduled',
      customerId: customer.id,
      vehicleId: vehicle2.id,
      workshopId: workshop2.id,
      description: '브레이크 패드 교체',
    },
  });

  console.log('✅ 예약 생성 완료');

  // 정비 작업 생성
  const repairJob1 = await prisma.repairJob.create({
    data: {
      appointmentId: appointment1.id,
      mechanicId: mechanic.id,
      status: 'pending',
      estimatedCompletionTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 예약 2시간 후
      actualCompletionTime: null,
      notes: '엔진 오일 교체 및 기본 점검',
    },
  });

  console.log('✅ 정비 작업 생성 완료');

  console.log('🎉 초기 데이터 시딩이 완료되었습니다!');
}

main()
  .catch(e => {
    console.error('초기 데이터 시딩 중 오류가 발생했습니다:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAndFixPhone() {
  const user = await prisma.users.findFirst({
    where: {
      email: { contains: 'thuythanhluu' },
    },
  });

  if (!user) {
    console.log('❌ User not found');
    return;
  }

  console.log('Current phone number:', user.phoneNumber);

  // Update to correct international format
  const correctPhone = '+84899150904'; // Replace with your verified phone number

  await prisma.users.update({
    where: { id: user.id },
    data: {
      phoneNumber: correctPhone,
    },
  });

  console.log('✅ Updated phone to:', correctPhone);

  // Also update recent bookings
  await prisma.bookings.updateMany({
    where: {
      userId: user.id,
    },
    data: {
      customerInfo: {
        email: user.email,
        fullName: user.fullName,
        phoneNumber: correctPhone,
      },
    },
  });

  console.log('✅ Updated bookings customerInfo');
  console.log('\n📱 Make sure this number is verified in Twilio Console:');
  console.log(
    '   https://console.twilio.com/us1/develop/phone-numbers/manage/verified',
  );
}

checkAndFixPhone()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

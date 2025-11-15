import prisma from '../src/prismaClient';
import bcrypt from 'bcrypt';

async function main() {
  const pass = await bcrypt.hash('password', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: { email: 'admin@example.com', password: pass, name: 'Admin', role: 'ADMIN' }
  });
  const landlord = await prisma.user.upsert({
    where: { email: 'owner@example.com' },
    update: {},
    create: { email: 'owner@example.com', password: pass, name: 'Owner', role: 'LANDLORD' }
  });
  const sampleProps = [
    {
      title: 'Corner Bank Branch',
      description: 'Well-located bank branch with vault-ready space',
      address: '1 Finance St',
      city: 'Amsterdam',
      postalCode: '1011AA',
      sizeSqm: 250,
      rentPerMonth: 8000,
      zoning: 'Commercial',
      amenities: ['Parking','Security'],
      images: [],
      isActive: true,
      ownerId: landlord.id
    },
    {
      title: 'Fast Food Unit (Drive-thru)',
      description: 'Drive-thru ready lot suitable for QSR (KFC/McDonald\'s)',
      address: '500 Food Ave',
      city: 'Rotterdam',
      postalCode: '3011BB',
      sizeSqm: 300,
      rentPerMonth: 12000,
      zoning: 'Retail',
      amenities: ['Drive-thru','High footfall'],
      images: [],
      isActive: true,
      ownerId: landlord.id
    }
  ];
  for (const p of sampleProps) {
    await prisma.property.upsert({
      where: { title: p.title },
      update: {},
      create: p
    });
  }
  console.log('Seed complete');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

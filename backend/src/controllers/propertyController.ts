import { Request, Response } from 'express';
import prisma from '../prismaClient';
import { z } from 'zod';

const createSchema = z.object({
  title: z.string(),
  description: z.string(),
  address: z.string(),
  city: z.string(),
  postalCode: z.string(),
  sizeSqm: z.number(),
  rentPerMonth: z.number(),
  zoning: z.string(),
  amenities: z.array(z.string()),
  images: z.array(z.string()).optional()
});

export async function listProperties(req: Request, res: Response) {
  const { city, minRent, maxRent, sizeMin, q } = req.query;
  const where: any = { isActive: true };
  if (city) where.city = String(city);
  if (minRent || maxRent) where.rentPerMonth = {};
  if (minRent) where.rentPerMonth.gte = Number(minRent);
  if (maxRent) where.rentPerMonth.lte = Number(maxRent);
  if (sizeMin) where.sizeSqm = { gte: Number(sizeMin) };
  if (q) where.OR = [{ title: { contains: String(q), mode: 'insensitive' } }, { description: { contains: String(q), mode: 'insensitive' } }];
  const props = await prisma.property.findMany({ where, orderBy: { createdAt: 'desc' } });
  res.json(props);
}

export async function getProperty(req: Request, res: Response) {
  const id = req.params.id;
  const prop = await prisma.property.findUnique({ where: { id } });
  if (!prop) return res.status(404).json({ error: 'Not found' });
  res.json(prop);
}

export async function createProperty(req: Request, res: Response) {
  const userId = (req as any).user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const parsed = createSchema.parse(req.body);
  const prop = await prisma.property.create({ data: { ...parsed, ownerId: userId } });
  res.status(201).json(prop);
}

export async function updateProperty(req: Request, res: Response) {
  const id = req.params.id;
  const data = req.body;
  const prop = await prisma.property.update({ where: { id }, data });
  res.json(prop);
}

export async function deleteProperty(req: Request, res: Response) {
  const id = req.params.id;
  await prisma.property.delete({ where: { id } });
  res.json({ success: true });
}

export async function approveProperty(req: Request, res: Response) {
  const id = req.params.id;
  const prop = await prisma.property.update({ where: { id }, data: { isActive: true } });
  res.json(prop);
}

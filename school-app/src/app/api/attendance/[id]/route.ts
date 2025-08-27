import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const record = await prisma.attendance.findUnique({ where: { id: params.id }, include: { student: true, class: true, teacher: true } });
  return NextResponse.json(record);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const updated = await prisma.attendance.update({ where: { id: params.id }, data: body });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.attendance.delete({ where: { id: params.id } });
  return NextResponse.json({ message: 'Attendance deleted' });
}

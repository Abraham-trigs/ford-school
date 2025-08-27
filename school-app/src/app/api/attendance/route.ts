import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const attendance = await prisma.attendance.findMany({ include: { student: true, class: true, teacher: true } });
  return NextResponse.json(attendance);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const record = await prisma.attendance.create({ data: body });
  return NextResponse.json(record);
}

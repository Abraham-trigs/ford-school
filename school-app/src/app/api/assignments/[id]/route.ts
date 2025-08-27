import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const assignment = await prisma.assignment.findUnique({
    where: { id: params.id },
    include: { class: true, teacher: true, submissions: true },
  });
  return NextResponse.json(assignment);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const updated = await prisma.assignment.update({ where: { id: params.id }, data: body });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.assignment.delete({ where: { id: params.id } });
  return NextResponse.json({ message: 'Assignment deleted' });
}

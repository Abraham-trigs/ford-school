import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const assignments = await prisma.assignment.findMany({
    include: { class: true, teacher: true, submissions: true },
  });
  return NextResponse.json(assignments);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const assignment = await prisma.assignment.create({ data: body });
  return NextResponse.json(assignment);
}

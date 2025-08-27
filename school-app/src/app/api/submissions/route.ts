import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const submissions = await prisma.submission.findMany({
    include: { assignment: true, student: true },
  });
  return NextResponse.json(submissions);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const submission = await prisma.submission.create({ data: body });
  return NextResponse.json(submission);
}

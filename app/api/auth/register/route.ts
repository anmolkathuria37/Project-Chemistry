import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

function getAge(date: Date) {
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDelta = today.getMonth() - date.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < date.getDate())) age--;
  return age;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body?.password === 'string' ? body.password : '';
    const dob = typeof body?.dateOfBirth === 'string' ? body.dateOfBirth : '';

    if (name.length < 2 || name.length > 191) {
      return NextResponse.json({ error: 'Enter your full name.' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 191) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
    }
    if (password.length < 8 || password.length > 128) {
      return NextResponse.json({ error: 'Password must be between 8 and 128 characters.' }, { status: 400 });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      return NextResponse.json({ error: 'Enter a valid date of birth.' }, { status: 400 });
    }
    const dateOfBirth = new Date(`${dob}T00:00:00.000Z`);
    if (Number.isNaN(dateOfBirth.getTime()) || dateOfBirth.toISOString().slice(0, 10) !== dob) {
      return NextResponse.json({ error: 'Enter a valid date of birth.' }, { status: 400 });
    }
    const age = getAge(dateOfBirth);
    if (age < 18 || age > 100) {
      return NextResponse.json({ error: 'Chemistry is only available to people aged 18 to 100.' }, { status: 400 });
    }

    const passwordHash = await hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        fullName: name,
        email,
        passwordHash,
        dateOfBirth,
      },
      select: { id: true },
    });

    return NextResponse.json({ id: user.id }, { status: 201 });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }
    console.error('Registration failed:', error);
    return NextResponse.json({ error: 'Could not create your account right now.' }, { status: 500 });
  }
}

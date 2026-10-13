import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

function serializeProfile(user: any) {
  return {
    id: user.id,
    email: user.email,
    full_name: user.fullName ?? '',
    pronouns: user.pronouns ?? '',
    gender: user.gender ?? '',
    bio: user.bio ?? '',
    date_of_birth: user.dateOfBirth ? user.dateOfBirth.toISOString().slice(0, 10) : null,
    city: user.city ?? '',
    neighborhood: user.neighborhood ?? '',
    occupation: user.occupation ?? '',
    education: user.education ?? '',
    photos: Array.isArray(user.photos) ? user.photos : [],
    profile_completion: user.profileCompletion,
    is_verified: user.isVerified,
    verification_badges: Array.isArray(user.verificationBadges) ? user.verificationBadges : [],
    onboarding_completed: user.onboardingCompleted,
    created_at: user.createdAt,
    updated_at: user.updatedAt,
  };
}

async function ensureUser(userId: string, authUser?: { email?: string | null; name?: string | null }) {
  const email = authUser?.email ?? null;
  const fullName = authUser?.name ?? null;
  return prisma.user.upsert({
    where: { id: userId },
    update: { ...(email ? { email } : {}), ...(fullName ? { fullName } : {}) },
    create: { id: userId, email, fullName },
  });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const user = await ensureUser(userId, session?.user);
    return NextResponse.json({ data: serializeProfile(user), error: null });
  } catch (error) {
    console.error('Profile GET failed:', error);
    return NextResponse.json({ data: null, error: 'Could not load profile' }, { status: 500 });
  }
}

const editableFields = new Set([
  'full_name', 'pronouns', 'gender', 'bio', 'date_of_birth', 'city',
  'neighborhood', 'occupation', 'education', 'photos', 'profile_completion',
  'is_verified', 'verification_badges', 'onboarding_completed',
]);

const fieldMap: Record<string, string> = {
  full_name: 'fullName',
  date_of_birth: 'dateOfBirth',
  profile_completion: 'profileCompletion',
  is_verified: 'isVerified',
  verification_badges: 'verificationBadges',
  onboarding_completed: 'onboardingCompleted',
};

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await request.json();
    const input = body && typeof body === 'object' && body !== null ? body : {};
    const data: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      if (!editableFields.has(key) || key === 'is_verified' || key === 'verification_badges') continue;
      const target = fieldMap[key] ?? key;
      if (key === 'date_of_birth') {
        if (value === null || value === '') data[target] = null;
        else {
          const date = new Date(String(value) + (String(value).length === 10 ? 'T00:00:00' : ''));
          if (Number.isNaN(date.getTime()) || date > new Date()) return NextResponse.json({ error: 'Invalid date_of_birth' }, { status: 400 });
          let age = new Date().getFullYear() - date.getFullYear();
          const today = new Date();
          const monthDelta = today.getMonth() - date.getMonth();
          if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < date.getDate())) age--;
          if (age < 18 || age > 100) return NextResponse.json({ error: 'Chemistry is only available to people aged 18 to 100.' }, { status: 400 });
          data[target] = date;
        }
      } else if (key === 'photos' || key === 'verification_badges') {
        if (!Array.isArray(value)) return NextResponse.json({ error: `${key} must be an array` }, { status: 400 });
        data[target] = value;
      } else {
        data[target] = value;
      }
    }
    const existing = await ensureUser(userId, session?.user);
    if (data.onboardingCompleted === true) {
      const dob = Object.prototype.hasOwnProperty.call(data, 'dateOfBirth')
        ? data.dateOfBirth
        : existing.dateOfBirth;
      if (!(dob instanceof Date) || Number.isNaN(dob.getTime())) {
        return NextResponse.json({ error: 'Enter your date of birth before completing onboarding.' }, { status: 400 });
      }
      let age = new Date().getFullYear() - dob.getFullYear();
      const today = new Date();
      const monthDelta = today.getMonth() - dob.getMonth();
      if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < dob.getDate())) age--;
      if (age < 18 || age > 100 || dob > today) {
        return NextResponse.json({ error: 'Chemistry is only available to people aged 18 to 100.' }, { status: 400 });
      }
    }
    const updated = await prisma.user.update({ where: { id: userId }, data });
    return NextResponse.json({ data: serializeProfile(updated), error: null });
  } catch (error) {
    console.error('Profile PATCH failed:', error);
    return NextResponse.json({ error: 'Could not save profile' }, { status: 500 });
  }
}

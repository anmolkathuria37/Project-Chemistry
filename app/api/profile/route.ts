import { auth, currentUser } from '@clerk/nextjs/server';
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

async function ensureUser(userId: string) {
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.find((item) => item.id === clerkUser.primaryEmailAddressId)?.emailAddress ?? null;
  const fullName = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ') || null;
  return prisma.user.upsert({
    where: { id: userId },
    update: { ...(email ? { email } : {}), ...(fullName ? { fullName } : {}) },
    create: { id: userId, email, fullName },
  });
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const user = await ensureUser(userId);
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
  const { userId } = await auth();
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
          const date = new Date(String(value));
          if (Number.isNaN(date.getTime())) return NextResponse.json({ error: 'Invalid date_of_birth' }, { status: 400 });
          data[target] = date;
        }
      } else if (key === 'photos' || key === 'verification_badges') {
        if (!Array.isArray(value)) return NextResponse.json({ error: `${key} must be an array` }, { status: 400 });
        data[target] = value;
      } else {
        data[target] = value;
      }
    }
    const existing = await ensureUser(userId);
    const updated = await prisma.user.update({ where: { id: userId }, data });
    return NextResponse.json({ data: serializeProfile(updated), error: null });
  } catch (error) {
    console.error('Profile PATCH failed:', error);
    return NextResponse.json({ error: 'Could not save profile' }, { status: 500 });
  }
}

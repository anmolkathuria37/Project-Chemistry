import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

const models: Record<string, string> = {
  profiles: 'user', users: 'user', preferences: 'preference', interests: 'interest',
  user_interests: 'userInterest', likes: 'like', passes: 'pass', matches: 'match',
  conversations: 'conversation', messages: 'message', blocks: 'block', reports: 'report',
  saved_date_plans: 'savedDatePlan',
};

const fieldAliases: Record<string, Record<string, string>> = {
  profiles: { full_name: 'fullName', date_of_birth: 'dateOfBirth', profile_completion: 'profileCompletion', is_verified: 'isVerified', verification_badges: 'verificationBadges', onboarding_completed: 'onboardingCompleted', created_at: 'createdAt', updated_at: 'updatedAt' },
  users: { full_name: 'fullName', date_of_birth: 'dateOfBirth', profile_completion: 'profileCompletion', is_verified: 'isVerified', verification_badges: 'verificationBadges', onboarding_completed: 'onboardingCompleted', created_at: 'createdAt', updated_at: 'updatedAt' },
  preferences: { user_id: 'userId', age_min: 'ageMin', age_max: 'ageMax', distance_km: 'distanceKm', looking_for: 'lookingFor', interested_in: 'interestedIn', budget_min: 'budgetMin', budget_max: 'budgetMax', created_at: 'createdAt', updated_at: 'updatedAt' },
  interests: {},
  user_interests: { user_id: 'userId', interest_id: 'interestId', created_at: 'createdAt' },
  likes: { liker_id: 'likerId', liked_id: 'likedId', is_super_like: 'isSuperLike', intro_note: 'introNote', created_at: 'createdAt' },
  passes: { passer_id: 'passerId', passed_id: 'passedId', created_at: 'createdAt' },
  matches: { user1_id: 'user1Id', user2_id: 'user2Id', created_at: 'createdAt' },
  conversations: { match_id: 'matchId', created_at: 'createdAt', last_message_at: 'lastMessageAt' },
  messages: { conversation_id: 'conversationId', sender_id: 'senderId', created_at: 'createdAt', read_at: 'readAt' },
  blocks: { blocker_id: 'blockerId', blocked_id: 'blockedId', created_at: 'createdAt' },
  reports: { reporter_id: 'reporterId', reported_user_id: 'reportedUserId', reported_id: 'reportedUserId', reason: 'category', created_at: 'createdAt' },
  saved_date_plans: { user_id: 'userId', budget_label: 'budgetLabel', preferred_date: 'preferredDate', image_url: 'imageUrl', created_at: 'createdAt' },
};

function field(table: string, key: string) {
  return fieldAliases[table]?.[key] ?? key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}
function fromDb(table: string, value: any): any {
  if (Array.isArray(value)) return value.map((item) => fromDb(table, item));
  if (!value || typeof value !== 'object' || value instanceof Date) return value;
  const aliases = fieldAliases[table] ?? {};
  const out: Record<string, any> = {};
  for (const [key, val] of Object.entries(value)) {
    const snake = key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
    out[snake] = val instanceof Date ? val.toISOString() : val;
  }
  return out;
}
function toDb(table: string, value: any): any {
  if (Array.isArray(value)) return value.map((item) => toDb(table, item));
  if (!value || typeof value !== 'object' || value instanceof Date) return value;
  const out: Record<string, any> = {};
  for (const [key, val] of Object.entries(value)) {
    const target = field(table, key);
    if (['date_of_birth', 'preferred_date'].includes(key)) out[target] = val ? new Date(String(val) + (String(val).length === 10 ? 'T00:00:00' : '')) : null;
    else if (['read_at', 'last_message_at', 'created_at', 'updated_at'].includes(key)) out[target] = val ? new Date(String(val)) : null;
    else out[target] = val;
  }
  return out;
}
function parseInValue(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];
  const cleaned = value.trim().replace(/^\(/, '').replace(/\)$/, '');
  if (!cleaned) return [];
  return cleaned.split(',').map((item) => item.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
}
function buildWhere(table: string, filters: any[] = []) {
  const where: Record<string, any> = {};
  const and: any[] = [];
  const or: any[] = [];
  for (const item of filters) {
    if (!item || typeof item.column !== 'string' || item.column === '__range') continue;
    if (item.operator === 'or') {
      if (typeof item.value === 'string') {
        for (const clause of item.value.split(',')) {
          const [col, op, ...parts] = clause.split('.');
          const raw = parts.join('.');
          if (!col || !op) continue;
          const key = field(table, col);
          const val: any = raw === 'null' ? null : raw === 'true' ? true : raw === 'false' ? false : raw;
          or.push(op === 'eq' ? { [key]: val } : op === 'neq' ? { [key]: { not: val } } : { [key]: val });
        }
      }
      continue;
    }
    const key = field(table, item.column);
    const value = item.operator === 'in' || item.operator === 'not_in'
      ? parseInValue(item.value)
      : item.operator === 'not_is' ? item.value : item.value;
    let condition: any;
    switch (item.operator) {
      case 'eq': condition = value; break;
      case 'neq': condition = { not: value }; break;
      case 'gt': condition = { gt: value }; break;
      case 'gte': condition = { gte: value }; break;
      case 'lt': condition = { lt: value }; break;
      case 'lte': condition = { lte: value }; break;
      case 'in': condition = { in: value }; break;
      case 'not_in': condition = { notIn: value }; break;
      case 'is': condition = value === null ? null : value; break;
      default: continue;
    }
    and.push({ [key]: condition });
  }
  if (or.length) and.push({ OR: or });
  if (Object.keys(where).length) and.push(where);
  return and.length ? { AND: and } : {};
}
function ownerScope(table: string, userId: string, action: string) {
  const write = action !== 'select';
  switch (table) {
    case 'profiles': case 'users': return write ? { id: userId } : {};
    case 'preferences': case 'saved_date_plans': return { [table === 'preferences' ? 'userId' : 'userId']: userId };
    case 'user_interests': return write ? { userId } : {};
    case 'likes': return write ? { likerId: userId } : { OR: [{ likerId: userId }, { likedId: userId }] };
    case 'passes': return write ? { passerId: userId } : { OR: [{ passerId: userId }, { passedId: userId }] };
    case 'blocks': return write ? { blockerId: userId } : { OR: [{ blockerId: userId }, { blockedId: userId }] };
    case 'matches': return { OR: [{ user1Id: userId }, { user2Id: userId }] };
    case 'conversations': return { match: { is: { OR: [{ user1Id: userId }, { user2Id: userId }] } } };
    case 'messages': return { conversation: { match: { is: { OR: [{ user1Id: userId }, { user2Id: userId }] } } } };
    case 'reports': return { reporterId: userId };
    case 'interests': return {};
    default: return null;
  }
}
function sanitize(table: string, rows: any, userId: string) {
  const map = (row: any) => {
    const result = fromDb(table, row);
    if ((table === 'profiles' || table === 'users') && row?.id !== userId) {
      delete result.email;
      delete result.date_of_birth;
      delete result.is_verified;
      delete result.verification_badges;
    }
    return result;
  };
  return Array.isArray(rows) ? rows.map(map) : rows ? map(rows) : rows;
}
async function ensureInterestCatalog() {
  const categories: Record<string, string[]> = {
    'Food & Drink': ['Coffee', 'Street Food', 'Fine Dining', 'Cooking', 'Baking', 'Wine Tasting'],
    Entertainment: ['Movies', 'Live Music', 'Theatre', 'Comedy Shows', 'Concerts'],
    Creative: ['Photography', 'Painting', 'Writing', 'Design', 'Reading', 'Dance', 'Singing'],
    Outdoors: ['Hiking', 'Cycling', 'Running'],
    Fitness: ['Yoga', 'Gym'],
    Sports: ['Cricket', 'Football', 'Tennis'],
    Lifestyle: ['Travel', 'Weekend Getaways', 'Exploring Cafes', 'Fashion', 'Pets', 'Plant Parenting'],
    Culture: ['Museums', 'Art Galleries', 'History'],
    Games: ['Board Games', 'Video Games'],
  };
  const seed = Object.entries(categories).flatMap(([category, names]) => names.map((name) => ({ name, category })));
  await prisma.interest.createMany({ data: seed, skipDuplicates: true });
}

async function ensureUser(userId: string) {
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.find((item) => item.id === clerkUser.primaryEmailAddressId)?.emailAddress ?? null;
  const fullName = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ') || null;
  await prisma.user.upsert({
    where: { id: userId },
    update: { ...(email ? { email } : {}), ...(fullName ? { fullName } : {}) },
    create: { id: userId, email, fullName },
  });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 });
  try {
    const input = await request.json();
    const table = String(input.table ?? '');
    const modelName = models[table];
    if (!modelName) return NextResponse.json({ error: 'Unsupported table.' }, { status: 400 });
    const action = String(input.action ?? 'select');
    const scope = ownerScope(table, userId, action);
    if (scope === null) return NextResponse.json({ error: 'Operation not allowed.' }, { status: 403 });
    await ensureUser(userId);
    if (table === 'interests' && action === 'select') await ensureInterestCatalog();

    if (table === 'interests' && action !== 'select') return NextResponse.json({ error: 'Interest catalog is read-only.' }, { status: 403 });

    const model: any = (prisma as any)[modelName];
    if (!model) return NextResponse.json({ error: 'Data model unavailable.' }, { status: 500 });
    const filters = Array.isArray(input.filters) ? input.filters : [];
    const clientWhere = buildWhere(table, filters);
    const where = Object.keys(clientWhere).length ? { AND: [clientWhere, scope] } : scope;
    let result: any;

    if (action === 'select') {
      const orderBy = Array.isArray(input.orders) ? input.orders.map((o: any) => ({ [field(table, o.column)]: o.ascending === false ? 'desc' : 'asc' })) : [];
      const range = filters.find((f: any) => f.column === '__range');
      const skip = range && Array.isArray(range.value) ? Number(range.value[0]) : undefined;
      const take = range && Array.isArray(range.value) ? Number(range.value[1]) - Number(range.value[0]) + 1 : input.limit;
      result = await model.findMany({ where, ...(orderBy.length ? { orderBy } : {}), ...(Number.isFinite(take) ? { take: Math.min(Math.max(Number(take), 0), 100) } : {}), ...(Number.isFinite(skip) ? { skip } : {}) });
      result = sanitize(table, result, userId);
      if (input.singleMode === 'single') {
        if (result.length !== 1) return NextResponse.json({ error: 'Expected exactly one row.' }, { status: 406 });
        result = result[0];
      } else if (input.singleMode === 'maybeSingle') {
        if (result.length > 1) return NextResponse.json({ error: 'Expected at most one row.' }, { status: 406 });
        result = result[0] ?? null;
      }
    } else if (action === 'insert' || action === 'upsert') {
      const raw = Array.isArray(input.values) ? input.values : [input.values];
      if (!raw.length || raw.some((item: any) => !item || typeof item !== 'object')) return NextResponse.json({ error: 'Invalid insert payload.' }, { status: 400 });
      const rows = raw.map((item: any) => toDb(table, item));
      if (table === 'profiles' || table === 'users') {
        if (rows.some((row: any) => row.id && row.id !== userId)) return NextResponse.json({ error: 'Cannot create another user profile.' }, { status: 403 });
        rows.forEach((row: any) => row.id = userId);
      }
      const ownerFields: Record<string, string> = { preferences: 'userId', saved_date_plans: 'userId', user_interests: 'userId', likes: 'likerId', passes: 'passerId', blocks: 'blockerId', reports: 'reporterId', messages: 'senderId' };
      const ownerField = ownerFields[table];
      if (ownerField && rows.some((row: any) => row[ownerField] && row[ownerField] !== userId)) return NextResponse.json({ error: 'Cannot write another user’s data.' }, { status: 403 });
      if (ownerField) rows.forEach((row: any) => row[ownerField] = userId);
      if (table === 'likes') {
        for (const row of rows) {
          if (!row.likedId || row.likedId === userId) return NextResponse.json({ error: 'Invalid like target.' }, { status: 400 });
          const block = await prisma.block.findFirst({ where: { OR: [{ blockerId: userId, blockedId: row.likedId }, { blockerId: row.likedId, blockedId: userId }] } });
          if (block) return NextResponse.json({ error: 'This interaction is unavailable.' }, { status: 403 });
        }
      }
      if (table === 'matches') {
        for (const row of rows) {
          if (row.user1Id !== userId && row.user2Id !== userId) return NextResponse.json({ error: 'You can only create your own matches.' }, { status: 403 });
          if (!row.user1Id || !row.user2Id || row.user1Id === row.user2Id) return NextResponse.json({ error: 'Invalid match participants.' }, { status: 400 });
          const pair = [row.user1Id, row.user2Id].sort();
          row.user1Id = pair[0];
          row.user2Id = pair[1];
          const [forwardLike, reverseLike, block] = await Promise.all([
            prisma.like.findFirst({ where: { likerId: row.user1Id, likedId: row.user2Id } }),
            prisma.like.findFirst({ where: { likerId: row.user2Id, likedId: row.user1Id } }),
            prisma.block.findFirst({ where: { OR: [{ blockerId: row.user1Id, blockedId: row.user2Id }, { blockerId: row.user2Id, blockedId: row.user1Id }] } }),
          ]);
          if (!forwardLike || !reverseLike || block) return NextResponse.json({ error: 'A match requires mutual likes and no active block.' }, { status: 403 });
        }
      }
      if (table === 'conversations') {
        for (const row of rows) {
          const match = await prisma.match.findFirst({ where: { id: row.matchId, OR: [{ user1Id: userId }, { user2Id: userId }] } });
          if (!match) return NextResponse.json({ error: 'Conversation must belong to one of your matches.' }, { status: 403 });
        }
      }
      if (table === 'messages') {
        for (const row of rows) {
          const conversation = await prisma.conversation.findFirst({ where: { id: row.conversationId, match: { is: { OR: [{ user1Id: userId }, { user2Id: userId }] } } } });
          if (!conversation) return NextResponse.json({ error: 'You cannot message in this conversation.' }, { status: 403 });
        }
      }
      if (action === 'upsert') {
        result = await Promise.all(rows.map(async (row: any) => {
          if (table === 'user_interests') return model.upsert({ where: { userId_interestId: { userId: row.userId, interestId: row.interestId } }, create: row, update: row });
          if (table === 'interests') return model.upsert({ where: { name: row.name }, create: row, update: row });
          if (table === 'profiles' || table === 'users') return model.upsert({ where: { id: userId }, create: row, update: row });
          return model.create({ data: row });
        }));
      } else {
        result = await Promise.all(rows.map((row: any) => model.create({ data: row })));
      }
      result = sanitize(table, result, userId);
      if (input.singleMode === 'single') {
        if (!Array.isArray(result) || result.length !== 1) return NextResponse.json({ error: 'Expected exactly one row.' }, { status: 406 });
        result = result[0];
      } else if (input.singleMode === 'maybeSingle') {
        if (Array.isArray(result) && result.length > 1) return NextResponse.json({ error: 'Expected at most one row.' }, { status: 406 });
        result = Array.isArray(result) ? result[0] ?? null : result;
      }
    } else if (action === 'update') {
      const data = toDb(table, input.values ?? {});
      if (table === 'profiles' || table === 'users') {
        delete data.id;
        delete data.email;
        delete data.isVerified;
        delete data.verificationBadges;
        delete data.createdAt;
        delete data.updatedAt;
      }
      if (table === 'messages') {
        const allowed = new Set(['readAt']);
        for (const key of Object.keys(data)) if (!allowed.has(key)) delete data[key];
      }
      if (table === 'conversations') {
        const allowed = new Set(['lastMessageAt']);
        for (const key of Object.keys(data)) if (!allowed.has(key)) delete data[key];
      }
      if (table === 'matches') {
        for (const key of ['user1Id', 'user2Id', 'createdAt']) delete data[key];
      }
      if (table === 'likes') delete data.likerId;
      if (table === 'passes') delete data.passerId;
      if (table === 'blocks') delete data.blockerId;
      if (table === 'reports') delete data.reporterId;
      result = await model.updateMany({ where, data });
    } else if (action === 'delete') {
      result = await model.deleteMany({ where });
    } else return NextResponse.json({ error: 'Unsupported operation.' }, { status: 400 });

    return NextResponse.json({ data: result, error: null });
  } catch (error: any) {
    console.error('Data API error:', error);
    const message = error?.code === 'P2002' ? 'duplicate record already exists.' : 'The request could not be completed.';
    return NextResponse.json({ error: message, code: error?.code }, { status: error?.code === 'P2002' ? 409 : 500 });
  }
}

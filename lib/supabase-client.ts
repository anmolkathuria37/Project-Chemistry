export type Profile = {
  id: string;
  full_name: string;
  pronouns: string;
  gender: string;
  bio: string;
  date_of_birth: string | null;
  city: string;
  neighborhood: string;
  occupation: string;
  education: string;
  photos: string[];
  profile_completion: number;
  is_verified: boolean;
  verification_badges: string[];
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
};

export type Preferences = {
  id: string; user_id: string; age_min: number; age_max: number; distance_km: number;
  looking_for: string; interested_in: string[]; budget_min: number; budget_max: number;
};
export type Interest = { id: string; name: string; category: string; icon: string | null };
export type Match = { id: string; user1_id: string; user2_id: string; created_at: string };
export type Conversation = { id: string; match_id: string; created_at: string; last_message_at: string | null };
export type Message = { id: string; conversation_id: string; sender_id: string; content: string; created_at: string; read_at: string | null };
export type Like = { id: string; liker_id: string; liked_id: string; is_super_like: boolean; intro_note: string | null; created_at: string };

type Filter = { column: string; operator: string; value: unknown };
type Row = Profile & Record<string, any>;
type QueryResult<T = Row[]> = { data: T; error: { message: string; code?: string } | null; count?: number | null };

class QueryBuilder<T = Row[]> implements PromiseLike<QueryResult<T>> {
  private action = 'select';
  private columns = '*';
  private filters: Filter[] = [];
  private orders: Array<{ column: string; ascending: boolean }> = [];
  private maxRows?: number;
  private values: unknown;
  private singleMode: 'single' | 'maybeSingle' | null = null;
  private conflict?: string;

  constructor(private table: string) {}
  select(columns = '*') { this.columns = columns; return this; }
  insert(values: unknown) { this.action = 'insert'; this.values = values; return this; }
  update(values: unknown) { this.action = 'update'; this.values = values; return this; }
  upsert(values: unknown, options?: { onConflict?: string }) { this.action = 'upsert'; this.values = values; this.conflict = options?.onConflict; return this; }
  delete() { this.action = 'delete'; return this; }
  eq(column: string, value: unknown) { this.filters.push({ column, operator: 'eq', value }); return this; }
  neq(column: string, value: unknown) { this.filters.push({ column, operator: 'neq', value }); return this; }
  gt(column: string, value: unknown) { this.filters.push({ column, operator: 'gt', value }); return this; }
  gte(column: string, value: unknown) { this.filters.push({ column, operator: 'gte', value }); return this; }
  lt(column: string, value: unknown) { this.filters.push({ column, operator: 'lt', value }); return this; }
  lte(column: string, value: unknown) { this.filters.push({ column, operator: 'lte', value }); return this; }
  is(column: string, value: unknown) { this.filters.push({ column, operator: 'is', value }); return this; }
  in(column: string, value: unknown[]) { this.filters.push({ column, operator: 'in', value }); return this; }
  not(column: string, operator: string, value: unknown) { this.filters.push({ column, operator: `not_${operator}`, value }); return this; }
  match(values: Record<string, unknown>) { Object.entries(values).forEach(([k,v]) => this.eq(k,v)); return this; }
  or(expression: string) { this.filters.push({ column: '__or', operator: 'or', value: expression }); return this; }
  order(column: string, options?: { ascending?: boolean }) { this.orders.push({ column, ascending: options?.ascending ?? true }); return this; }
  limit(count: number) { this.maxRows = count; return this; }
  range(from: number, to: number) { this.filters.push({ column: '__range', operator: 'range', value: [from,to] }); return this; }
  single(): QueryBuilder<Row> { this.singleMode = 'single'; return this as unknown as QueryBuilder<Row>; }
  maybeSingle(): QueryBuilder<Row | null> { this.singleMode = 'maybeSingle'; return this as unknown as QueryBuilder<Row | null>; }

  private async execute(): Promise<QueryResult<T>> {
    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          table: this.table, action: this.action, columns: this.columns, filters: this.filters,
          orders: this.orders, limit: this.maxRows, values: this.values, singleMode: this.singleMode,
          conflict: this.conflict,
        }),
      });
      const result = await response.json();
      if (!response.ok) return { data: null as T, error: { message: result.error || 'Request failed', code: result.code } };
      return { data: (result.data ?? null) as T, error: null, count: result.count ?? null };
    } catch (error) {
      return { data: null as T, error: { message: error instanceof Error ? error.message : 'Network error' } };
    }
  }
  then<TResult1 = QueryResult<T>, TResult2 = never>(
    onfulfilled?: ((value: QueryResult<T>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(onfulfilled ?? undefined, onrejected ?? undefined);
  }
}

export const supabase = {
  from(table: string) { return new QueryBuilder(table); },
  auth: {
    async getSession() { return { data: { session: null }, error: null }; },
    onAuthStateChange(_callback: (...args: any[]) => void) {
      return { data: { subscription: { unsubscribe() {} } } };
    },
    async signOut() { return { error: null }; },
    async signUp() { return { data: { user: null }, error: { message: 'Use Clerk sign-up instead.' } }; },
    async signInWithPassword() { return { data: { user: null }, error: { message: 'Use Clerk sign-in instead.' } }; },
  },
};

'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Pencil, Plus, RefreshCw, Save, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Section = 'date-planner' | 'experiencex' | 'get-date-ready';
type ContentItem = {
  id: string;
  section: Section;
  slug: string;
  title: string;
  description: string;
  category: string;
  neighborhood: string;
  budgetLabel: string;
  imageUrl: string;
  published: boolean;
  sortOrder: number;
  updatedAt: string;
};

type Draft = Omit<ContentItem, 'id' | 'updatedAt'>;
const emptyDraft: Draft = {
  section: 'date-planner', slug: '', title: '', description: '', category: '',
  neighborhood: '', budgetLabel: '', imageUrl: '', published: false, sortOrder: 0,
};
const sectionLabels: Record<Section, string> = {
  'date-planner': 'Date Planner',
  experiencex: 'Experiencex',
  'get-date-ready': 'Get Date Ready',
};

export default function AdminContentPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [section, setSection] = useState<Section | 'all'>('all');
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const query = section === 'all' ? '' : '?section=' + encodeURIComponent(section);
      const response = await fetch('/api/admin/content' + query, { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not load content.');
      setItems(result.items as ContentItem[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load content.');
    } finally {
      setLoading(false);
    }
  }, [section]);

  useEffect(() => { void loadItems(); }, [loadItems]);

  function editItem(item: ContentItem) {
    setEditingId(item.id);
    setDraft({
      section: item.section, slug: item.slug, title: item.title, description: item.description,
      category: item.category, neighborhood: item.neighborhood, budgetLabel: item.budgetLabel,
      imageUrl: item.imageUrl, published: item.published, sortOrder: item.sortOrder,
    });
    setNotice('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setDraft({ ...emptyDraft, section: section === 'all' ? 'date-planner' : section });
    setEditingId(null);
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const response = await fetch(editingId ? '/api/admin/content/' + editingId : '/api/admin/content', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not save content.');
      setNotice(
        draft.published
          ? (editingId ? 'Content updated and published. It is available to the website.' : 'Content published and available to the website.')
          : (editingId ? 'Changes saved as a draft. Publish this item to make it visible on the website.' : 'Content saved as a draft. Click Publish in the content library to make it visible on the website.')
      );
      resetForm();
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save content.');
    } finally {
      setSaving(false);
    }
  }

  async function togglePublished(item: ContentItem) {
    setError('');
    setNotice('');
    try {
      const response = await fetch('/api/admin/content/' + item.id, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !item.published }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not change publish status.');
      setNotice(!item.published ? 'Content published.' : 'Content unpublished.');
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not change publish status.');
    }
  }

  async function deleteItem(item: ContentItem) {
    if (!window.confirm('Delete “' + item.title + '”? This cannot be undone.')) return;
    setError('');
    setNotice('');
    try {
      const response = await fetch('/api/admin/content/' + item.id, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not delete content.');
      if (editingId === item.id) resetForm();
      setNotice('Content deleted.');
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete content.');
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-end">
          <div>
            <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Control centre</Link>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Chemistry · Content</p>
            <h1 className="mt-2 text-3xl font-bold">Content management</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Manage content records for Date Planner, Experiencex and Get Date Ready. Drafts remain unpublished until you publish them.</p>
          </div>
          <Button variant="outline" onClick={() => void loadItems()} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />} Refresh
          </Button>
        </header>

        {error && <div role="alert" className="mt-5 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">{error}</div>}
        {notice && <div role="status" className="mt-5 rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm">{notice}</div>}

        <section className="mt-7 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">{editingId ? 'Edit content' : 'Add content'}</h2>
              <p className="mt-1 text-xs text-muted-foreground">Title and description are required. Slugs must be unique within a section.</p>
            </div>
            {editingId && <Button type="button" variant="ghost" onClick={resetForm}><X className="mr-2 h-4 w-4" /> Cancel edit</Button>}
          </div>
          <form onSubmit={submitForm} className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1.5 text-sm">Section
              <select className="h-11 rounded-xl border border-border bg-background px-3" value={draft.section} onChange={(e) => setDraft({ ...draft, section: e.target.value as Section })}>
                {Object.entries(sectionLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm">Title *
              <input required maxLength={191} className="h-11 rounded-xl border border-border bg-background px-3" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="A cozy coffee date" />
            </label>
            <label className="grid gap-1.5 text-sm">Slug (optional)
              <input maxLength={191} className="h-11 rounded-xl border border-border bg-background px-3" value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} placeholder="cozy-coffee-date" />
            </label>
            <label className="grid gap-1.5 text-sm">Category *
              <select required className="h-11 rounded-xl border border-border bg-background px-3" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
                <option value="">Choose a date category</option>
                <option value="coffee">Coffee Date</option>
                <option value="dinner">Dinner & Food</option>
                <option value="movie">Movie & Film</option>
                <option value="live">Live Music & Events</option>
                <option value="surprise">Surprise, Art & Adventure</option>
              </select>
              <span className="text-xs text-muted-foreground">Use a standard category so the published idea appears in the matching Date Planner filter.</span>
            </label>
            <label className="grid gap-1.5 text-sm">Neighborhood / location
              <input maxLength={191} className="h-11 rounded-xl border border-border bg-background px-3" value={draft.neighborhood} onChange={(e) => setDraft({ ...draft, neighborhood: e.target.value })} placeholder="Hauz Khas Village" />
            </label>
            <label className="grid gap-1.5 text-sm">Budget label
              <input maxLength={120} className="h-11 rounded-xl border border-border bg-background px-3" value={draft.budgetLabel} onChange={(e) => setDraft({ ...draft, budgetLabel: e.target.value })} placeholder="₹500–₹1,000 per person" />
            </label>
            <label className="grid gap-1.5 text-sm md:col-span-2">Image URL
              <input type="url" maxLength={1000} className="h-11 rounded-xl border border-border bg-background px-3" value={draft.imageUrl} onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value })} placeholder="https://…" />
            </label>
            <label className="grid gap-1.5 text-sm md:col-span-2">Description *
              <textarea required maxLength={10000} rows={4} className="rounded-xl border border-border bg-background px-3 py-2.5" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Describe the experience…" />
            </label>
            <label className="grid gap-1.5 text-sm">Display order
              <input type="number" min={0} max={100000} step={1} className="h-11 rounded-xl border border-border bg-background px-3" value={draft.sortOrder} onChange={(e) => setDraft({ ...draft, sortOrder: Number(e.target.value) || 0 })} />
            </label>
            <label className="flex items-center gap-3 self-end rounded-xl border border-border p-3 text-sm">
              <input type="checkbox" checked={draft.published} onChange={(e) => setDraft({ ...draft, published: e.target.checked })} className="h-4 w-4 accent-primary" />
              Publish immediately
            </label>
            <div className="flex gap-2 md:col-span-2">
              <Button type="submit" disabled={saving}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : editingId ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}{saving ? 'Saving…' : editingId ? 'Save changes' : 'Create content'}</Button>
              {!editingId && <Button type="button" variant="outline" onClick={resetForm}>Reset</Button>}
            </div>
          </form>
        </section>

        <section className="mt-7">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="text-xl font-semibold">Content library</h2><p className="mt-1 text-sm text-muted-foreground">{items.length} record{items.length === 1 ? '' : 's'}</p></div>
            <select aria-label="Filter content section" className="h-10 rounded-xl border border-border bg-background px-3 text-sm" value={section} onChange={(e) => setSection(e.target.value as Section | 'all')}>
              <option value="all">All sections</option>
              {Object.entries(sectionLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
          {loading ? <div className="flex min-h-32 items-center justify-center text-sm text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading content…</div>
            : items.length === 0 ? <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">No content records yet. Create your first item above.</div>
            : <div className="grid gap-4 lg:grid-cols-2">
              {items.map((item) => <article key={item.id} className="overflow-hidden rounded-2xl border border-border bg-card">
                {item.imageUrl && <div className="h-40 bg-muted"><img src={item.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" /></div>}
                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-muted px-2.5 py-1">{sectionLabels[item.section]}</span>
                    <span className={item.published ? 'rounded-full bg-emerald-500/10 px-2.5 py-1 text-emerald-700' : 'rounded-full bg-amber-500/10 px-2.5 py-1 text-amber-700'}>{item.published ? 'Published' : 'Draft'}</span>
                  </div>
                  <h3 className="mt-3 font-semibold">{item.title}</h3>
                  <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{item.description}</p>
                  <p className="mt-3 text-xs text-muted-foreground">{[item.category, item.neighborhood, item.budgetLabel].filter(Boolean).join(' · ') || 'No category, location or budget set'}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => editItem(item)}><Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit</Button>
                    <Button size="sm" variant="outline" onClick={() => void togglePublished(item)}>{item.published ? 'Unpublish' : 'Publish'}</Button>
                    <Button size="sm" variant="destructive" onClick={() => void deleteItem(item)}><Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete</Button>
                  </div>
                </div>
              </article>)}
            </div>}
        </section>
      </div>
    </main>
  );
}
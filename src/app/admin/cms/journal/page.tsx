"use client";

import { BookOpen, ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge, Button, Card, ChipsInput, Drawer, EmptyState, Field, IconButton, ImageInput, Input, PageHeader, PageSkeleton, Textarea, Thumb, Toggle, useConfirm } from "@/components/admin/ui";
import { toast } from "@/components/admin/toast";
import { useDB } from "@/store/db";
import type { Post } from "@/lib/types";
import { fmtDate, slugify, uid } from "@/lib/utils";

export default function JournalCMS() {
  const hydrated = useDB((s) => s.hydrated);
  const posts = useDB((s) => s.posts);
  const upsert = useDB((s) => s.upsert);
  const remove = useDB((s) => s.remove);
  const [edit, setEdit] = useState<Post | null>(null);
  const { confirm, node } = useConfirm();
  if (!hydrated) return <PageSkeleton />;
  const isExisting = edit && posts.some((p) => p.id === edit.id);

  return (
    <div>
      {node}
      <PageHeader
        title="Journal"
        subtitle="Stories, brewing guides and news for the blog."
        actions={
          <Button
            variant="primary"
            onClick={() => setEdit({ id: uid("b"), slug: "", title: "", excerpt: "", content: "", cover: "", author: "Aura Team", date: new Date().toISOString(), tags: [], readTime: 3, published: false })}
          >
            <Plus className="size-4" /> New post
          </Button>
        }
      />
      {posts.length === 0 ? (
        <Card>
          <EmptyState icon={<BookOpen className="size-5" />} title="No posts yet" />
        </Card>
      ) : (
        <Card pad={false}>
          <div className="divide-y divide-[var(--a-line)]">
            {[...posts]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((p) => (
                <div key={p.id} className="flex items-center gap-4 px-5 py-4">
                  <Thumb src={p.cover} className="aspect-[4/3] w-20 sm:w-28" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{p.title || "Untitled"}</span>
                      {p.published ? <Badge tone="green">Published</Badge> : <Badge tone="orange">Draft</Badge>}
                    </div>
                    <div className="mt-0.5 line-clamp-1 text-sm text-[var(--a-muted)]">{p.excerpt}</div>
                    <div className="mt-1 text-xs text-[var(--a-muted)]">
                      {p.author} · {fmtDate(p.date)} · {p.readTime} min
                    </div>
                  </div>
                  <div className="flex shrink-0">
                    <a href={`/journal/${p.slug}`} target="_blank" className="hidden sm:block">
                      <IconButton aria-label="View">
                        <ExternalLink className="size-4" />
                      </IconButton>
                    </a>
                    <IconButton onClick={() => setEdit(p)} aria-label="Edit">
                      <Pencil className="size-4" />
                    </IconButton>
                    <IconButton
                      onClick={async () => {
                        if (await confirm("Delete post?", `“${p.title}” will be removed.`)) {
                          remove("posts", p.id);
                          toast("Post deleted");
                        }
                      }}
                      aria-label="Delete"
                    >
                      <Trash2 className="size-4" />
                    </IconButton>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}

      <Drawer
        open={!!edit}
        onClose={() => setEdit(null)}
        width="max-w-2xl"
        title={isExisting ? "Edit post" : "New post"}
        footer={
          <>
            <Button onClick={() => setEdit(null)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                if (!edit?.title.trim()) return toast("Title is required", "error");
                const slug = edit.slug || slugify(edit.title);
                if (posts.some((p) => p.slug === slug && p.id !== edit.id)) return toast("Slug already used", "error");
                const words = edit.content.split(/\s+/).filter(Boolean).length;
                upsert("posts", { ...edit, slug, readTime: Math.max(1, edit.readTime || Math.round(words / 200)) });
                toast(edit.published ? "Post published" : "Draft saved");
                setEdit(null);
              }}
            >
              Save
            </Button>
          </>
        }
      >
        {edit && (
          <div className="space-y-4">
            <Field label="Title">
              <Input value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value, slug: isExisting ? edit.slug : slugify(e.target.value) })} className="text-base font-medium" />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Slug">
                <Input value={edit.slug} onChange={(e) => setEdit({ ...edit, slug: slugify(e.target.value) })} />
              </Field>
              <Field label="Author">
                <Input value={edit.author} onChange={(e) => setEdit({ ...edit, author: e.target.value })} />
              </Field>
              <Field label="Date">
                <Input type="date" value={edit.date.slice(0, 10)} onChange={(e) => setEdit({ ...edit, date: new Date(e.target.value + "T10:00").toISOString() })} />
              </Field>
              <Field label="Read time (min)">
                <Input type="number" value={edit.readTime} onChange={(e) => setEdit({ ...edit, readTime: Number(e.target.value) })} />
              </Field>
            </div>
            <Field label="Excerpt">
              <Textarea value={edit.excerpt} onChange={(e) => setEdit({ ...edit, excerpt: e.target.value })} className="!min-h-16" />
            </Field>
            <ImageInput label="Cover image" value={edit.cover} onChange={(v) => setEdit({ ...edit, cover: v })} aspect="aspect-[16/9]" />
            <Field label="Tags">
              <ChipsInput value={edit.tags} onChange={(v) => setEdit({ ...edit, tags: v })} suggestions={["Brewing", "Guides", "Origins", "Stories", "Bakery", "News"]} />
            </Field>
            <Field label="Content" hint={'Separate paragraphs with a blank line. Start a line with "## " for a heading.'}>
              <Textarea value={edit.content} onChange={(e) => setEdit({ ...edit, content: e.target.value })} rows={14} className="font-mono text-[13px]" />
            </Field>
            <Toggle checked={edit.published} onChange={(v) => setEdit({ ...edit, published: v })} label="Published" description="Drafts are only visible here" />
          </div>
        )}
      </Drawer>
    </div>
  );
}

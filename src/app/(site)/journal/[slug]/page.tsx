"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ParallaxImg } from "@/components/motion/Parallax";
import { Reveal, SplitWords } from "@/components/motion/Reveal";
import { fmtDate } from "@/lib/utils";
import { useDB } from "@/store/db";

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = useDB((s) => s.posts.find((p) => p.slug === slug));
  const posts = useDB((s) => s.posts);
  const hydrated = useDB((s) => s.hydrated);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  if (!post) return <div className="py-48 text-center"><p className="display text-5xl">{hydrated ? "Post not found" : "Loading…"}</p></div>;
  const blocks = post.content.split(/\n\n+/);
  const next = posts.filter((p) => p.published && p.id !== post.id)[0];

  return (
    <article>
      <motion.div style={{ scaleX: progress }} className="fixed inset-x-0 top-0 z-[55] h-1 origin-left bg-accent" />
      <header className="mx-auto max-w-4xl px-5 pb-10 pt-32 sm:px-8 sm:pt-40">
        <Link href="/journal" className="flex items-center gap-2 text-sm text-muted hover:text-ink"><ArrowLeft className="size-4" /> Journal</Link>
        <p className="eyebrow mt-8 text-accent">{post.tags.join(" · ")}</p>
        <h1 className="display mt-4 text-[clamp(2.8rem,7vw,5.5rem)] leading-[0.98]"><SplitWords text={post.title} animateOnMount stagger={0.03} /></h1>
        <p className="mt-6 text-sm text-muted">By {post.author} · {fmtDate(post.date)} · {post.readTime} min read</p>
      </header>
      <ParallaxImg src={post.cover} alt={post.title} className="mx-3 aspect-[16/9] rounded-card sm:mx-5" eager />
      <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
        <p className="display text-3xl leading-snug">{post.excerpt}</p>
        {blocks.map((b, i) =>
          b.startsWith("## ") ? (
            <Reveal key={i}>
              <h2 className="display mt-12 text-4xl">{b.slice(3).split("\n")[0]}</h2>
              {b.split("\n").slice(1).join(" ") && <p className="mt-4 text-lg leading-relaxed text-ink/80">{b.split("\n").slice(1).join(" ")}</p>}
            </Reveal>
          ) : (
            <Reveal key={i}><p className="mt-6 text-lg leading-relaxed text-ink/80">{b}</p></Reveal>
          ),
        )}
      </div>
      {next && (
        <Link href={`/journal/${next.slug}`} className="group mx-auto mb-24 block max-w-4xl px-5 sm:px-8">
          <div className="border-t border-line pt-8">
            <p className="eyebrow text-muted">Read next</p>
            <p className="display mt-3 text-4xl transition group-hover:text-accent sm:text-5xl">{next.title} →</p>
          </div>
        </Link>
      )}
    </article>
  );
}

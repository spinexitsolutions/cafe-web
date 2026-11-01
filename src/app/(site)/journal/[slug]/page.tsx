"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ClipImg, Lines, RollText, Rule } from "@/components/motion/Kit";
import { Reveal } from "@/components/motion/Reveal";
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
      <header className="px-5 pb-10 pt-20 sm:px-8 lg:px-12 lg:pt-24">
        <Link href="/journal" className="group inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink"><ArrowLeft className="size-4" /> <RollText>Journal</RollText></Link>
        <div className="mt-6">
          <Rule />
          <div className="grid gap-4 pt-5 md:grid-cols-12">
            <div className="text-[13px] font-semibold md:col-span-3">
              <p><span className="text-accent">({post.tags[0]})</span></p>
              <p className="mt-2 text-muted">{post.author}</p>
              <p className="text-muted">{fmtDate(post.date)} · {post.readTime} min</p>
            </div>
            <h1 className="display text-[clamp(2.4rem,6.5vw,5.5rem)] uppercase leading-[0.95] md:col-span-9"><Lines text={post.title} onMount /></h1>
          </div>
        </div>
      </header>
      <div className="px-5 sm:px-8 lg:px-12"><ClipImg src={post.cover} alt={post.title} className="aspect-[16/9] rounded-[var(--radius)]" eager /></div>
      <div className="grid px-5 py-16 sm:px-8 md:grid-cols-12 lg:px-12">
        <div className="md:col-span-8 md:col-start-4 lg:col-span-6 lg:col-start-4">
        <p className="display display-n text-3xl leading-tight">{post.excerpt}</p>
        {blocks.map((b, i) =>
          b.startsWith("## ") ? (
            <Reveal key={i}>
              <h2 className="display mt-12 text-3xl uppercase">{b.slice(3).split("\n")[0]}</h2>
              {b.split("\n").slice(1).join(" ") && <p className="mt-4 text-lg leading-relaxed text-ink/80">{b.split("\n").slice(1).join(" ")}</p>}
            </Reveal>
          ) : (
            <Reveal key={i}><p className="mt-6 text-lg leading-relaxed text-ink/80">{b}</p></Reveal>
          ),
        )}
        </div>
      </div>
      {next && (
        <Link href={`/journal/${next.slug}`} className="group mb-24 block px-5 sm:px-8 lg:px-12">
          <div className="border-t border-ink/10 pt-6">
            <p className="text-[13px] font-semibold"><span className="text-accent">(→)</span> <span className="text-muted">Read next</span></p>
            <p className="display mt-3 text-[clamp(2rem,6vw,4.5rem)] uppercase leading-[0.95] transition group-hover:text-accent">{next.title} →</p>
          </div>
        </Link>
      )}
    </article>
  );
}

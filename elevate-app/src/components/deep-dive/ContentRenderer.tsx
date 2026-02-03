'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { SectionHeader, PathType } from './SectionHeader';
import { CalloutBox, CalloutVariant } from './CalloutBox';
import { ExpandableSection } from './ExpandableSection';
import { cn } from '@/lib/utils';

interface ContentRendererProps {
  content: string;
  pathType?: PathType;
  animated?: boolean;
  className?: string;
}

interface ParsedBlock {
  type: 'heading' | 'callout' | 'expandable' | 'paragraph' | 'list' | 'code';
  level?: 'h2' | 'h3';
  variant?: CalloutVariant;
  title?: string;
  content: string;
}

function parseContent(html: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];

  // Create a temporary div to parse HTML
  if (typeof window === 'undefined') {
    // Server-side: return content as-is
    return [{ type: 'paragraph', content: html }];
  }

  const div = document.createElement('div');
  div.innerHTML = html;

  const children = Array.from(div.children);

  for (const child of children) {
    const tagName = child.tagName.toLowerCase();

    // Handle headings
    if (tagName === 'h2') {
      blocks.push({
        type: 'heading',
        level: 'h2',
        content: child.textContent || '',
      });
      continue;
    }

    if (tagName === 'h3') {
      blocks.push({
        type: 'heading',
        level: 'h3',
        content: child.textContent || '',
      });
      continue;
    }

    // Handle callouts (blockquotes with specific classes)
    if (tagName === 'blockquote') {
      const classList = child.className || '';
      let variant: CalloutVariant = 'knowledge';

      if (classList.includes('callout-warning')) {
        variant = 'warning';
      } else if (classList.includes('callout-tip')) {
        variant = 'tip';
      } else if (classList.includes('callout-legendary')) {
        variant = 'legendary';
      }

      // Check for custom title in data attribute
      const customTitle = child.getAttribute('data-title') || undefined;

      blocks.push({
        type: 'callout',
        variant,
        title: customTitle,
        content: child.innerHTML,
      });
      continue;
    }

    // Handle expandable sections (details elements)
    if (tagName === 'details') {
      const summary = child.querySelector('summary');
      const title = summary?.textContent || 'More Details';
      const content = Array.from(child.children)
        .filter((c) => c.tagName.toLowerCase() !== 'summary')
        .map((c) => c.outerHTML)
        .join('');

      blocks.push({
        type: 'expandable',
        title,
        content,
      });
      continue;
    }

    // Handle code blocks
    if (tagName === 'pre') {
      blocks.push({
        type: 'code',
        content: child.innerHTML,
      });
      continue;
    }

    // Handle lists
    if (tagName === 'ul' || tagName === 'ol') {
      blocks.push({
        type: 'list',
        content: child.outerHTML,
      });
      continue;
    }

    // Default: treat as paragraph
    blocks.push({
      type: 'paragraph',
      content: child.outerHTML,
    });
  }

  return blocks;
}

export function ContentRenderer({
  content,
  pathType,
  animated = true,
  className,
}: ContentRendererProps) {
  const blocks = useMemo(() => parseContent(content), [content]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={animated ? containerVariants : undefined}
      initial={animated ? 'hidden' : undefined}
      animate={animated ? 'show' : undefined}
      className={cn('space-y-6', className)}
    >
      {blocks.map((block, index) => {
        const key = `block-${index}`;

        switch (block.type) {
          case 'heading':
            return (
              <motion.div key={key} variants={animated ? itemVariants : undefined}>
                <SectionHeader
                  title={block.content}
                  level={block.level}
                  pathType={pathType}
                  animated={false}
                />
              </motion.div>
            );

          case 'callout':
            return (
              <motion.div key={key} variants={animated ? itemVariants : undefined}>
                <CalloutBox
                  variant={block.variant || 'knowledge'}
                  title={block.title}
                  animated={false}
                >
                  <div dangerouslySetInnerHTML={{ __html: block.content }} />
                </CalloutBox>
              </motion.div>
            );

          case 'expandable':
            return (
              <motion.div key={key} variants={animated ? itemVariants : undefined}>
                <ExpandableSection title={block.title || 'More Details'} animated={false}>
                  <div dangerouslySetInnerHTML={{ __html: block.content }} />
                </ExpandableSection>
              </motion.div>
            );

          case 'code':
            return (
              <motion.div key={key} variants={animated ? itemVariants : undefined}>
                <pre
                  className={cn(
                    'p-4 rounded-xl overflow-x-auto',
                    'bg-[var(--background-tertiary)] border border-[var(--border)]',
                    'font-mono text-sm text-[var(--foreground)]'
                  )}
                  dangerouslySetInnerHTML={{ __html: block.content }}
                />
              </motion.div>
            );

          case 'list':
            return (
              <motion.div key={key} variants={animated ? itemVariants : undefined}>
                <div
                  className={cn(
                    'prose prose-invert max-w-none',
                    '[&_ul]:space-y-2 [&_ol]:space-y-2',
                    '[&_li]:text-[var(--foreground)]',
                    '[&_li::marker]:text-[var(--primary)]'
                  )}
                  dangerouslySetInnerHTML={{ __html: block.content }}
                />
              </motion.div>
            );

          case 'paragraph':
          default:
            return (
              <motion.div key={key} variants={animated ? itemVariants : undefined}>
                <div
                  className={cn(
                    'prose prose-invert max-w-none',
                    '[&_p]:text-[var(--foreground)] [&_p]:leading-relaxed',
                    '[&_strong]:text-[var(--primary)] [&_strong]:font-semibold',
                    '[&_em]:text-[var(--foreground-muted)]',
                    '[&_a]:text-[var(--accent)] [&_a]:underline [&_a]:underline-offset-2',
                    '[&_a:hover]:text-[var(--accent-hover)]'
                  )}
                  dangerouslySetInnerHTML={{ __html: block.content }}
                />
              </motion.div>
            );
        }
      })}
    </motion.div>
  );
}

export default ContentRenderer;

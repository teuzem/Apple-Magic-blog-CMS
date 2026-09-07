'use client'

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Link2,
  Loader2,
  MessageSquare,
  Reply,
  Send,
  Share2,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import SanityImage from '@/components/sanity/SanityImage'
import type { Comment } from '@/lib/sanity.queries'
import { cn } from '@/lib/utils'

interface CommentsProps {
  postId: string
}

interface TreeNode extends Comment {
  children: TreeNode[]
}

interface LocalImage {
  id: string
  file: File
  preview: string
}

const MAX_IMAGES = 10
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

function buildTree(comments: Comment[]): TreeNode[] {
  const map = new Map<string, TreeNode>()
  comments.forEach((c) => map.set(c._id, { ...c, children: [] }))
  const roots: TreeNode[] = []
  map.forEach((node) => {
    if (node.parent && map.has(node.parent)) {
      map.get(node.parent)!.children.push(node)
    } else {
      roots.push(node)
    }
  })
  return roots
}

function voteKey(postId: string, commentId: string) {
  return `amb-vote:${postId}:${commentId}`
}
function sharedKey(commentId: string) {
  return `amb-shared:${commentId}`
}

export default function Comments({ postId }: CommentsProps) {
  const t = useTranslations('comments')
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [content, setContent] = useState('')
  const [parent, setParent] = useState<Comment | null>(null)
  const [images, setImages] = useState<LocalImage[]>([])
  const [avatar, setAvatar] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [lightbox, setLightbox] = useState<{
    images: any[]
    index: number
  } | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    try {
      setAvatar(window.localStorage.getItem(`amb-avatar:${postId}`))
    } catch {}
  }, [postId])

  // Per-comment votes tracked in localStorage (no auth, still de-duped per browser).
  const [votes, setVotes] = useState<Record<string, 'like' | 'dislike'>>({})

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/comments?post=${postId}`)
        const data = await res.json()
        if (!cancelled) {
          const list: Comment[] = data.comments || []
          setComments(list)
          const v: Record<string, 'like' | 'dislike'> = {}
          list.forEach((c) => {
            const stored = window.localStorage.getItem(voteKey(postId, c._id))
            if (stored === 'like' || stored === 'dislike') v[c._id] = stored
          })
          setVotes(v)
        }
      } catch (e) {
        /* ignore */
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [postId])

  const tree = useMemo(() => buildTree(comments), [comments])

  const commentById = useCallback(
    (id: string): Comment | undefined => comments.find((c) => c._id === id),
    [comments],
  )

  const updateLocal = useCallback(
    (commentId: string, patch: Partial<Comment>) => {
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? { ...c, ...patch } : c)),
      )
    },
    [],
  )

  const react = useCallback(
    async (commentId: string, action: 'like' | 'dislike', delta: 1 | -1) => {
      if (delta === 1) {
        window.localStorage.setItem(voteKey(postId, commentId), action)
      } else {
        window.localStorage.removeItem(voteKey(postId, commentId))
      }
      setVotes((prev) => {
        const next = { ...prev }
        if (delta === 1) next[commentId] = action
        else delete next[commentId]
        return next
      })
      const field = action === 'like' ? 'likes' : 'dislikes'
      updateLocal(commentId, {
        [field]: Math.max(0, (commentById(commentId)?.[field] || 0) + delta),
      } as any)
      try {
        if (delta === 1) {
          await fetch('/api/comments', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: commentId, action }),
          })
        }
      } catch (e) {
        /* ignore */
      }
    },
    [commentById, postId, updateLocal],
  )

  async function handleShare(commentId: string) {
    const url = window.location.href.split('#')[0]
    const shareUrl = `${url}#comment-${commentId}`
    try {
      if (navigator.share) {
        await navigator.share({ title: document.title, url: shareUrl })
      } else {
        await navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (e) {
      /* cancelled */
    }
    if (!window.localStorage.getItem(sharedKey(commentId))) {
      window.localStorage.setItem(sharedKey(commentId), '1')
      updateLocal(commentId, {
        shares: (commentById(commentId)?.shares || 0) + 1,
      })
      try {
        await fetch('/api/comments', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: commentId, action: 'share' }),
        })
      } catch (e) {
        /* ignore */
      }
    }
  }

  function addImages(files: FileList | File[]) {
    const list = Array.from(files)
    const room = MAX_IMAGES - images.length
    if (room <= 0) {
      setError(t('tooManyImages'))
      return
    }
    const accepted = list.slice(0, room)
    const valid: LocalImage[] = []
    for (const file of accepted) {
      if (!file.type.startsWith('image/')) {
        setError(t('invalidImage'))
        continue
      }
      if (file.size > MAX_IMAGE_BYTES) {
        setError(t('imageTooLarge'))
        continue
      }
      valid.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        preview: URL.createObjectURL(file),
      })
    }
    setImages((prev) => [...prev, ...valid])
    setError('')
  }

  function removeImage(id: string) {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id)
      if (img) URL.revokeObjectURL(img.preview)
      return prev.filter((i) => i.id !== id)
    })
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !content.trim()) return
    if (images.length > MAX_IMAGES) {
      setError(t('tooManyImages'))
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const dataUrls = await Promise.all(
        images.map(
          (img) =>
            new Promise<string>((resolve, reject) => {
              const reader = new FileReader()
              reader.onload = () => resolve(reader.result as string)
              reader.onerror = () => reject(reader.error)
              reader.readAsDataURL(img.file)
            }),
        ),
      )
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          name,
          email,
          content,
          parent: parent?._id,
          images: dataUrls,
          avatar,
        }),
      })
      if (res.ok) {
        setSuccess(true)
        setName('')
        setEmail('')
        setContent('')
        setParent(null)
        setImages((prev) => {
          prev.forEach((i) => URL.revokeObjectURL(i.preview))
          return []
        })
        const fresh = await fetch(`/api/comments?post=${postId}`)
        const data = await fresh.json()
        setComments(data.comments || [])
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || t('submitError'))
      }
    } catch (e) {
      setError(t('submitError'))
    } finally {
      setSubmitting(false)
    }
  }

  function focusForm() {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <section
      id="comments"
      className="mt-12 border-t border-gray-7 pt-8 dark:border-gray-2"
    >
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-ink dark:text-white">
          <MessageSquare size={20} className="text-apple-blue" />
          {t('count', { count: comments.length })}
        </h2>
      </div>

      {/* Comment tree */}
      {loading ? (
        <p className="mt-4 animate-pulse text-sm text-gray-4">Loading…</p>
      ) : tree.length > 0 ? (
        <ul className="mt-6 space-y-4">
          {tree.map((node) => (
            <CommentNode
              key={node._id}
              node={node}
              depth={0}
              votes={votes}
              copied={copied}
              onVote={(id, action, delta) => react(id, action, delta)}
              onShare={handleShare}
              onReply={(c) => {
                setParent(c)
                setSuccess(false)
                focusForm()
              }}
              onOpenGallery={(images, index) => setLightbox({ images, index })}
            />
          ))}
        </ul>
      ) : (
        !success && (
          <p className="mt-4 text-sm text-gray-3 dark:text-gray-4">
            {t('empty')}
          </p>
        )
      )}

      {/* Form */}
      {success ? (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-success/30 bg-success/5 p-4 text-sm font-medium text-success">
          <CheckCircle2 size={18} />
          {t('submitSuccess')}
        </div>
      ) : (
        <form
          ref={formRef}
          onSubmit={submit}
          className="mt-6 space-y-3 rounded-xl border border-gray-7 p-5 dark:border-gray-2"
        >
          {parent && (
            <div className="flex items-center justify-between rounded-xl bg-apple-blue/5 px-3 py-2 text-sm text-apple-blue">
              <span className="inline-flex items-center gap-2">
                <Reply size={14} />
                {t('replyingTo', { name: parent.name })}
              </span>
              <button
                type="button"
                onClick={() => setParent(null)}
                className="inline-flex items-center gap-1 text-xs hover:underline"
              >
                <X size={13} /> {t('cancelReply')}
              </button>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={60}
              placeholder={t('name')}
              className="h-11 rounded-xl border border-gray-5 bg-white px-4 text-sm outline-none transition-colors placeholder:text-gray-3 focus:border-apple-blue focus:ring-2 focus:ring-apple-blue/30 dark:border-gray-2 dark:bg-gray-1 dark:text-white"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder={t('email')}
              className="h-11 rounded-xl border border-gray-5 bg-white px-4 text-sm outline-none transition-colors placeholder:text-gray-3 focus:border-apple-blue focus:ring-2 focus:ring-apple-blue/30 dark:border-gray-2 dark:bg-gray-1 dark:text-white"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="group relative h-20 w-20 shrink-0 self-center overflow-hidden rounded-full ring-2 ring-white ring-offset-2 ring-offset-gray-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue sm:h-[4.5rem] sm:w-[4.5rem] sm:self-start dark:ring-offset-gray-1"
              aria-label={t('changeAvatar')}
            >
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatar}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span
                  className="flex h-full w-full items-center justify-center text-xl font-semibold text-white"
                  style={{
                    background:
                      'linear-gradient(135deg,#ff375f,#bf5af2,#2997ff)',
                  }}
                >
                  {(name.trim()[0] || 'G').toUpperCase()}
                </span>
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100">
                <UploadCloud size={22} />
              </span>
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file || file.size > MAX_IMAGE_BYTES) return
                const reader = new FileReader()
                reader.onload = () => {
                  const value = String(reader.result)
                  setAvatar(value)
                  try {
                    window.localStorage.setItem(`amb-avatar:${postId}`, value)
                  } catch {}
                }
                reader.readAsDataURL(file)
                e.target.value = ''
              }}
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={4}
              maxLength={2000}
              placeholder={parent ? t('replyPlaceholder') : t('placeholder')}
              className="w-full rounded-xl border border-gray-5 bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-gray-3 focus:border-apple-blue focus:ring-2 focus:ring-apple-blue/30 dark:border-gray-2 dark:bg-gray-1 dark:text-white"
            />
          </div>

          {/* Image upload previews */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-gray-6 dark:border-gray-2"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.preview}
                    alt={img.file.name}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    aria-label={t('removeImage')}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-gray-5 bg-gray-8 px-4 py-4 text-center transition-colors hover:border-apple-blue hover:bg-apple-blue/5 dark:border-gray-2 dark:bg-gray-1">
            <ImagePlus size={20} className="text-apple-blue" />
            <span className="text-sm font-medium text-apple-blue">
              {t('addImages', { count: MAX_IMAGES - images.length })}
            </span>
            <span className="text-xs text-gray-4">{t('imageDropHint')}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) addImages(e.target.files)
                e.target.value = ''
              }}
            />
          </label>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-center text-xs text-gray-4 sm:text-left">
              {t('loginHint')}
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-apple-blue px-6 text-sm font-medium text-white transition-all hover:bg-apple-blue-hover disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              {t('submit')}
            </button>
          </div>
        </form>
      )}

      <p className="mt-4 text-center text-xs text-gray-4">
        {t('moderationNote')}
      </p>

      {/* Lightbox */}
      {lightbox && (
        <Lightbox
          images={lightbox.images}
          initial={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
    </section>
  )
}

/* ------------------------------------------------------------------ */

function CommentNode({
  node,
  depth,
  votes,
  copied,
  onVote,
  onShare,
  onReply,
  onOpenGallery,
}: {
  node: TreeNode
  depth: number
  votes: Record<string, 'like' | 'dislike'>
  copied: boolean
  onVote: (id: string, action: 'like' | 'dislike', delta: 1 | -1) => void
  onShare: (id: string) => void
  onReply: (comment: Comment) => void
  onOpenGallery: (images: any[], index: number) => void
}) {
  const t = useTranslations('comments')
  const myVote = votes[node._id]
  const likes = node.likes || 0
  const dislikes = node.dislikes || 0
  const shares = node.shares || 0
  const images = node.images || []

  return (
    <li className={cn(depth > 0 && 'mt-3')}>
      <div
        id={`comment-${node._id}`}
        className={cn(
          'rounded-xl border border-gray-7 p-5 dark:border-gray-2',
          depth > 0 && 'bg-gray-8/60 dark:bg-gray-1/60',
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-3">
            {node.avatar ? (
              <SanityImage
                asset={node.avatar}
                alt=""
                width={112}
                height={112}
                className="h-12 w-12 shrink-0 rounded-full sm:h-14 sm:w-14"
              />
            ) : (
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold text-white sm:h-14 sm:w-14 sm:text-lg"
                style={{
                  background: 'linear-gradient(135deg,#ff375f,#bf5af2,#2997ff)',
                }}
              >
                {(node.name[0] || 'G').toUpperCase()}
              </span>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight text-ink dark:text-white">
                {node.name}
              </p>
              <p className="text-xs text-gray-3 dark:text-gray-4">
                {new Date(node.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <p className="mt-3 text-[0.9375rem] leading-relaxed text-gray-2 dark:text-gray-8">
          {node.content}
        </p>

        {/* Comment images gallery */}
        {images.length > 0 && (
          <div
            className={cn(
              'mt-3 grid gap-2',
              images.length === 1
                ? 'max-w-md'
                : images.length === 2
                  ? 'grid-cols-2'
                  : 'grid-cols-2 sm:grid-cols-3',
            )}
          >
            {images.map((img, idx) => (
              <button
                key={img._key || idx}
                type="button"
                onClick={() => onOpenGallery(images, idx)}
                className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-gray-6 dark:border-gray-2"
              >
                <SanityImage
                  asset={img}
                  alt={img.alt || `Comment image ${idx + 1}`}
                  fill
                  rounded={false}
                  className="transition-transform duration-300 group-hover:scale-105"
                />
                {images.length > 3 && idx === 2 && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-lg font-semibold text-white">
                    +{images.length - 3}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Reactions */}
        <div className="mt-3 flex flex-wrap items-center gap-1">
          <ReactionButton
            active={myVote === 'like'}
            label={t('like')}
            count={likes}
            icon={<ThumbsUp size={15} />}
            activeClass="text-success"
            onClick={() => onVote(node._id, 'like', myVote === 'like' ? -1 : 1)}
          />
          <ReactionButton
            active={myVote === 'dislike'}
            label={t('dislike')}
            count={dislikes}
            icon={<ThumbsDown size={15} />}
            activeClass="text-red-500"
            onClick={() =>
              onVote(node._id, 'dislike', myVote === 'dislike' ? -1 : 1)
            }
          />
          <ReactionButton
            active={false}
            label={t('share')}
            count={shares}
            icon={copied ? <Link2 size={14} /> : <Share2 size={14} />}
            onClick={() => onShare(node._id)}
          />
          <button
            type="button"
            onClick={() => onReply(node)}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-gray-3 transition-colors hover:bg-gray-7 hover:text-apple-blue dark:text-gray-5 dark:hover:bg-gray-2"
          >
            <Reply size={13} /> {t('reply')}
          </button>
        </div>
      </div>

      {node.children.length > 0 && (
        <ul
          className={cn(
            'space-y-3 border-l-2 border-gray-7 pl-4 dark:border-gray-2',
            depth === 0 && 'ml-7 mt-3',
          )}
        >
          {node.children.map((child) => (
            <CommentNode
              key={child._id}
              node={child}
              depth={depth + 1}
              votes={votes}
              copied={copied}
              onVote={onVote}
              onShare={onShare}
              onReply={onReply}
              onOpenGallery={onOpenGallery}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

function ReactionButton({
  active,
  label,
  count,
  icon,
  activeClass,
  onClick,
}: {
  active: boolean
  label: string
  count: number
  icon: React.ReactNode
  activeClass?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-gray-3 transition-colors hover:bg-gray-7 dark:text-gray-5 dark:hover:bg-gray-2',
        active && activeClass,
      )}
    >
      {icon}
      {count > 0 && <span>{count}</span>}
    </button>
  )
}

function Lightbox({
  images,
  initial,
  onClose,
}: {
  images: any[]
  initial: number
  onClose: () => void
}) {
  const [index, setIndex] = useState(initial)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % images.length)
      if (e.key === 'ArrowLeft')
        setIndex((i) => (i - 1 + images.length) % images.length)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [images.length, onClose])

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
      >
        <X size={22} />
      </button>
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIndex((i) => (i - 1 + images.length) % images.length)
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIndex((i) => (i + 1) % images.length)
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}
      <div
        className="relative max-h-[85vh] max-w-[90vw] overflow-hidden rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-video w-full max-w-4xl">
          <SanityImage asset={images[index]} alt="" fill rounded={false} />
        </div>
        {images.length > 1 && (
          <div className="flex items-center justify-between bg-black/60 px-4 py-2 text-sm text-white">
            <span>
              {index + 1} / {images.length}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

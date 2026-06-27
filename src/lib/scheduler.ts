import { db } from './db'

/**
 * Promote any SCHEDULED posts whose publishedAt time has arrived to PUBLISHED.
 * Called at the top of read paths so scheduling "just works" without a cron job.
 * Cheap: a single UPDATE … WHERE with no result set.
 */
export async function publishDueScheduledPosts(): Promise<number> {
  try {
    const result = await db.post.updateMany({
      where: {
        status: 'SCHEDULED',
        publishedAt: { lte: new Date() },
      },
      data: { status: 'PUBLISHED' },
    })
    return result.count
  } catch {
    return 0
  }
}

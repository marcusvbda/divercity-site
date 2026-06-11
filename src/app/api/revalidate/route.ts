import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  const tag = request.nextUrl.searchParams.get('tag')

  if (
    !process.env.REVALIDATE_SECRET ||
    secret !== process.env.REVALIDATE_SECRET
  ) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }

  if (tag) {
    revalidateTag(tag, 'hours')
    return NextResponse.json({ revalidated: true, tag, now: Date.now() })
  }

  revalidateTag('cms', 'hours')
  revalidatePath('/', 'page')

  return NextResponse.json({ revalidated: true, now: Date.now() })
}

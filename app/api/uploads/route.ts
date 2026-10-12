import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

export const runtime = 'nodejs';

const MAX_BYTES = 5 * 1024 * 1024;

function imageExtension(bytes: Uint8Array): 'jpg' | 'png' | 'webp' | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpg';
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) return 'png';
  // if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP') return 'webp';
  // if ( bytes.length >= 12 && String.fromCharCode.apply(null, Array.from(bytes.slice(0, 4))) === 'RIFF' && String.fromCharCode.apply(null, Array.from(bytes.slice(8, 12))) === 'WEBP') {  return 'webp';}
  if (bytes.length >= 12 &&String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]) === 'RIFF' &&String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]) === 'WEBP') {return 'webp'; }
  return null;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 });

  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return NextResponse.json({ error: 'Choose an image to upload.' }, { status: 400 });
    if (file.size === 0 || file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Images must be smaller than 5 MB.' }, { status: 400 });
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const extension = imageExtension(bytes);
    if (!extension) {
      return NextResponse.json({ error: 'Only valid JPEG, PNG and WebP images are supported.' }, { status: 415 });
    }

    // Local filesystem storage is suitable for local development only. Before deployment,
    // replace this with private, provider-backed object storage and per-user ownership rules.
    const directory = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(directory, { recursive: true });
    const filename = `${randomUUID()}.${extension}`;
    await writeFile(path.join(directory, filename), bytes, { flag: 'wx' });

    return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
  } catch (error) {
    console.error('Image upload failed:', error);
    return NextResponse.json({ error: 'Image upload failed. Please try again.' }, { status: 500 });
  }
}

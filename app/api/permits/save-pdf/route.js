import { put } from '@vercel/blob';
import { renderToBuffer } from '@react-pdf/renderer';
import MyDocument from '@/components/ui/MyDocument';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const body = await request.json();
  const { documentData, serverFilename } = body;

  if (!documentData || !serverFilename) {
    return NextResponse.json({ message: 'documentData va serverFilename kerak' }, { status: 400 });
  }

  // PDF ni buffer ga render qilish
  const buffer = await renderToBuffer(<MyDocument data={documentData} />);

  // Vercel Blob ga yuklash
  const blob = await put(`pdfs/${serverFilename}`, buffer, {
    access: 'public',
    contentType: 'application/pdf',
  });

  return NextResponse.json({ url: blob.url }, { status: 201 });
}

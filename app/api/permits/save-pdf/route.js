import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import MyDocument from '@/components/ui/MyDocument';

const pdfDir = path.join(process.cwd(), 'public', 'pdfs');

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9_.-]/g, '_');
}

function streamToFile(stream, outputPath) {
  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(outputPath);
    stream.pipe(writeStream);
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });
}

export async function POST(request) {
  const body = await request.json();
  const { documentData, filename } = body;

  if (!documentData) {
    return NextResponse.json({ message: 'documentData is required' }, { status: 400 });
  }

  if (!fs.existsSync(pdfDir)) {
    fs.mkdirSync(pdfDir, { recursive: true });
  }

  const safeFilename = sanitizeFilename(filename || 'permit.pdf');
  const id = crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const outputFileName = `${id}-${safeFilename}`;
  const outputPath = path.join(pdfDir, outputFileName);

  const pdfStream = await renderToStream(<MyDocument data={documentData} />);
  await streamToFile(pdfStream, outputPath);

  const url = `/pdfs/${outputFileName}`;
  return NextResponse.json({ url }, { status: 201 });
}

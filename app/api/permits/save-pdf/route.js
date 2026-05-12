import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import MyDocument from '@/components/ui/MyDocument';

const pdfDir = path.join(process.cwd(), 'public', 'pdfs');

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
  const { documentData, serverFilename } = body;

  if (!documentData || !serverFilename) {
    return NextResponse.json({ message: 'documentData va serverFilename kerak' }, { status: 400 });
  }

  if (!fs.existsSync(pdfDir)) {
    fs.mkdirSync(pdfDir, { recursive: true });
  }

  const outputPath = path.join(pdfDir, serverFilename);
  const pdfStream = await renderToStream(<MyDocument data={documentData} />);
  await streamToFile(pdfStream, outputPath);

  const url = `/pdfs/${serverFilename}`;
  return NextResponse.json({ url }, { status: 201 });
}

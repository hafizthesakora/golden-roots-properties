import 'server-only';

function getAuth() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { google } = require('googleapis');
  return new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
}

export async function uploadToDrive(name: string, mimeType: string, buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { google } = require('googleapis');
  const auth = getAuth();
  const drive = google.drive({ version: 'v3', auth });
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Readable } = require('stream') as typeof import('stream');
  const stream = new Readable({ read() {} });
  stream.push(buffer);
  stream.push(null);
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const res = await drive.files.create({
    requestBody: { name, parents: folderId ? [folderId] : undefined },
    media: { mimeType, body: stream },
    fields: 'id',
    supportsAllDrives: true,
  });
  if (!res.data.id) throw new Error('Google Drive upload failed — no file ID returned');
  return res.data.id as string;
}

export async function downloadFromDrive(fileId: string): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { google } = require('googleapis');
  const auth = getAuth();
  const drive = google.drive({ version: 'v3', auth });
  const res = await drive.files.get({ fileId, alt: 'media', supportsAllDrives: true }, { responseType: 'arraybuffer' });
  return Buffer.from(res.data as ArrayBuffer);
}

export async function deleteFromDrive(fileId: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { google } = require('googleapis');
  const auth = getAuth();
  const drive = google.drive({ version: 'v3', auth });
  await drive.files.delete({ fileId, supportsAllDrives: true });
}

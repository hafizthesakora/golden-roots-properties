import 'server-only';

const FOLDER = 'golden-roots';

function getCloudinary() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const cloudinary = require('cloudinary').v2;
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  return cloudinary;
}

export async function uploadToCloudinary(
  name: string,
  mimeType: string,
  buffer: Buffer
): Promise<string> {
  const cloudinary = getCloudinary();

  // Determine resource type
  const resourceType = mimeType.startsWith('image/')
    ? 'image'
    : mimeType.startsWith('video/')
    ? 'video'
    : 'raw';

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: FOLDER,
        public_id: `${Date.now()}-${name.replace(/[^a-zA-Z0-9._-]/g, '_')}`,
        resource_type: resourceType,
        use_filename: true,
        unique_filename: false,
        overwrite: false,
      },
      (error: unknown, result: { public_id: string }) => {
        if (error) return reject(error);
        resolve(result.public_id);
      }
    );
    uploadStream.end(buffer);
  });
}

export async function downloadFromCloudinary(publicId: string, mimeType: string): Promise<Buffer> {
  const cloudinary = getCloudinary();

  const resourceType = mimeType.startsWith('image/')
    ? 'image'
    : mimeType.startsWith('video/')
    ? 'video'
    : 'raw';

  const url = cloudinary.url(publicId, { resource_type: resourceType, sign_url: true });

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download file: ${res.statusText}`);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function deleteFromCloudinary(publicId: string, mimeType: string): Promise<void> {
  const cloudinary = getCloudinary();

  const resourceType = mimeType.startsWith('image/')
    ? 'image'
    : mimeType.startsWith('video/')
    ? 'video'
    : 'raw';

  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

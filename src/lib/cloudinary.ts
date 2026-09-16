import crypto from 'crypto';

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  bytes: number;
  format?: string;
  resource_type: 'image' | 'video' | 'raw';
  width?: number;
  height?: number;
  duration?: number;
  created_at?: string;
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

export function getCloudinaryStatus() {
  const configured = isCloudinaryConfigured();
  return {
    configured,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || null,
    provider: 'Cloudinary CDN',
    status: configured ? 'OPERATIONAL' : 'NOT_CONFIGURED',
  };
}

/**
 * Upload an in-memory file buffer directly to Cloudinary using signed upload
 */
export async function uploadBufferToCloudinary(
  buffer: Buffer,
  options: {
    filename: string;
    folder?: string;
    mimeType?: string;
    tags?: string[];
  }
): Promise<CloudinaryUploadResult> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary environment variables (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are not configured');
  }

  // Determine resource type
  const isVideo = options.mimeType?.startsWith('video/') ||
    /\.(mp4|mov|webm|avi|mkv|m4v)$/i.test(options.filename);
  const resourceType = isVideo ? 'video' : 'image';

  const timestamp = Math.round(Date.now() / 1000);
  const cleanFolder = options.folder && options.folder !== 'Root'
    ? `socialflow/${options.folder.replace(/[^a-zA-Z0-9_-]/g, '_')}`
    : 'socialflow/root';

  // Prepare parameters for signature
  const paramsToSign: Record<string, string> = {
    folder: cleanFolder,
    timestamp: timestamp.toString(),
  };

  if (options.tags && options.tags.length > 0) {
    paramsToSign.tags = options.tags.join(',');
  }

  // Sort keys alphabetically for Cloudinary signature specification
  const sortedKeys = Object.keys(paramsToSign).sort();
  const stringToSign = sortedKeys.map((key) => `${key}=${paramsToSign[key]}`).join('&') + apiSecret;
  const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

  // Build FormData
  const formData = new FormData();
  const blob = new Blob([new Uint8Array(buffer)], { type: options.mimeType || (isVideo ? 'video/mp4' : 'image/jpeg') });
  formData.append('file', blob, options.filename);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp.toString());
  formData.append('folder', cleanFolder);
  formData.append('signature', signature);

  if (options.tags && options.tags.length > 0) {
    formData.append('tags', options.tags.join(','));
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.error?.message || `Cloudinary upload failed with status ${response.status}`;
    console.error('Cloudinary upload error:', errorMsg);
    throw new Error(errorMsg);
  }

  return {
    secure_url: data.secure_url,
    public_id: data.public_id,
    bytes: data.bytes || buffer.length,
    format: data.format,
    resource_type: resourceType,
    width: data.width,
    height: data.height,
    duration: data.duration,
    created_at: data.created_at,
  };
}

/**
 * Permanently delete an asset from Cloudinary storage
 */
export async function destroyFromCloudinary(
  publicId: string,
  resourceType: 'image' | 'video' = 'image'
): Promise<{ success: boolean; result?: string; error?: string }> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return { success: false, error: 'Cloudinary credentials missing' };
  }

  try {
    const timestamp = Math.round(Date.now() / 1000);
    const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    return {
      success: data.result === 'ok' || data.result === 'not found',
      result: data.result,
    };
  } catch (err: any) {
    console.error('Cloudinary destroy error:', err);
    return { success: false, error: err.message };
  }
}

const crypto = require('crypto');
require('dotenv').config();

async function testCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  console.log('Testing Cloudinary Credentials:');
  console.log('Cloud Name:', cloudName);
  console.log('API Key:', apiKey);
  console.log('API Secret exists:', Boolean(apiSecret));

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Missing Cloudinary credentials in .env');
  }

  // Create a 1x1 transparent PNG buffer for testing
  const dummyPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const buffer = Buffer.from(dummyPngBase64, 'base64');

  const timestamp = Math.round(Date.now() / 1000);
  const folder = 'socialflow/test';
  
  const paramsToSign = {
    folder,
    timestamp: timestamp.toString(),
  };

  const sortedKeys = Object.keys(paramsToSign).sort();
  const stringToSign = sortedKeys.map(k => `${k}=${paramsToSign[k]}`).join('&') + apiSecret;
  const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

  const formData = new FormData();
  formData.append('file', new Blob([buffer], { type: 'image/png' }), 'test-ping.png');
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp.toString());
  formData.append('folder', folder);
  formData.append('signature', signature);

  console.log('Sending test upload to Cloudinary...');
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    console.error('Cloudinary upload error response:', data);
    throw new Error(data.error?.message || 'Upload failed');
  }

  console.log('✓ Cloudinary Upload SUCCESSFUL!');
  console.log('URL:', data.secure_url);
  console.log('Public ID:', data.public_id);
  console.log('Format:', data.format);
  console.log('Bytes:', data.bytes);

  // Now test destroy
  const destroyTimestamp = Math.round(Date.now() / 1000);
  const destroyStringToSign = `public_id=${data.public_id}&timestamp=${destroyTimestamp}${apiSecret}`;
  const destroySig = crypto.createHash('sha1').update(destroyStringToSign).digest('hex');

  const destroyFormData = new FormData();
  destroyFormData.append('public_id', data.public_id);
  destroyFormData.append('api_key', apiKey);
  destroyFormData.append('timestamp', destroyTimestamp.toString());
  destroyFormData.append('signature', destroySig);

  console.log('Testing destroy of test image...');
  const destroyRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: 'POST',
    body: destroyFormData,
  });
  const destroyData = await destroyRes.json();
  console.log('Destroy result:', destroyData);
}

testCloudinary().catch(err => {
  console.error('FAILED:', err.message);
  process.exit(1);
});

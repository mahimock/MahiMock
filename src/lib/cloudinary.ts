
const MAX_RETRIES = 3;
const TIMEOUT_MS = 60000; // 60 seconds

export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  const cloudName = 'u0cluclj';
  const uploadPreset = 'mahimock_upload';
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const formData = new FormData();
  formData.append('upload_preset', uploadPreset);
  formData.append('file', file);

  let lastError: any;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      console.log(`Cloudinary upload attempt ${attempt} to ${uploadUrl}...`);
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Cloudinary error response:', errorData);
        throw new Error(errorData.error?.message || `Upload failed with status ${response.status}`);
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error: any) {
      clearTimeout(timeoutId);
      lastError = error;
      
      if (attempt < MAX_RETRIES && (error.name === 'AbortError' || error.message?.includes('network') || error.message?.includes('fetch'))) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }
      break;
    }
  }

  throw lastError;
};

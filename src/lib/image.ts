export async function compressImageDataUrl(dataUrl: string, maxDimension = 1280, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      const scale = Math.min(1, maxDimension / Math.max(width, height));
      width = Math.round(width * scale);
      height = Math.round(height * scale);

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas not supported'));
      ctx.drawImage(img, 0, 0, width, height);

      // Prefer original mime when possible; otherwise fallback to JPEG
      const mimeMatch = dataUrl.match(/^data:(.*?);base64,/i);
      const originalMime = mimeMatch?.[1] || 'image/jpeg';
      const outputMime = originalMime.startsWith('image/') ? originalMime : 'image/jpeg';
      try {
        const out = canvas.toDataURL(outputMime, quality);
        resolve(out);
      } catch (e) {
        // Fallback to jpeg
        resolve(canvas.toDataURL('image/jpeg', quality));
      }
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}
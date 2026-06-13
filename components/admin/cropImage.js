/**
 * Renders the cropped portion of an image onto a canvas and resolves with a Blob.
 * `pixelCrop` comes from react-easy-crop's onCropComplete callback.
 */
export default function getCroppedImageBlob(imageSrc, pixelCrop) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(pixelCrop.width);
      canvas.height = Math.round(pixelCrop.height);
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Canvas is not supported"));
        return;
      }

      ctx.drawImage(
        image,
        Math.round(pixelCrop.x),
        Math.round(pixelCrop.y),
        Math.round(pixelCrop.width),
        Math.round(pixelCrop.height),
        0,
        0,
        Math.round(pixelCrop.width),
        Math.round(pixelCrop.height)
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Could not create image"));
            return;
          }
          resolve(blob);
        },
        "image/jpeg",
        0.92
      );
    };

    image.onerror = () => reject(new Error("Could not load image"));
    image.src = imageSrc;
  });
}

import sharp from "sharp";

const source = "public/images/profile/akshay-ram-chavan.png";
const destination = "public/images/profile/akshay-ram-chavan-transparent.png";
const { data, info } = await sharp(source)
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height } = info;
const pixelCount = width * height;
const output = Buffer.alloc(pixelCount * 4);
const feather = 3;

for (let y = 0; y < height; y++) {
  let left = width;
  let right = -1;
  for (let x = 0; x < width; x++) {
    const offset = (y * width + x) * 3;
    if (Math.min(data[offset], data[offset + 1], data[offset + 2]) < 218) {
      left = Math.min(left, x);
      right = Math.max(right, x);
    }
  }

  for (let x = 0; x < width; x++) {
    const index = y * width + x;
    const sourceOffset = index * 3;
    const outputOffset = index * 4;
    output[outputOffset] = data[sourceOffset];
    output[outputOffset + 1] = data[sourceOffset + 1];
    output[outputOffset + 2] = data[sourceOffset + 2];

    if (right < 0 || x < left || x > right) {
      output[outputOffset + 3] = 0;
    } else {
      const edgeDistance = Math.min(x - left, right - x);
      output[outputOffset + 3] = Math.min(
        255,
        Math.round((edgeDistance / feather) * 255),
      );
    }
  }
}

await sharp(output, { raw: { width, height, channels: 4 } })
  .png({ compressionLevel: 9 })
  .toFile(destination);

console.log(`Created ${destination}`);

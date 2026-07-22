const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { processImageJob } = require('./src/workers/imageWorker');

(async () => {
  const dir = path.join(process.cwd(), 'uploads');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'test-image.png');

  await sharp({
    create: {
      width: 400,
      height: 300,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .png()
    .toFile(file);

  const result = await processImageJob({ processingId: 'demo-123', imagePath: file });
  console.log(JSON.stringify(result, null, 2));
})().catch((err) => {
  console.error(err);
  process.exit(1);
});

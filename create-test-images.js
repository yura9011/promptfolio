import sharp from 'sharp';
import fs from 'fs/promises';

// Create simple test images
async function createTestImages() {
  console.log('Creating test images...');

  // Create a small red square (anime-girl.png)
  await sharp({
    create: {
      width: 100,
      height: 100,
      channels: 3,
      background: { r: 255, g: 100, b: 150 }
    }
  })
  .png()
  .toFile('test-images/anime-girl.png');
  console.log('✓ Created anime-girl.png');

  // Create a small blue square (dragon.png)
  await sharp({
    create: {
      width: 100,
      height: 100,
      channels: 3,
      background: { r: 50, g: 100, b: 200 }
    }
  })
  .png()
  .toFile('test-images/dragon.png');
  console.log('✓ Created dragon.png');

  // Create a small purple square (cyberpunk.jpg)
  await sharp({
    create: {
      width: 100,
      height: 100,
      channels: 3,
      background: { r: 150, g: 50, b: 200 }
    }
  })
  .jpeg()
  .toFile('test-images/cyberpunk.jpg');
  console.log('✓ Created cyberpunk.jpg');

  console.log('\nTest images created successfully!');
}

createTestImages().catch(console.error);

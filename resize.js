import Jimp from 'jimp';
import path from 'path';

async function main() {
    const imagePath = path.resolve('public/og-image.png');
    console.log('Reading:', imagePath);
    const image = await Jimp.read(imagePath);
    await image.resize(1200, 630).writeAsync(imagePath);
    console.log('Resized successfully');
}

main().catch(console.error);

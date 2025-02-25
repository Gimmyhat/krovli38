import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const images = {
  hero: [
    {
      url: 'https://images.unsplash.com/photo-1525438160292-a4a860951216?auto=format&fit=crop&q=80&w=1920',
      filename: 'hero-bg.jpg'
    }
  ],
  services: [
    {
      url: 'https://images.unsplash.com/photo-1461695008884-244cb4543d74?auto=format&fit=crop&q=80&w=800',
      filename: 'service-1.jpg'
    },
    {
      url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=800',
      filename: 'service-2.jpg'
    },
    {
      url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800',
      filename: 'service-3.jpg'
    }
  ],
  gallery: [
    {
      url: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&q=80&w=800',
      filename: 'gallery-1.jpg'
    },
    {
      url: 'https://images.unsplash.com/photo-1518481612222-68bbe828ecd1?auto=format&fit=crop&q=80&w=800',
      filename: 'gallery-2.jpg'
    },
    {
      url: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&q=80&w=800',
      filename: 'gallery-3.jpg'
    },
    {
      url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800',
      filename: 'gallery-4.jpg'
    },
    {
      url: 'https://images.unsplash.com/photo-1605152276897-4f618f831968?auto=format&fit=crop&q=80&w=800',
      filename: 'gallery-5.jpg'
    },
    {
      url: 'https://images.unsplash.com/photo-1591588582259-e675bd2e6088?auto=format&fit=crop&q=80&w=800',
      filename: 'gallery-6.jpg'
    }
  ]
};

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`Downloaded: ${filepath}`);
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(filepath, () => reject(err));
      });
    }).on('error', reject);
  });
}

async function downloadAllImages() {
  for (const [category, categoryImages] of Object.entries(images)) {
    const dirPath = path.join(__dirname, '..', 'public', 'images', category);
    
    // Создаем директорию, если она не существует
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    for (const image of categoryImages) {
      const filepath = path.join(dirPath, image.filename);
      try {
        await downloadImage(image.url, filepath);
      } catch (error) {
        console.error(`Error downloading ${image.url}:`, error);
      }
    }
  }
}

downloadAllImages().then(() => {
  console.log('All images downloaded successfully!');
}).catch((error) => {
  console.error('Error downloading images:', error);
}); 
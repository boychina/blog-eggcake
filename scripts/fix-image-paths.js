const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.join(__dirname, '..', '_posts');

function fixInlineImagePaths() {
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
  files.forEach(file => {
    const slug = file.replace(/\.md$/, '');
    const fullPath = path.join(POSTS_DIR, file);
    let content = fs.readFileSync(fullPath, 'utf8');

    // Replace external asset links to local paths
    // 1) context path: preserve directory name
    content = content.replace(/https?:\/\/assets\.eggcake\.cn\/context\/([^\s)"']+)/gi, (m, rest) => {
      return `/assets/blog/context/${rest}`;
    });

    // 2) root domain image files (non-cover): map to slug directory
    content = content.replace(/https?:\/\/assets\.eggcake\.cn\/(?!cover\/)([\w\-+&.%@?=()]+\.(?:png|jpg|jpeg|gif))/gi, (match, filename) => {
      return `/assets/blog/context/${slug}/${filename}`;
    });

    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated inline images in: ${file}`);
  });
}

fixInlineImagePaths();
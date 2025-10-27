const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.join(__dirname, '..', '_posts');

function fixInlineImagePaths() {
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
  files.forEach(file => {
    const slug = file.replace(/\.md$/, '');
    const fullPath = path.join(POSTS_DIR, file);
    let content = fs.readFileSync(fullPath, 'utf8');

    // Replace external asset links (non-cover) to local context path
    // Examples handled:
    // ![](http://assets.eggcake.cn/PWAR-007.jpg)
    // <img src="http://assets.eggcake.cn/keep-calm-and-learn-javascript.png" />
    // [label](http://assets.eggcake.cn/Ciqc1F8...) etc.
    const domainPattern = /http:\/\/assets\.eggcake\.cn\/(?!cover\/)([\w\-+&.%@?=()]+\.(?:png|jpg|jpeg|gif))/gi;
    content = content.replace(domainPattern, (match, filename) => {
      return `/assets/blog/context/${slug}/${filename}`;
    });

    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated inline images in: ${file}`);
  });
}

fixInlineImagePaths();
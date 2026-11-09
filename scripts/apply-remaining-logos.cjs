const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      },
      timeout: 10000
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (redirectUrl.startsWith('/')) {
          const u = new URL(url);
          redirectUrl = `${u.protocol}//${u.host}${redirectUrl}`;
        }
        return downloadBuffer(redirectUrl).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Status ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve({ buffer: Buffer.concat(chunks), contentType: res.headers['content-type'] }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error(`Timeout for ${url}`)); });
  });
}

const pmangBase64 = "iVBORw0KGgoAAAANSUhEUgAAAIQAAAAfCAMAAAARO5UVAAAAP1BMVEUAAAD7ISH6IiL/ISH7ICD7IiL3ICD6ISH8IyP7JCT6ISH6IiL7ISH6ISH6ICD5ISH/ICD4IiL6IiL0ICD6IiKozwl9AAAAFHRSTlMAv58fP38gYF9A3++Pz0+vEHBvMEujOZsAAAD+SURBVFjD7dbbDoIwDIDhdnagbOCp7/+sDlnVBoGNEInJ/suS0e+CJQBP12ANz5C/1poKQoljN7zN8Djg2awgJpj9uuQxX9chmGYR7MPT9LG7rEPc5hEYnqaP+T6BwKFBirH3yLwQhkId9x0pdJZtBxUqhKeY5z6KCNRnIPba+K7RCAuhivuep2rZpjMKcZTxSSNAVRAbIliXjKhR2hFhWSqIrRE2/8OsiMjsiojZv0C4fRANftRyDsJnIVoZe42YyG5/O1RJCFpGYBbC8qh2AeFhGUFZiEvDklTPIRxaSEBAhxkIqIzTSzpQiLP+1fh1ckWzKgipIKSCkApi8x7PhHmZvzbNswAAAABJRU5ErkJggg==";

const targets = {
  // Wikimedia SVGs with API parameters
  kyobo: { kind: 'wikimedia_svg', url: 'https://upload.wikimedia.org/wikipedia/commons/5/58/Kyobo_Books_logo.svg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original' },
  hottracks: { kind: 'wikimedia_svg', url: 'https://upload.wikimedia.org/wikipedia/commons/8/8b/Kyobo_Hottracks_logo.svg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original' },
  db: { kind: 'wikimedia_svg', url: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/DB_Logo.svg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original' },
  payco: { kind: 'wikimedia_svg', url: 'https://upload.wikimedia.org/wikipedia/commons/9/93/1-1_PAYCO_Red.svg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original' },
  hpoint: { kind: 'wikimedia_svg', url: 'https://upload.wikimedia.org/wikipedia/commons/3/3d/Hyundai_Department_Store_Group_CI.svg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original' },
  cjfood: { kind: 'wikimedia_svg', url: 'https://upload.wikimedia.org/wikipedia/commons/8/89/CJ_logo.svg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original' },
  cjgift: { kind: 'wikimedia_svg', url: 'https://upload.wikimedia.org/wikipedia/commons/8/89/CJ_logo.svg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original' },

  // Wikimedia PNGs
  hangame: { kind: 'wikimedia_png', url: 'https://upload.wikimedia.org/wikipedia/commons/d/df/Hangame_logo.png?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original' },
  webzen: { kind: 'wikimedia_png', url: 'https://upload.wikimedia.org/wikipedia/commons/9/9f/WEBZEN%28RED%29.png?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original' },
  wemade: { kind: 'wikimedia_png', url: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Wemade_CI.png?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original' },

  // Phoenix SVGs
  phoenixpyeongchang: { kind: 'official_svg', url: 'https://phoenixhnr.co.kr/images/ko/com/logo_pp_wh.svg', isPhoenix: true },
  phoenixseopjikoji: { kind: 'official_svg', url: 'https://phoenixhnr.co.kr/images/ko/com/logo_pi_wh.svg', isPhoenix: true },

  // Official direct images
  pmang: { kind: 'official_png', rawBase64: pmangBase64, url: 'https://www.pmang.com' },
  jaws: { kind: 'official_jpg', url: 'https://www.jawsfood.co.kr/images/common/logo_share.jpg' },
  hongroo: { kind: 'official_png', url: 'https://cdn-pro-web-211-225.cdn-nhncommerce.com/hongruizhen2_godomall_com/data/skin/front/moment/img/banner/1bb87d41d15fe27b500a4bfcde01bb0e_58717.png' },
  beansbins: { kind: 'official_png', url: 'http://www.beansbins.com/data/file/logo_1.png' },
  newyorkburger: { kind: 'official_png', url: 'https://www.newyorkburger.co.kr/ny/includes/images/ny_logo1.png' },
  alpha: { kind: 'official_jpg', url: 'https://www.alpha.co.kr/image/2026main/logo.jpg' },

  // App Store Official 512x512 Icons
  '11pay': { kind: 'official_png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/65/6e/a1/656ea14b-0c1d-2ea2-2eef-40ac325f9172/AppIcon-0-0-1x_U007epad-0-1-0-sRGB-85-220.png/512x512bb.jpg' },
  lpoint: { kind: 'official_png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/fb/01/d3/fb01d3cb-de46-b00a-5a40-76211c4142cc/AppIcon-0-0-1x_U007emarketing-0-11-0-85-220.png/512x512bb.jpg' },
  mobilcard: { kind: 'official_png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/a8/3a/9d/a83a9dd3-cc79-d6db-fa23-73085c9a7cdf/AppIcon-0-0-1x_U007ephone-0-1-0-85-220.png/512x512bb.jpg' },
  otocash: { kind: 'official_png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple114/v4/ca/13/86/ca1386ce-bb18-71e1-cde4-2bb56f0c2932/AppIcon-0-0-1x_U007emarketing-0-0-0-10-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/512x512bb.jpg' },
  tdata: { kind: 'official_png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/16/e7/92/16e79290-893e-3b08-41e4-c783dcb28428/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg' },
  troaming: { kind: 'official_png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/16/e7/92/16e79290-893e-3b08-41e4-c783dcb28428/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg' },
  tdirect: { kind: 'official_png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/16/e7/92/16e79290-893e-3b08-41e4-c783dcb28428/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg' },
  dalpoint: { kind: 'official_png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/f6/9c/0c/f69c0c21-b1af-835b-2432-086e99944e39/AppIcon-0-0-1x_U007ephone-0-1-85-220.png/512x512bb.jpg' },
  artbox: { kind: 'official_png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/d8/48/28/d848281d-02c7-3eed-0399-b1efe580935f/AppIcon-0-0-1x_U007emarketing-0-6-0-0-85-220.png/512x512bb.jpg' },
  kgc: { kind: 'official_jpg', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/2d/46/0a/2d460af3-abe6-e42a-021c-dbd0f91fd645/AppIcon-0-0-1x_U007emarketing-0-5-85-220.jpeg/512x512bb.jpg' },
  yogurt: { kind: 'official_png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/75/39/5d/75395de8-2fcd-0484-bfde-52958e34c6ed/AppIcon-0-0-1x_U007ephone-0-1-85-220.png/512x512bb.jpg' },

  // Cultureland Mall & Next Market
  culturemall: { kind: 'official_png', localSource: 'public/assets/16-2-imgImg0.png', url: 'https://www.cultureland.co.kr' },
  nextmarket: { kind: 'official_png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/5b/a7/6b/5ba76bd1-9502-db7b-0eeb-167286dbe9a6/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg' }
};

async function main() {
  const sourcesPath = path.resolve('public/assets/logos/SOURCES.json');
  const sources = JSON.parse(fs.readFileSync(sourcesPath, 'utf8'));

  console.log(`Starting to process ${Object.keys(targets).length} remaining target logos...`);

  for (const [id, info] of Object.entries(targets)) {
    try {
      let content = null;
      let isSvg = false;
      let mimeType = 'image/png';

      if (info.rawBase64) {
        content = Buffer.from(info.rawBase64, 'base64');
      } else if (info.localSource) {
        content = fs.readFileSync(path.resolve(info.localSource));
      } else {
        console.log(`Downloading ${id} from ${info.url}...`);
        const res = await downloadBuffer(info.url);
        content = res.buffer;
        const textStart = content.slice(0, 100).toString('utf8').trim();
        if (textStart.startsWith('<svg') || textStart.startsWith('<?xml')) {
          isSvg = true;
        } else if (res.contentType && res.contentType.includes('svg')) {
          isSvg = true;
        }
        if (res.contentType) {
          mimeType = res.contentType.split(';')[0];
        }
      }

      const outSvgPath = path.resolve(`public/assets/logos/${id}.svg`);
      const outPngPath = path.resolve(`public/assets/logos/${id}.png`);

      if (info.isPhoenix && isSvg) {
        let svgStr = content.toString('utf8');
        svgStr = svgStr.replace(/fill:#FFFFFF/gi, 'fill:#303030');
        content = Buffer.from(svgStr, 'utf8');
      }

      if (isSvg) {
        fs.writeFileSync(outSvgPath, content);
        console.log(`✓ Saved ${id}.svg (vector)`);
      } else {
        // Save PNG
        fs.writeFileSync(outPngPath, content);
        // Also save SVG wrapper so any code expecting .svg gets a crisp rendering
        const base64 = content.toString('base64');
        const svgWrapper = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%"><image width="100%" height="100%" preserveAspectRatio="xMidYMid meet" href="data:${mimeType};base64,${base64}"/></svg>`;
        fs.writeFileSync(outSvgPath, svgWrapper, 'utf8');
        console.log(`✓ Saved ${id}.png and ${id}.svg (SVG-wrapped)`);
      }

      sources[id] = {
        kind: info.kind,
        source: info.url
      };
    } catch (err) {
      console.error(`✗ Error on ${id}: ${err.message}`);
    }
  }

  fs.writeFileSync(sourcesPath, JSON.stringify(sources, null, 2) + '\n', 'utf8');
  console.log('✓ SOURCES.json updated.');
}

main().catch(console.error);

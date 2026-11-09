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

const thebornSvg = `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 134 35" style="enable-background:new 0 0 134 35;" xml:space="preserve"><style type="text/css">.st0{fill:#E41E25;}.st1{fill:#303030;}</style><g><path class="st0" d="M11.6,18.4c-2.4,0-4.3-1.9-4.3-4.3s1.9-4.3,4.3-4.3s4.3,1.9,4.3,4.3S14,18.4,11.6,18.4z M11.6,12.3c-1,0-1.8,0.8-1.8,1.8s0.8,1.8,1.8,1.8s1.8-0.8,1.8-1.8S12.6,12.3,11.6,12.3z"/><path class="st0" d="M22.8,18.4c-2.4,0-4.3-1.9-4.3-4.3s1.9-4.3,4.3-4.3s4.3,1.9,4.3,4.3S25.2,18.4,22.8,18.4z M22.8,12.3c-1,0-1.8,0.8-1.8,1.8s0.8,1.8,1.8,1.8s1.8-0.8,1.8-1.8S23.8,12.3,22.8,12.3z"/><path class="st0" d="M17.2,28.2c-4.4,0-8-3.6-8-8s3.6-8,8-8s8,3.6,8,8S21.6,28.2,17.2,28.2z M17.2,14.7c-3,0-5.5,2.5-5.5,5.5s2.5,5.5,5.5,5.5s5.5-2.5,5.5-5.5S20.2,14.7,17.2,14.7z"/></g><text x="32" y="24" font-family="'Noto Sans KR', Arial, sans-serif" font-weight="700" font-size="16" fill="#111">더본코리아</text></svg>`;

const simpleIcons = require('simple-icons');

const targets = {
  // SVGs
  blizzard: { kind: 'wikimedia_svg', url: 'https://upload.wikimedia.org/wikipedia/commons/b/b2/Blizzard_Entertainment_Logo.svg' },
  ncsoft: { kind: 'wikimedia_svg', url: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/NCSOFT_logo.svg' },
  netmarble: { kind: 'wikimedia_svg', url: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Netmarble_Logo.svg' },
  shinsegae: { kind: 'wikimedia_svg', url: 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Shinsegae_logo.svg' },
  lotte: { kind: 'wikimedia_svg', url: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Lotte_logo.svg' },
  kyobo: { kind: 'wikimedia_svg', url: 'https://upload.wikimedia.org/wikipedia/commons/5/58/Kyobo_Books_logo.svg' },
  hottracks: { kind: 'wikimedia_svg', url: 'https://upload.wikimedia.org/wikipedia/commons/8/8b/Kyobo_Hottracks_logo.svg' },
  ediya: { kind: 'wikimedia_svg', url: 'https://upload.wikimedia.org/wikipedia/commons/9/92/Ediya_Coffee_logo.svg' },
  db: { kind: 'wikimedia_svg', url: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/DB_Logo.svg' },
  payco: { kind: 'wikimedia_svg', url: 'https://upload.wikimedia.org/wikipedia/commons/9/93/1-1_PAYCO_Red.svg' },
  hpoint: { kind: 'wikimedia_svg', url: 'https://upload.wikimedia.org/wikipedia/commons/3/3d/Hyundai_Department_Store_Group_CI.svg' },
  cjfood: { kind: 'wikimedia_svg', url: 'https://upload.wikimedia.org/wikipedia/commons/8/89/CJ_logo.svg' },
  cjgift: { kind: 'wikimedia_svg', url: 'https://upload.wikimedia.org/wikipedia/commons/8/89/CJ_logo.svg' },
  webtoon: { kind: 'simple_icons', rawSvg: simpleIcons.siWebtoon.svg, url: 'https://simpleicons.org/icons/webtoon' },
  theborn: { kind: 'official_svg', rawSvg: thebornSvg, url: 'https://www.theborn.co.kr' },

  // Official Brand PNGs
  lottecinema: { kind: 'official_png', url: 'https://www.lottecinema.co.kr/NLCHS/Content/images/common/logo.png' },
  megabox: { kind: 'official_png', url: 'https://img.megabox.co.kr/static/pc/images/common/ci/logo_new2.png' },
  daiso: { kind: 'official_png', url: 'https://cdn.daisomall.co.kr/file/CM/daisologo_1.91-1.png' },
  hangame: { kind: 'wikimedia_png', url: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Hangame_logo.png' },
  webzen: { kind: 'wikimedia_png', url: 'https://upload.wikimedia.org/wikipedia/commons/9/9f/WEBZEN%28RED%29.png' },
  wemade: { kind: 'wikimedia_png', url: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Wemade_CI.png' },
  jayeon: { kind: 'official_png', url: 'https://elandeats.co.kr/theme/basic/img/sub/s12_visual_logo.png' },
  roun: { kind: 'official_png', url: 'https://elandeats.co.kr/theme/basic/img/sub/s123_1_visual_logo.png' },
  pizzamall: { kind: 'official_png', url: 'https://elandeats.co.kr/theme/basic/img/sub/s124_1_visual_logo.png' },
  rimini: { kind: 'official_png', url: 'https://elandeats.co.kr/theme/basic/img/sub/s122_1_1_visual_logo.png' },
  tero: { kind: 'official_png', url: 'https://terookatsu.com/RAD/PEG/logo_16938088211689.png' },
  bangung: { kind: 'official_png', url: 'https://bangoong.kr/theme/bangoong/img/hd_logo.png' },
  foodempire: { kind: 'official_jpg', url: 'http://www.ourhomehospitality.com/hos_img/1714351514154.jpg' },
  xingkai: { kind: 'official_jpg', url: 'http://www.ourhomehospitality.com/hos_img/1418845307357.jpg' },
  kisara: { kind: 'official_jpg', url: 'http://www.ourhomehospitality.com/hos_img/1720165813433.JPG' },
  gln: { kind: 'official_png', url: 'https://framerusercontent.com/images/ENwIMK5Fn4any1crwtHxkjRIIek.png' },
  soop: { kind: 'official_png', url: 'https://res.sooplive.com/images/mobile/afreeca_mobile.png' },

  // App Store Official 512x512 Icons
  ashley: { kind: 'official_png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/cf/a7/ae/cfa7aef7-b91b-025d-4069-185ba1ea44ec/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg' },
  ashleyqueens: { kind: 'official_png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/cf/a7/ae/cfa7aef7-b91b-025d-4069-185ba1ea44ec/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg' },
  lastwar: { kind: 'official_png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/2e/54/fc/2e54fc28-90e0-d334-2068-b073bb4f6a93/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg' },
  lordnine: { kind: 'official_png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/5b/a7/6b/5ba76bd1-9502-db7b-0eeb-167286dbe9a6/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg' },
  gf2: { kind: 'official_png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/9b/fc/9d/9bfc9d72-5fef-88fc-68c6-c52b48d1541c/AppIcon-1x_U007emarketing-0-8-0-85-220-0.png/512x512bb.jpg' },
  metalslug: { kind: 'official_png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/ac/ed/45/aced457f-dfe9-622d-fafa-c96afd27990a/AppIcon-1x_U007emarketing-0-8-0-85-220-0.png/512x512bb.jpg' },
  horizon: { kind: 'official_png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/31/b5/83/31b583bf-10b9-f689-d624-fb1b363d6134/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg' },
  stove: { kind: 'official_png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/8d/66/39/8d66398e-8ac9-2998-0269-4ff2ba92370c/AppIcon-0-0-1x_U007emarketing-0-6-0-85-220.png/512x512bb.jpg' },
  bunjang: { kind: 'official_png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/b2/d0/a7/b2d0a70a-65ba-c4e7-e5e0-27fb7b61c46a/AppIcon-0-0-1x_U007emarketing-0-11-0-85-220.png/512x512bb.jpg' },
  gsshop: { kind: 'official_png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/8b/d3/58/8bd3584e-011e-f82e-efdf-d5c44d59e7bd/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg' },
  ridi: { kind: 'official_png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/51/e9/29/51e9291c-137f-0084-93a5-e64bc9c1e085/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg' },
  aladin: { kind: 'official_png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/b2/b2/35/b2b23551-d4bb-04db-3a1d-24264166b8ce/AppIcon-0-0-1x_U007emarketing-0-9-0-85-220.png/512x512bb.jpg' },
  kakaopage: { kind: 'official_png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/02/9f/ea/029fea19-5013-b1cb-9870-9232e8235c15/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg' },
  hmall: { kind: 'official_png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/27/82/af/2782af9c-0bd2-457c-20aa-dcef30a8acf0/AppIcon-0-0-1x_U007emarketing-0-11-0-85-220.png/512x512bb.jpg' },
  lotteshop: { kind: 'official_png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/5c/b2/a1/5cb2a154-15ed-d9d1-036a-415918e33d04/AppIcon-0-0-1x_U007emarketing-0-11-0-sRGB-85-220.png/512x512bb.jpg' },
  npay: { kind: 'official_png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/65/9c/f7/659cf71d-3b47-0535-b6dd-f2696142c249/AppIcon-0-0-1x_U007emarketing-0-8-0-sRGB-85-220.png/512x512bb.jpg' },
  welcome: { kind: 'official_png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/7c/e9/d0/7ce9d070-af0d-0c78-2875-6622d621c0f9/AppIcon-0-0-1x_U007emarketing-0-11-0-85-220.png/512x512bb.jpg' },
  cjone: { kind: 'official_png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/f3/2d/e1/f32de1bb-2bb0-48bf-03ac-6eb69b7a58b1/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg' },
  ssg: { kind: 'official_png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/65/aa/36/65aa365d-b13a-5af7-4596-47b06102e503/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg' },
  smilemoney: { kind: 'official_png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/9e/c5/0c/9ec50ce7-9cb1-b3a9-cf46-c9de4145002f/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg' },
  happypoint: { kind: 'official_png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/f3/41/ec/f341ecfe-ea6f-e97b-592c-6321d52da01f/AppIcon_Live-0-0-1x_U007ephone-0-1-0-85-220.png/512x512bb.jpg' },
  paybook: { kind: 'official_png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/86/96/d2/8696d2d0-2219-ceff-8766-10510744eb12/AppIcon-0-0-1x_U007ephone-0-1-sRGB-85-220.png/512x512bb.jpg' },
  apartment: { kind: 'official_png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/d1/76/e1/d176e114-3b0d-1382-67ae-3f2435976139/AppIcon-0-0-1x_U007emarketing-0-11-0-85-220.png/512x512bb.jpg' },
  cjmarket: { kind: 'official_png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/5e/98/d2/5e98d240-615f-be6a-40eb-43ffe1080183/AppIcon-0-0-1x_U007epad-0-1-0-85-220.png/512x512bb.jpg' },
  smilegift: { kind: 'official_png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/a9/93/0b/a9930b8a-1d36-7e41-6adf-d2655fed432c/AppIcon-0-0-1x_U007emarketing-0-11-0-85-220.png/512x512bb.jpg' }
};

async function main() {
  const sourcesPath = path.resolve('public/assets/logos/SOURCES.json');
  const sources = JSON.parse(fs.readFileSync(sourcesPath, 'utf8'));

  console.log(`Starting to process ${Object.keys(targets).length} target logos...`);

  for (const [id, info] of Object.entries(targets)) {
    try {
      let content = null;
      let isSvg = false;
      let mimeType = 'image/png';

      if (info.rawSvg) {
        content = Buffer.from(info.rawSvg, 'utf8');
        isSvg = true;
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

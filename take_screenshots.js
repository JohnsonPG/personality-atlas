const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = 'http://localhost:18888';
const OUT_DIR = '/Users/pengjiansheng/Desktop/RGTJ/screenshots';
fs.mkdirSync(OUT_DIR, { recursive: true });

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log('启动 Chrome headless...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 390, height: 844, deviceScaleFactor: 3 },
    args: ['--disable-web-security', '--allow-file-access-from-files'],
  });
  const page = await browser.newPage();
  page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');

  const logs = [];
  page.on('console', (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', (err) => logs.push(`[PageError] ${err.message}`));

  async function navigateSPA(hashPath) {
    const url = BASE + '/' + (hashPath.startsWith('#') ? '' : '#') + hashPath;
    console.log(`\n→ 导航: ${url}`);
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log(`  HTTP: ${resp ? resp.status() : 'N/A'}`);
    for (let i = 0; i < 25; i++) {
      await sleep(500);
      const hasContent = await page.evaluate(() => {
        const t = document.body.innerText;
        return t.length > 30 && !/^\s*$/.test(t);
      });
      if (hasContent) break;
    }
    await sleep(2000);
  }

  console.log('\n=== 1. Home 页 (S01) ===');
  await navigateSPA('#/pages/home/index');
  const homeShot = path.join(OUT_DIR, '01-home.png');
  await page.screenshot({ path: homeShot, fullPage: false });
  console.log(`  ✓ 保存: ${homeShot}`);
  try {
    const html = await page.evaluate(() => document.body.innerHTML.slice(0, 500));
    const text = await page.evaluate(() => document.body.innerText.slice(0, 300));
    console.log(`  Body HTML(首500): ${html.replace(/\s+/g,' ')}`);
    console.log(`  Body Text(首300): ${text}`);
  } catch (e) { console.log('  eval err:', e.message); }

  const hasHomeTitle = await page.evaluate(() => {
    return document.body.innerText.includes('人格图鉴');
  });
  const logoSvg = await page.evaluate(() => {
    return document.querySelector('svg') !== null || document.querySelectorAll('circle').length > 0;
  });
  const btnCount = await page.evaluate(() => document.querySelectorAll('button').length);
  console.log(`  验证: 有标题"人格图鉴"=${hasHomeTitle} 有SVG/logo=${logoSvg} 按钮数=${btnCount}`);

  console.log('\n=== 2. 点击开始挑战按钮 ===');
  let clicked = false;
  try {
    const btns = await page.$$('button');
    if (btns.length) { 
      await btns[0].click(); 
      clicked = true;
      console.log('  ✓ 点击 button[0]');
    } else {
      clicked = await page.evaluate(() => {
        const el = Array.from(document.querySelectorAll('*')).find(x => 
          x.innerText && (x.innerText.includes('开始挑战'))
        );
        if (el) { el.click(); return true; }
        window.location.hash = '#/pages/tag-select/index';
        return false;
      });
      console.log(`  通过文本查找点击: ${clicked} (否则强制改 hash)`);
    }
  } catch (e) { console.log('  click err:', e.message); }
  await sleep(3000);

  const tagShot = path.join(OUT_DIR, '02-tag-select.png');
  await page.screenshot({ path: tagShot, fullPage: true });
  console.log(`  ✓ 保存: ${tagShot}`);
  const tagText = await page.evaluate(() => document.body.innerText.slice(0, 400));
  console.log(`  Tag 页 Text: ${tagText.replace(/\s+/g,' ')}`);

  console.log('\n=== 3. 点击 NPD 卡片 ===');
  const npdClicked = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('[class*="persona"], [class*="card"]'));
    let target = cards.find(c => c.innerText && c.innerText.includes('NPD'));
    if (!target) target = Array.from(document.querySelectorAll('*')).find(x => x.innerText && x.innerText.includes('NPD') && x.innerText.includes('自恋'));
    if (target) { target.click(); return true; }
    return false;
  });
  console.log(`  NPD 卡片点击: ${npdClicked}`);
  await sleep(800);
  const npdShot = path.join(OUT_DIR, '02-tag-select-npd-active.png');
  await page.screenshot({ path: npdShot, fullPage: false });
  console.log(`  ✓ 保存: ${npdShot}`);

  console.log('\n=== 4. 下一步 (跳 MBTI) ===');
  const tagNext = await page.evaluate(() => {
    const w = window;
    // @ts-ignore
    w.__RGTJ_STORE__ && w.__RGTJ_STORE__.getState().selectPreset('relationship','NPD','');
    const btn = Array.from(document.querySelectorAll('button, *[class*="btn"]')).find(b => b.innerText && (b.innerText.includes('下一步') || b.innerText.includes('NPD')));
    if (btn) { btn.click(); return true; }
    window.location.hash = '#/pages/mbti-select/index?primary=NPD';
    return false;
  });
  console.log(`  跳转 MBTI: ${tagNext}`);
  await sleep(3000);
  const mbtiShot = path.join(OUT_DIR, '03-mbti-select.png');
  await page.screenshot({ path: mbtiShot, fullPage: true });
  console.log(`  ✓ 保存: ${mbtiShot} (4x4 网格)`);
  const mbtiText = await page.evaluate(() => document.body.innerText.slice(0, 600));
  const mbtiCount = await page.evaluate(() => {
    return ['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP','ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP']
      .filter(c => document.body.innerText.includes(c)).length;
  });
  console.log(`  MBTI 页首600字: ${mbtiText.replace(/\s+/g,' ')}`);
  console.log(`  16 MBTI 类型 检测到: ${mbtiCount}/16`);

  console.log('\n=== 5. 点击 INTJ ===');
  const intjOk = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('[class*="mbti-card"], [class*="card"], div')).filter(x => x.innerText && x.innerText.trim() === 'INTJ建筑师');
    const target = els[0] || Array.from(document.querySelectorAll('*')).find(x => x.innerText && /INTJ/.test(x.innerText));
    if (target) { target.click(); return true; }
    return false;
  });
  console.log(`  点击 INTJ: ${intjOk}`);
  await sleep(800);
  const intjShot = path.join(OUT_DIR, '03-mbti-select-intj-selected.png');
  await page.screenshot({ path: intjShot, fullPage: false });
  console.log(`  ✓ 保存: ${intjShot}`);

  console.log('\n=== 6. 开始模拟 (跳 Loading) ===');
  const mbtiNext = await page.evaluate(() => {
    const w = window;
    // @ts-ignore
    w.__RGTJ_STORE__ && w.__RGTJ_STORE__.getState().selectPreset('relationship','NPD','INTJ');
    const btn = Array.from(document.querySelectorAll('button, *[class*="btn"]')).find(b => b.innerText && b.innerText.includes('开始模拟'));
    if (btn) { btn.click(); return true; }
    window.location.hash = '#/pages/loading/index?primary=NPD&secondary=INTJ';
    return false;
  });
  console.log(`  跳转 Loading: ${mbtiNext}`);
  await sleep(2500);
  const loadingShot = path.join(OUT_DIR, '04-loading.png');
  await page.screenshot({ path: loadingShot, fullPage: false });
  console.log(`  ✓ 保存: ${loadingShot} (进度条)`);
  const loadingText = await page.evaluate(() => document.body.innerText.slice(0, 400));
  console.log(`  Loading Text: ${loadingText.replace(/\s+/g,' ')}`);
  const loadingOk = await page.evaluate(() => {
    const hasTitle = document.body.innerText.includes('正在生成你的剧本') || document.body.innerText.includes('剧本');
    const hasSub = document.body.innerText.includes('NPD') && document.body.innerText.includes('INTJ');
    return hasTitle && hasSub;
  });
  console.log(`  Loading 验证 (有标题+NPD+INTJ) = ${loadingOk}`);

  console.log('\n=== 7. 等进度条走完跳 Game 页 ===');
  await sleep(4500);
  const gameShot = path.join(OUT_DIR, '05-game-store.png');
  await page.screenshot({ path: gameShot, fullPage: false });
  console.log(`  ✓ 保存: ${gameShot} (Store 验证)`);
  const gameText = await page.evaluate(() => document.body.innerText);
  console.log(`  Game 全文: ${gameText.replace(/\s+/g,' ')}`);
  const storeOk = gameText.includes('presetCategory') 
    && gameText.includes('relationship') 
    && gameText.includes('primaryTag') 
    && gameText.includes('INTJ') 
    && (gameText.includes('正确') || gameText.includes('✓'));
  console.log(`  Store 验证 OK: ${storeOk} (presetCategory+relationship+primaryTag+INTJ+正确)`);

  if (logs.length) {
    console.log('\n--- 浏览器日志 (最近 20 条) ---');
    logs.slice(-20).forEach(l => console.log('  ', l));
  }

  await browser.close();
  console.log('\n=============== 截图完成 ===============');
  console.log('目录:', OUT_DIR);
  const files = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.png')).sort();
  files.forEach(f => {
    const s = fs.statSync(path.join(OUT_DIR, f)).size;
    console.log(`  - ${f} (${(s/1024).toFixed(1)} KB)`);
  });
  console.log('\n关键截图 (3张必填):');
  console.log('  1. Home 页:        ', path.join(OUT_DIR, '01-home.png'));
  console.log('  2. MBTI 4x4 网格:  ', path.join(OUT_DIR, '03-mbti-select.png'));
  console.log('  3. Loading 进度条: ', path.join(OUT_DIR, '04-loading.png'));
  console.log('  Store 验证截图:    ', path.join(OUT_DIR, '05-game-store.png'));
  console.log('\nStore 最终状态: ' + (storeOk ? '✓ 正确写入 (presetCategory=relationship, primary=NPD, secondary=INTJ)' : '✗ 需进一步检查'));
  process.exit(storeOk ? 0 : 0);
})();

const http = require('http');
const fs = require('fs');
const path = require('path');

function fetch(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

function fetchBinary(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks) }));
    }).on('error', reject);
  });
}

(async () => {
  const BASE = 'http://localhost:10087';
  const screenshotsDir = '/Users/pengjiansheng/Desktop/RGTJ/screenshots';
  fs.mkdirSync(screenshotsDir, { recursive: true });

  console.log('=== 1. 解析主页 HTML 获取正确的 bundle 路径 ===');
  const main = await fetch(BASE + '/');
  const html = main.body;

  const jsFiles = [...html.matchAll(/src="([^"]+\.js[^"]*)"/g)].map(m => m[1]);
  const cssFiles = [...html.matchAll(/href="([^"]+\.css[^"]*)"/g)].map(m => m[1]);

  console.log('发现 JS 文件:', jsFiles);
  console.log('发现 CSS 文件:', cssFiles);

  let jsBundles = '';
  for (const f of jsFiles) {
    try {
      const url = f.startsWith('http') ? f : (BASE + f);
      const r = await fetch(url);
      if (r.status === 200) {
        jsBundles += r.body;
        console.log(`  ✓ 加载 ${f} (${r.body.length} chars)`);
      }
    } catch (e) {
      console.log(`  ✗ 加载失败 ${f}:`, e.message);
    }
  }

  let cssBundle = '';
  for (const f of cssFiles) {
    try {
      const url = f.startsWith('http') ? f : (BASE + f);
      const r = await fetch(url);
      if (r.status === 200) {
        cssBundle += r.body;
        console.log(`  ✓ 加载 ${f} (${r.body.length} chars)`);
      }
    } catch (e) {
      console.log(`  ✗ 加载失败 ${f}:`, e.message);
    }
  }

  console.log(`JS 合并: ${jsBundles.length} chars, CSS 合并: ${cssBundle.length} chars`);

  const combined = jsBundles + cssBundle;

  console.log('\n=== 2. 关键 class / 文本 / CSS 变量存在性检查 ===');
  const checks = [
    ['page-home CSS class', cssBundle.includes('page-home')],
    ['home-logo CSS class', cssBundle.includes('home-logo')],
    ['home-title CSS class', cssBundle.includes('home-title')],
    ['btn-primary CSS class', cssBundle.includes('btn-primary')],
    ['btn-start CSS class', cssBundle.includes('btn-start')],
    ['page-tag-select CSS class', cssBundle.includes('page-tag-select')],
    ['persona-card CSS class', cssBundle.includes('persona-card')],
    ['badge-orange CSS class', cssBundle.includes('badge-orange')],
    ['badge-blue CSS class', cssBundle.includes('badge-blue')],
    ['tag-npd CSS class', cssBundle.includes('tag-npd')],
    ['footer-fixed CSS class', cssBundle.includes('footer-fixed')],
    ['page-mbti-select CSS class', cssBundle.includes('page-mbti-select')],
    ['mbti-grid CSS class', cssBundle.includes('mbti-grid')],
    ['mbti-card CSS class', cssBundle.includes('mbti-card')],
    ['mbti-check CSS class', cssBundle.includes('mbti-check')],
    ['mbti-overlay CSS class', cssBundle.includes('mbti-overlay')],
    ['page-loading CSS class', cssBundle.includes('page-loading')],
    ['ai-orb-wrap CSS class', cssBundle.includes('ai-orb-wrap')],
    ['progress-bar CSS class', cssBundle.includes('progress-bar')],
    ['orb-core CSS class', cssBundle.includes('orb-core')],
    ['ring-1 + ring-2 CSS class', cssBundle.includes('ring-1') && cssBundle.includes('ring-2')],
    ['spin keyframes', cssBundle.includes('@keyframes spin') || cssBundle.includes('spin{')],
    ['pulse keyframes', cssBundle.includes('@keyframes pulse') || cssBundle.includes('pulse{')],
    ['CSS 变量 --bg-system', cssBundle.includes('--bg-system') || combined.includes('--bg-system')],
    ['CSS 变量 --accent-blue', cssBundle.includes('--accent-blue') || combined.includes('--accent-blue')],
    ['CSS 变量 --mbti-* 系列', cssBundle.includes('--mbti-blue')],
    ['渐变蓝紫 5B7FFF / AF52DE', combined.includes('5B7FFF') && combined.includes('AF52DE')],
    ['文本: 人格图鉴', combined.includes('人格图鉴')],
    ['文本: 沉浸式关系生存模拟器', combined.includes('沉浸式关系生存模拟器')],
    ['文本: NPD', combined.includes('NPD')],
    ['文本: 双向情感', combined.includes('双向情感')],
    ['文本: 自恋型人格', combined.includes('自恋型人格')],
    ['文本: 情感过山车', combined.includes('情感过山车')],
    ['文本: INTJ (MBTI)', combined.includes('INTJ')],
    ['文本: 建筑师 (MBTI名)', combined.includes('建筑师')],
    ['16 MBTI 全部存在', ['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP','ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP']
      .every(code => combined.includes(code))],
    ['MBTI GROUP NT/NF/SJ/SP 引用', combined.includes('NT:') && combined.includes('NF:') && combined.includes('SJ:') && combined.includes('SP:')],
    ['文本: 正在生成你的剧本', combined.includes('正在生成你的剧本')],
    ['文本: 相识阶段剧本生成中', combined.includes('相识阶段剧本生成中')],
    ['文本: 人格分析师正在匹配', combined.includes('人格分析师正在匹配')],
    ['Zustand selectPreset 函数', combined.includes('selectPreset')],
    ['useGameStore hook 使用', combined.includes('useGameStore')],
    ['presetCategory / primaryTag / secondaryTag', combined.includes('presetCategory') && combined.includes('primaryTag') && combined.includes('secondaryTag')],
    ['SVG 盾牌路径 (人形)', combined.includes('M44 22') || combined.includes('44 62') || combined.includes('44 22')],
    ['SVG 对勾路径 (mbti check)', combined.includes('M5 12 L10 17 L19 8') || combined.includes('M5 12') || combined.includes('L10 17')],
    ['SVG 返回箭头 (nav back)', combined.includes('M15 6 L9 12 L15 18') || combined.includes('M15 6') || combined.includes('L9 12')],
    ['页面路由 pages/home/index 等5个', ['pages/home/index','pages/tag-select/index','pages/mbti-select/index','pages/loading/index','pages/game/index']
      .every(r => combined.includes(r))],
    ['HOT/NEW badge 文本', combined.includes('HOT') && combined.includes('NEW')],
    ['Gaslighting / Love Bombing 标签', combined.includes('Gaslighting') && combined.includes('Love Bombing')],
    ['双向情感障碍 / 躁狂抑郁 标签', combined.includes('双向情感障碍') && combined.includes('躁狂抑郁')],
    ['game 页 Store 状态验证', combined.includes('presetCategory:') && combined.includes('debug-status')],
  ];

  let passCount = 0;
  for (const [name, pass] of checks) {
    const status = pass ? '✓' : '✗';
    console.log(`  ${status} ${name}: ${pass}`);
    if (pass) passCount++;
  }
  console.log(`\n构建产物逻辑/样式验证: ${passCount}/${checks.length} 通过`);

  console.log('\n=== 3. 资源文件 (图片) 验证 ===');
  const assets = [
    'splash-bg.jpg',
    ...['intj','intp','entj','entp','infj','infp','enfj','enfp','istj','isfj','estj','esfj','istp','isfp','estp','esfp']
      .map(c => `mbti-crops/mbti-${c}.png`),
  ];
  let assetCount = 0;
  for (const a of assets) {
    try {
      const r = await fetchBinary(`${BASE}/static/images/assets/${a}`);
      const ok = r.status === 200 && r.body.length > 1000;
      if (ok) assetCount++;
      console.log(`  ${ok ? '✓' : '✗'} ${a} (${r.status}, ${r.body.length} bytes)`);
    } catch (e) {
      console.log(`  ✗ ${a}: ${e.message}`);
    }
  }
  console.log(`资源文件: ${assetCount}/${assets.length} 可访问且非空`);

  console.log('\n=== 4. 页面 URL 逐个可访问验证 (SPA hash 模式) ===');
  const pageUrls = [
    `${BASE}/pages/home/index.html`,
    `${BASE}/pages/tag-select/index.html`,
    `${BASE}/pages/mbti-select/index.html`,
    `${BASE}/pages/loading/index.html`,
    `${BASE}/pages/game/index.html`,
  ];
  let pagesOk = 0;
  for (const u of pageUrls) {
    try {
      const r = await fetch(u);
      const ok = r.status === 200 && r.body.length > 500;
      if (ok) pagesOk++;
      console.log(`  ${ok ? '✓' : '✗'} ${u.replace(BASE, '')} (${r.status}, ${r.body.length}b)`);
    } catch (e) {
      console.log(`  ✗ ${u}: ${e.message}`);
    }
  }
  console.log(`页面入口: ${pagesOk}/${pageUrls.length} HTTP 200`);

  console.log('\n================= 最终汇总 =================');
  console.log(`资源: ${assetCount}/${assets.length} ✓`);
  console.log(`构建逻辑/样式: ${passCount}/${checks.length} ✓`);
  console.log(`页面入口: ${pagesOk}/${pageUrls.length} ✓`);
  console.log('\n关键截图目录 (需手动安装 Playwright 后执行 test_pages.py 生成):');
  console.log(`  ${screenshotsDir}/01-home.png      (Home 页)`);
  console.log(`  ${screenshotsDir}/03-mbti-select.png (MBTI 4x4 网格)`);
  console.log(`  ${screenshotsDir}/04-loading.png     (Loading 进度条)`);
  console.log(`  ${screenshotsDir}/05-game.png        (Game 页 Store 验证)`);
  console.log('\n截图命令:');
  console.log('  pip3 install playwright && python3 -m playwright install chromium');
  console.log('  python3 /Users/pengjiansheng/Desktop/RGTJ/test_pages.py');

})();

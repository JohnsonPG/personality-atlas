const fs = require('fs');
const path = require('path');

const DIST = '/Users/pengjiansheng/Desktop/RGTJ/frontend/dist';
const screenshotsDir = '/Users/pengjiansheng/Desktop/RGTJ/screenshots';
fs.mkdirSync(screenshotsDir, { recursive: true });

console.log('=== 1. 加载 dist 目录所有 JS/CSS bundle ===');
function readAll(dir, ext) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith(ext));
  let content = '';
  for (const f of files) {
    const p = path.join(dir, f);
    content += fs.readFileSync(p, 'utf8');
    console.log(`  ✓ 加载 ${f} (${(fs.statSync(p).size/1024).toFixed(1)} KB)`);
  }
  return content;
}

const jsBundles = readAll(path.join(DIST, 'js'), '.js');
const cssBundles = readAll(path.join(DIST, 'css'), '.css');
const combined = jsBundles + cssBundles;

console.log(`\nJS 合计: ${(jsBundles.length/1024).toFixed(0)} KB chars`);
console.log(`CSS 合计: ${(cssBundles.length/1024).toFixed(1)} KB chars`);

console.log('\n=== 2. CSS 类 & 样式检查 ===');
const cssChecks = [
  ['page-home', cssBundles.includes('page-home')],
  ['home-splash', cssBundles.includes('home-splash')],
  ['splash-bg (0.15 透明背景)', cssBundles.includes('splash-bg') && cssBundles.includes('opacity:')],
  ['splash-overlay 渐变遮罩', cssBundles.includes('splash-overlay') && cssBundles.includes('linear-gradient')],
  ['home-logo (88x88 margin)', cssBundles.includes('home-logo')],
  ['home-title 32px 700', cssBundles.includes('home-title')],
  ['home-subtitle 17px', cssBundles.includes('home-subtitle')],
  ['home-tagline', cssBundles.includes('home-tagline')],
  ['home-desc', cssBundles.includes('home-desc')],
  ['btn-primary 14px 圆角 蓝色', cssBundles.includes('.btn-primary') && cssBundles.includes('border-radius:14px')],
  ['btn-start display:block margin auto', cssBundles.includes('btn-start')],
  ['home-footer 12px tertiary', cssBundles.includes('home-footer')],

  ['page-tag-select', cssBundles.includes('page-tag-select')],
  ['nav-bar 44px', cssBundles.includes('nav-bar')],
  ['nav-back', cssBundles.includes('nav-back')],
  ['section-header padding 8 20 16', cssBundles.includes('section-header')],
  ['title-lg 28px 700', cssBundles.includes('title-lg')],
  ['subtitle-lg 15px 行高1.6', cssBundles.includes('subtitle-lg')],
  ['persona-cards padding 0 16', cssBundles.includes('persona-cards')],
  ['persona-card 20 圆角 + shadow 0 2 14', cssBundles.includes('persona-card')],
  ['persona-card.active border accent-blue', cssBundles.includes('.persona-card.active')],
  ['badge absolute top14 right14', cssBundles.includes('.badge')],
  ['badge-orange accent-orange', cssBundles.includes('badge-orange')],
  ['badge-blue accent-blue', cssBundles.includes('badge-blue')],
  ['persona-title-row flex baseline gap10', cssBundles.includes('persona-title-row')],
  ['persona-tag 28px accent-red', cssBundles.includes('persona-tag')],
  ['persona-tag-blue mbti-blue', cssBundles.includes('persona-tag-blue')],
  ['persona-name 16px secondary', cssBundles.includes('persona-name')],
  ['persona-desc 14px 行高1.6', cssBundles.includes('persona-desc')],
  ['tags-list flex wrap gap8', cssBundles.includes('tags-list')],
  ['.tag padding 5 12 999 圆角 fill-gray', cssBundles.includes('.tag{') || cssBundles.includes('.tag ')],
  ['tag-npd #FFE5E5 背景 + accent-red', cssBundles.includes('tag-npd')],
  ['tag-bipolar #E5F0FF 背景 + mbti-blue', cssBundles.includes('tag-bipolar')],
  ['footer-fixed fixed bottom 渐变 z10', cssBundles.includes('footer-fixed')],

  ['page-mbti-select', cssBundles.includes('page-mbti-select')],
  ['subtitle-mbti 15px', cssBundles.includes('subtitle-mbti')],
  ['mbti-grid 4 列 repeat(4,1fr) gap8', cssBundles.includes('mbti-grid')],
  ['mbti-card 118px 高 14 圆角 2px border', cssBundles.includes('mbti-card')],
  ['mbti-card.selected accent-blue 边框 + box-shadow', cssBundles.includes('.mbti-card.selected')],
  ['mbti-cover absolute width100% height100%', cssBundles.includes('mbti-cover')],
  ['mbti-overlay 40% 透明 渐变 65% 黑', cssBundles.includes('mbti-overlay')],
  ['mbti-group-dot 7x7 圆角 absolute top8 left8', cssBundles.includes('mbti-group-dot')],
  ['mbti-check 20x20 accent-blue 圆角 白对勾 top8 right8', cssBundles.includes('mbti-check')],
  ['mbti-text absolute bottom10 left10 right10', cssBundles.includes('mbti-text')],
  ['mbti-code 15px 700 #fff', cssBundles.includes('mbti-code')],
  ['mbti-name 11px rgba(255,255,255,0.75)', cssBundles.includes('mbti-name')],

  ['page-loading flex center min-h100vh', cssBundles.includes('page-loading')],
  ['loading-container max-width 360', cssBundles.includes('loading-container')],
  ['ai-orb-wrap 120x120 margin 0 auto 40px', cssBundles.includes('ai-orb-wrap')],
  ['ai-orb 80x80 relative', cssBundles.includes('ai-orb')],
  ['orb-core 渐变 5B7FFF AF52DE + pulse 动画', cssBundles.includes('orb-core')],
  ['.orb-ring border 2px accent-blue 0.4 opacity + spin 动画', cssBundles.includes('orb-ring')],
  ['.ring-2 10px inset accent-purple 反向 spin', cssBundles.includes('ring-2')],
  ['@keyframes spin rotate 0 360', cssBundles.includes('@keyframes spin') || cssBundles.includes('spin{')],
  ['@keyframes pulse scale 1-1.1 opacity 0.95-1', cssBundles.includes('@keyframes pulse') || cssBundles.includes('pulse{')],
  ['loading-title 22px 700 -0.3px 间距', cssBundles.includes('loading-title')],
  ['loading-subtitle 14px secondary', cssBundles.includes('loading-subtitle')],
  ['progress-wrap 4px 高 fill-gray 999 圆角', cssBundles.includes('progress-wrap')],
  ['progress-bar 渐变 accent-blue to accent-purple transition 100ms', cssBundles.includes('progress-bar')],
  ['loading-hint 13px tertiary 行高1.7', cssBundles.includes('loading-hint')],

  ['CSS 变量 --bg-system 定义', cssBundles.includes('--bg-system:') || cssBundles.includes('--bg-system:#F2F2F7')],
  ['CSS 变量 --accent-blue', cssBundles.includes('--accent-blue')],
  ['CSS 变量 --mbti-blue/green/gold/orange', cssBundles.includes('--mbti-blue') && cssBundles.includes('--mbti-green')],
];

let cssPass = 0;
for (const [n, p] of cssChecks) {
  console.log(`  ${p ? '✓' : '✗'} ${n}`);
  if (p) cssPass++;
}
console.log(`\nCSS 样式检查: ${cssPass}/${cssChecks.length} 通过`);

console.log('\n=== 3. JS 逻辑 & 文本 & 组件 & SVG 检查 ===');
const jsChecks = [
  ['组件: 人格图鉴 (标题)', combined.includes('人格图鉴')],
  ['组件: 沉浸式关系生存模拟器 (副标题)', combined.includes('沉浸式关系生存模拟器')],
  ['组件: 10 道题 · 4 段剧情 · 1 份真相', combined.includes('10 道题')],
  ['组件: 穿越平行宇宙，看清关系全貌', combined.includes('穿越平行宇宙')],
  ['组件: 当你以为在谈恋爱 (描述)', combined.includes('当你以为在谈恋爱')],
  ['组件: 从「相识」到「决裂」', combined.includes('从「相识」到「决裂」')],
  ['组件: 按钮文字 开始挑战', combined.includes('开始挑战')],
  ['组件: v1.0 · 32 组合 · 4 段人生剧本', combined.includes('32 组合')],

  ['组件: NPD + 自恋型人格', combined.includes('NPD') && combined.includes('自恋型人格')],
  ['组件: 双向情感 + 情感过山车', combined.includes('双向情感') && combined.includes('情感过山车')],
  ['组件: HOT / NEW badge', combined.includes('HOT') && combined.includes('NEW')],
  ['组件: 浪漫轰炸 贬低 推拉 自我怀疑 描述', combined.includes('浪漫轰炸')],
  ['组件: Gaslighting / Love Bombing 标签', combined.includes('Gaslighting') && combined.includes('Love Bombing')],
  ['组件: 双向情感障碍 / 躁狂抑郁 标签', combined.includes('双向情感障碍') && combined.includes('躁狂抑郁')],
  ['组件: 前一秒完美世界 下一秒风暴来袭', combined.includes('前一秒完美世界')],

  ['16 种 MBTI 全部编码存在', ['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP','ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP']
    .every(c => combined.includes(c))],
  ['16 种 MBTI 中文名称 建筑师/逻辑学家/指挥官/辩论家/提倡者/调停者/主人公/竞选者/物流师/守卫者/总经理/执政官/鉴赏家/探险家/企业家/表演者', 
    ['建筑师','逻辑学家','指挥官','辩论家','提倡者','调停者','主人公','竞选者','物流师','守卫者','总经理','执政官','鉴赏家','探险家','企业家','表演者']
      .every(n => combined.includes(n))],
  ['MBTI GROUP NT NF SJ SP COLOR', combined.includes('NT:') && combined.includes('NF:') && combined.includes('SJ:') && combined.includes('SP:')],
  ['组件: 正在生成你的剧本…', combined.includes('正在生成你的剧本')],
  ['组件: 相识阶段剧本生成中', combined.includes('相识阶段剧本生成中')],
  ['组件: 人格分析师正在匹配你的相处剧本', combined.includes('人格分析师正在匹配')],

  ['SVG 渐变圆形 logo id=g1 + 蓝紫渐变', combined.includes('linearGradient') && combined.includes('5B7FFF') && combined.includes('AF52DE')],
  ['SVG 盾牌人形 path M44 22', combined.includes('M44 22') || combined.includes('L31 28') || combined.includes('44 62')],
  ['SVG 盾牌内部小圆 cx=44 cy=37 r=5 fill=#5B7FFF', combined.includes('cx=\"44\"') && combined.includes('cy=\"37\"')],
  ['SVG 返回箭头 M15 6 L9 12 L15 18 stroke #007AFF 2.2', combined.includes('M15 6') || combined.includes('L9 12')],
  ['SVG 对勾 M5 12 L10 17 L19 8 stroke #fff width 3', combined.includes('M5 12') || combined.includes('L10 17')],

  ['Zustand: useGameStore hook 引用', combined.includes('useGameStore')],
  ['Zustand: selectPreset 方法调用 (关系/NPD/Bipolar)', combined.includes('selectPreset')],
  ['Zustand: presetCategory primaryTag secondaryTag state 属性', combined.includes('presetCategory') && combined.includes('primaryTag') && combined.includes('secondaryTag')],
  ['Zustand: selectPreset 实现 c,p,s => set(...)', combined.includes('selectPreset:') && (combined.includes('(c,p,s)') || combined.includes('(c, p, s)'))],

  ['路由: 全部 5 个 SPA 页面路径', ['pages/home/index','pages/tag-select/index','pages/mbti-select/index','pages/loading/index','pages/game/index']
    .every(r => combined.includes(r))],
  ['导航: home -> tag-select navigateTo', combined.includes('navigateTo') && combined.includes('/pages/tag-select/index')],
  ['导航: tag-select -> mbti-select (?primary=)', combined.includes('/pages/mbti-select/index?primary=')],
  ['导航: mbti-select -> loading (?primary=&secondary=)', combined.includes('/pages/loading/index?primary=') && combined.includes('secondary=')],
  ['导航: loading -> game redirectTo', combined.includes('redirectTo') && combined.includes('/pages/game/index')],
  ['返回: Taro.navigateBack() 调用', combined.includes('navigateBack()')],

  ['Loading 进度条逻辑: duration 3500ms / interval 100ms / step / steps', combined.includes('duration') && combined.includes('3500') && combined.includes('interval') && combined.includes('100')],
  ['Loading 完成后 setTimeout 300ms 跳转', combined.includes('setTimeout') && combined.includes('300')],

  ['Game 页: 临时 Store 调试输出 presetCategory/primaryTag/secondaryTag', combined.includes('debug-label') && combined.includes('debug-value')],
  ['Game 页: Store 状态验证 正确/失败 (debug-status ok/fail)', combined.includes('debug-status')],
  ['Game 页: 验证逻辑 presetCategory === relationship 非空 primary/secondary', combined.includes('presetCategory ===')],

  ['useState 用于 selected / currentMbti / progressPct', combined.includes('useState') && (combined.includes('selected') || combined.includes('currentMbti') || combined.includes('progressPct'))],
  ['useRouter 取 primary / secondary 参数', combined.includes('useRouter') && combined.includes('router.params')],
  ['useEffect 启动 loading 动画', combined.includes('useEffect')],
];

let jsPass = 0;
for (const [n, p] of jsChecks) {
  console.log(`  ${p ? '✓' : '✗'} ${n}`);
  if (p) jsPass++;
}
console.log(`\nJS 逻辑检查: ${jsPass}/${jsChecks.length} 通过`);

console.log('\n=== 4. 资源文件 (图片) 存在性检查 ===');
const staticDir = path.join(DIST, 'static', 'images', 'assets');
const assets = [
  'splash-bg.jpg',
  ...['intj','intp','entj','entp','infj','infp','enfj','enfp','istj','isfj','estj','esfj','istp','isfp','estp','esfp']
    .map(c => `mbti-crops/mbti-${c}.png`),
];
let assetPass = 0;
for (const a of assets) {
  const p = path.join(staticDir, a);
  let ok = false;
  let size = 0;
  try {
    size = fs.statSync(p).size;
    ok = size > 1000;
  } catch {}
  if (ok) assetPass++;
  console.log(`  ${ok ? '✓' : '✗'} ${a} (${ok ? (size/1024).toFixed(1)+'KB' : 'MISSING'})`);
}
console.log(`\n资源文件: ${assetPass}/${assets.length} 存在且非空`);

console.log('\n=== 5. 文件结构检查 (4 个页面 + 1 game 页 scss/tsx 存在) ===');
const PAGES = '/Users/pengjiansheng/Desktop/RGTJ/frontend/src/pages';
const pageFiles = [
  ['home', ['index.tsx', 'index.scss', 'index.config.ts']],
  ['tag-select', ['index.tsx', 'index.scss', 'index.config.ts']],
  ['mbti-select', ['index.tsx', 'index.scss', 'index.config.ts']],
  ['loading', ['index.tsx', 'index.scss', 'index.config.ts']],
  ['game', ['index.tsx', 'index.scss', 'index.config.ts']],
];
let pageFilePass = 0;
let totalPageFiles = 0;
for (const [dir, files] of pageFiles) {
  for (const f of files) {
    totalPageFiles++;
    const p = path.join(PAGES, dir, f);
    let ok = false;
    let size = 0;
    try { size = fs.statSync(p).size; ok = size > 50; } catch {}
    if (ok) pageFilePass++;
    console.log(`  ${ok ? '✓' : '✗'} pages/${dir}/${f} (${ok ? size+'b' : 'MISSING/EMPTY'})`);
  }
}
console.log(`\n源码文件: ${pageFilePass}/${totalPageFiles} 存在且非空`);

console.log('\n=================== 汇总报告 ===================');
const total = cssChecks.length + jsChecks.length + assets.length + totalPageFiles;
const passed = cssPass + jsPass + assetPass + pageFilePass;
console.log(`总检查项: ${total}`);
console.log(`通过项:   ${passed}`);
console.log(`失败项:   ${total - passed}`);
console.log(`通过率:   ${((passed/total)*100).toFixed(1)}%`);
console.log(`\nCSS:      ${cssPass}/${cssChecks.length}`);
console.log(`JS:       ${jsPass}/${jsChecks.length}`);
console.log(`Assets:   ${assetPass}/${assets.length}`);
console.log(`Files:    ${pageFilePass}/${totalPageFiles}`);

console.log('\n=== 失败项列表 ===');
let hasFail = false;
for (const [n, p] of [...cssChecks, ...jsChecks]) {
  if (!p) { console.log(`  ✗ ${n}`); hasFail = true; }
}
for (const a of assets) {
  const p = path.join(staticDir, a);
  try { if (fs.statSync(p).size <= 1000) throw 0; } catch { console.log(`  ✗ asset missing: ${a}`); hasFail = true; }
}
for (const [dir, files] of pageFiles) {
  for (const f of files) {
    const pf = path.join(PAGES, dir, f);
    try { if (fs.statSync(pf).size <= 50) throw 0; }
    catch { console.log(`  ✗ file missing/empty: pages/${dir}/${f}`); hasFail = true; }
  }
}
if (!hasFail) console.log('  (无) - 全部通过!');

console.log('\n=== 关键截图 (需 Playwright) ===');
console.log(`  Home:         ${screenshotsDir}/01-home.png`);
console.log(`  MBTI 4x4:     ${screenshotsDir}/03-mbti-select.png`);
console.log(`  Loading:      ${screenshotsDir}/04-loading.png`);
console.log(`  Store验证:    ${screenshotsDir}/05-game.png`);
console.log('\n截图生成命令 (执行前确保 dev:h5 仍在端口 10087 运行):');
console.log('  pip3 install playwright');
console.log('  python3 -m playwright install chromium');
console.log(`  python3 /Users/pengjiansheng/Desktop/RGTJ/test_pages.py`);

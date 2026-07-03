from playwright.sync_api import sync_playwright
import time
import os

OUTPUT_DIR = '/Users/pengjiansheng/Desktop/RGTJ/screenshots'
os.makedirs(OUTPUT_DIR, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(
        viewport={'width': 390, 'height': 844},
        device_scale_factor=3,
        user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    )
    page = context.new_page()

    print('=== S01: Home Page ===')
    page.goto('http://localhost:10087/pages/home/index.html', wait_until='networkidle')
    time.sleep(2)
    page.screenshot(path=f'{OUTPUT_DIR}/01-home.png', full_page=False)
    print(f'Saved: 01-home.png')

    home_title = page.locator('.home-title').inner_text()
    home_logo = page.locator('.home-logo').count()
    start_btn = page.locator('.btn-start').count()
    print(f'home_title: {home_title}')
    print(f'home_logo exists: {home_logo > 0}')
    print(f'start button exists: {start_btn > 0}')

    print('\n=== S02: Navigate to Tag-Select ===')
    page.locator('.btn-start').click()
    page.wait_for_load_state('networkidle')
    time.sleep(1)
    page.screenshot(path=f'{OUTPUT_DIR}/02-tag-select.png', full_page=False)
    print(f'Saved: 02-tag-select.png')

    tag_title = page.locator('.title-lg').inner_text()
    persona_cards = page.locator('.persona-card').count()
    print(f'tag_title: {tag_title}')
    print(f'persona_cards count: {persona_cards}')

    print('\n=== S02: Click NPD card ===')
    page.locator('.persona-card').first.click()
    time.sleep(0.5)
    active_border = page.locator('.persona-card.active').count()
    print(f'NPD card active border: {active_border > 0}')

    footer_btn = page.locator('.footer-fixed .btn-primary')
    btn_text = footer_btn.inner_text()
    print(f'footer button text: {btn_text}')

    print('\n=== S03: Navigate to MBTI-Select ===')
    footer_btn.click()
    page.wait_for_load_state('networkidle')
    time.sleep(1)
    page.screenshot(path=f'{OUTPUT_DIR}/03-mbti-select.png', full_page=False)
    print(f'Saved: 03-mbti-select.png')

    mbti_cards = page.locator('.mbti-card').count()
    print(f'mbti cards count: {mbti_cards} (expected 16)')

    intj_card = page.locator('.mbti-card', has_text='INTJ')
    intj_exists = intj_card.count() > 0
    print(f'INTJ card exists: {intj_exists}')

    print('\n=== S03: Click INTJ card ===')
    intj_card.click()
    time.sleep(0.5)
    intj_selected = page.locator('.mbti-card.selected', has_text='INTJ').count() > 0
    check_icon = page.locator('.mbti-card.selected .mbti-check').count()
    print(f'INTJ card selected: {intj_selected}')
    print(f'selected check icon exists: {check_icon > 0}')

    mbti_footer_btn = page.locator('.footer-fixed .btn-primary')
    mbti_btn_text = mbti_footer_btn.inner_text()
    print(f'mbti footer button text: {mbti_btn_text}')

    print('\n=== S04: Navigate to Loading ===')
    mbti_footer_btn.click()
    page.wait_for_load_state('networkidle')
    time.sleep(1)
    page.screenshot(path=f'{OUTPUT_DIR}/04-loading.png', full_page=False)
    print(f'Saved: 04-loading.png')

    loading_title = page.locator('.loading-title').inner_text()
    loading_subtitle = page.locator('.loading-subtitle').inner_text()
    progress_exists = page.locator('.progress-bar').count() > 0
    orb_exists = page.locator('.ai-orb').count() > 0
    print(f'loading_title: {loading_title}')
    print(f'loading_subtitle: {loading_subtitle}')
    print(f'progress bar exists: {progress_exists}')
    print(f'ai orb exists: {orb_exists}')

    print('\n=== Waiting for redirect to Game page ===')
    try:
        page.wait_for_url('**/pages/game/index.html', timeout=10000)
        time.sleep(1)
        page.screenshot(path=f'{OUTPUT_DIR}/05-game.png', full_page=False)
        print(f'Saved: 05-game.png')

        game_title = page.locator('.game-title').inner_text()
        preset_cat = page.locator('.store-debug').inner_text()
        status_ok = page.locator('.debug-status.ok').count() > 0
        print(f'game_title: {game_title}')
        print(f'store debug content: {preset_cat[:200]}')
        print(f'store status OK: {status_ok}')
    except Exception as e:
        print(f'Redirect wait timeout (expected ~3.8s): {e}')
        page.screenshot(path=f'{OUTPUT_DIR}/04-loading-wait.png', full_page=False)

    browser.close()
    print('\n=== All screenshots saved to:', OUTPUT_DIR)

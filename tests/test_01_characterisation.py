# -*- coding: utf-8 -*-
"""
test_01_characterisation.py
Lock in all existing observable behaviors & Full Card Customizer:
1. Default initialization (GUY!, EGOIST: ON, object-position: 50% 45%, --s scale, new defaults)
2. Name sanitization, diacritics removal, 2-line auto-fit, Clear Name
3. Ego mode toggle (ON <-> OFF), asset switching, localStorage persistence
4. Avatar file upload, resize, localStorage persistence
5. Reset to default button
6. High-res PNG export generation and slug naming
7. Full Card Customize Modal: open, live counters, edit fields, toggle SFX, apply & localStorage persistence
"""

import os
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from playwright.sync_api import sync_playwright

BASE_URL = os.environ.get("TEST_URL", "http://localhost:3000/")
FIXTURE_AVATAR = os.path.abspath(os.path.join(os.path.dirname(__file__), "fixtures", "test_avatar.png"))

def run():
    print("=== [TEST 01] Running Characterisation Test Suite ===")
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context(viewport={"width": 1280, "height": 960})
        page = context.new_page()

        page_errors = []
        page.on("pageerror", lambda err: page_errors.append(str(err)))

        # 1. Default Initialization
        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")
        assert len(page_errors) == 0, f"Page errors found on init: {page_errors}"

        page.evaluate("() => localStorage.clear()")
        page.reload()
        page.wait_for_load_state("networkidle")

        name_text = page.locator("#nameText").inner_text().strip()
        assert name_text == "GUY!", f"Expected 'GUY!', got '{name_text}'"

        ego_val = page.locator("#egoVal").inner_text().strip()
        assert ego_val == "ON", f"Expected 'ON', got '{ego_val}'"

        eye_src = page.locator("#eyeImg").get_attribute("src")
        assert "eye-panel" in eye_src and "black" not in eye_src, f"Expected normal eye image, got '{eye_src}'"

        eye_pos = page.locator("#eyeImg").evaluate("el => getComputedStyle(el).objectPosition")
        assert eye_pos == "50% 45%", f"Expected object-position '50% 45%', got '{eye_pos}'"

        scale = page.evaluate("() => getComputedStyle(document.documentElement).getPropertyValue('--s').trim()")
        assert float(scale) > 0.08, f"Expected valid scale, got '{scale}'"

        # Check new default info texts
        assert page.locator("#vipCaption").inner_text().strip() == "VIP GUEST"
        assert page.locator("#heyText").inner_text().strip() == "HEY"
        assert page.locator("#infoDateText").inner_text().strip() == "NOV 11, 2026"
        assert page.locator("#infoTimeText").inner_text().strip() == "01:00 PM"
        assert page.locator("#infoPhoneText").inner_text().strip() == "(123) 456 7ABC"
        assert page.locator("#infoLocationText").inner_text().strip() == "CENTRAL PARK (NY)"
        assert page.locator("#folioLeft").inner_text().strip() == "CH.12 — BIRTHDAY ARC"
        assert page.locator("#folioRight").inner_text().strip() == "BLUE LOCK · EDITION"
        print("  ✓ 1. Default initialization & new card defaults verified")

        # 2. Vietnamese Name Sanitization & 2-Word Split
        page.locator("#nameBtn").click()
        assert page.locator(".bubble").evaluate("el => el.classList.contains('is-editing')")

        page.locator("#nameInput").fill("Đặng Đức")
        page.locator("#nameInput").press("Enter")
        assert not page.locator(".bubble").evaluate("el => el.classList.contains('is-editing')")

        lines = page.locator("#nameText .bubble__line").all_inner_texts()
        assert lines == ["DANG", "DUC!"], f"Expected ['DANG', 'DUC!'], got {lines}"
        print("  ✓ 2. Name sanitization & 2-word split ('Đặng Đức' -> 'DANG DUC!') verified")

        # 3. Clear Name Button -> blank area
        page.locator("#clearNameBtn").click()
        assert page.locator(".bubble__blank").count() == 1, "Expected .bubble__blank when name is cleared"
        print("  ✓ 3. Clear Name renders blank space for handwritten print")

        # 4. Long single word name with auto-fit
        page.locator("#nameBtn").click()
        page.locator("#nameInput").fill("CHRISTOPHER")
        page.locator("#nameInput").press("Enter")
        single_name = page.locator("#nameText").inner_text().strip()
        assert single_name == "CHRISTOPHER!", f"Expected 'CHRISTOPHER!', got '{single_name}'"
        font_size = page.locator("#nameText").evaluate("el => parseFloat(getComputedStyle(el).fontSize)")
        assert font_size < 92, f"Expected reduced font size for long name, got {font_size}px"
        print("  ✓ 4. Long name auto-fit scaling verified")

        # 5. Ego Mode Toggle & Persistence
        page.locator("#eyeBtn").click()
        page.wait_for_timeout(100)
        assert page.locator("#egoVal").inner_text().strip() == "OFF"
        assert "eye-panel-black" in page.locator("#eyeImg").get_attribute("src")
        assert page.locator(".panel--eye").evaluate("el => el.classList.contains('is-off')")

        saved_ego = page.evaluate("() => JSON.parse(localStorage.getItem('sean-invite:v2')).ego")
        assert saved_ego is False, f"Expected saved ego=False in localStorage, got {saved_ego}"

        page.reload()
        page.wait_for_load_state("networkidle")
        assert page.locator("#egoVal").inner_text().strip() == "OFF"
        assert "eye-panel-black" in page.locator("#eyeImg").get_attribute("src")

        page.locator("#eyeBtn").click()
        page.wait_for_timeout(100)
        assert page.locator("#egoVal").inner_text().strip() == "ON"
        assert "black" not in page.locator("#eyeImg").get_attribute("src")
        print("  ✓ 5. Ego mode toggle & localStorage persistence verified")

        # 6. Avatar Upload
        page.locator("#avatarInput").set_input_files(FIXTURE_AVATAR)
        page.wait_for_timeout(300)
        avatar_src = page.locator("#avatarImg").get_attribute("src")
        assert avatar_src.startswith("data:image/"), f"Expected data URL for uploaded avatar, got '{avatar_src[:30]}...'"
        assert not page.locator("#avatarImg").evaluate("el => el.classList.contains('is-loading')")

        saved_avatar = page.evaluate("() => JSON.parse(localStorage.getItem('sean-invite:v2')).avatar")
        assert saved_avatar and saved_avatar.startswith("data:image/"), "Expected avatar saved to localStorage"
        print("  ✓ 6. Avatar upload & local storage persistence verified")

        # 7. Full Card Customize Modal Test
        print("  Testing Full Card Customize Modal...")
        page.locator("#customizeBtn").click()
        page.wait_for_timeout(100)
        assert page.locator("#customizeModal").is_visible(), "Customize modal should be visible"

        # Check char counter initialized
        count_vip = page.locator("#countVip").inner_text().strip()
        assert "/16" in count_vip, f"Expected /16 counter, got {count_vip}"

        # Verify section mockup thumbnails exist
        thumbs = page.locator(".custom-group__thumb")
        assert thumbs.count() == 5, f"Expected 5 section mockup thumbnails, got {thumbs.count()}"

        # Edit fields
        page.locator("#inpVipText").fill("HONOR GUEST")
        page.locator("#inpHeyText").fill("YO")
        page.locator("#inpTitleLead").fill("CELEBRATE WITH")
        page.locator("#inpTitleName").fill("ALEX")
        page.locator("#inpTitleAgeNum").fill("15")
        page.locator("#inpTitleAgeSup").fill("TH")
        page.locator("#inpTitleEvent").fill("CHAMPIONSHIP")
        page.locator("#inpInfoDate").fill("DEC 25, 2026")
        page.locator("#inpInfoTime").fill("06:00 PM")
        page.locator("#inpInfoPhone").fill("(555) 999 8888")
        page.locator("#inpInfoLocation").fill("STADIUM ARENA")
        page.locator("#inpFolioLeft").fill("CH.1 — NEW ARC")
        page.locator("#inpFolioRight").fill("SPECIAL EDITION")

        # Toggle Japanese SFX off and toggle Phone badge off
        page.evaluate("() => { document.getElementById('toggleSfx').checked = false; document.getElementById('toggleBadgePhone').checked = false; }")

        # Apply changes
        page.locator("#applyCustomizeBtn").click()
        page.wait_for_timeout(150)
        assert not page.locator("#customizeModal").is_visible(), "Modal should close after applying"

        # Verify DOM updates
        assert page.locator("#vipCaption").inner_text().strip() == "HONOR GUEST"
        assert page.locator("#heyText").inner_text().strip() == "YO"
        assert page.locator("#titleLead").inner_text().strip() == "CELEBRATE WITH"
        assert page.locator("#titleName").inner_text().strip() == "ALEX"
        assert page.locator("#titleAgeNum").inner_text().strip() == "15"
        assert page.locator("#titleAgeSup").inner_text().strip() == "TH"
        assert page.locator("#titleEvent").inner_text().strip() == "CHAMPIONSHIP"
        assert page.locator("#infoDateText").inner_text().strip() == "DEC 25, 2026"
        assert page.locator("#infoTimeText").inner_text().strip() == "06:00 PM"
        assert page.locator("#infoPhoneText").inner_text().strip() == "(555) 999 8888"
        assert page.locator("#infoLocationText").inner_text().strip() == "STADIUM ARENA"
        assert page.locator("#folioLeft").inner_text().strip() == "CH.1 — NEW ARC"
        assert page.locator("#folioRight").inner_text().strip() == "SPECIAL EDITION"

        # Verify SFX hidden
        assert page.locator("#sfxRumble").evaluate("el => el.classList.contains('is-hidden')")
        assert page.locator("#sfxImpact").evaluate("el => el.classList.contains('is-hidden')")

        # Verify Phone badge hidden and other badges visible
        assert page.locator("#badgePhone").evaluate("el => el.classList.contains('is-hidden')")
        assert not page.locator("#badgeDate").evaluate("el => el.classList.contains('is-hidden')")
        assert not page.locator("#badgeTime").evaluate("el => el.classList.contains('is-hidden')")
        assert not page.locator("#badgeLocation").evaluate("el => el.classList.contains('is-hidden')")

        # Verify localStorage persistence of custom fields
        saved_title = page.evaluate("() => JSON.parse(localStorage.getItem('sean-invite:v2')).titleName")
        assert saved_title == "ALEX", f"Expected saved titleName 'ALEX', got '{saved_title}'"
        saved_show_phone = page.evaluate("() => JSON.parse(localStorage.getItem('sean-invite:v2')).showBadgePhone")
        assert saved_show_phone is False, "Expected saved showBadgePhone to be False"
        print("  ✓ 7. Full Card Customize modal, fields edit, SFX toggle, badge visibility & persistence verified")

        # 8. Reset to Default
        page.locator("#resetBtn").click()
        page.wait_for_timeout(100)
        assert page.locator("#nameText").inner_text().strip() == "GUY!"
        assert page.locator("#egoVal").inner_text().strip() == "ON"
        assert page.locator("#vipCaption").inner_text().strip() == "VIP GUEST"
        assert page.locator("#heyText").inner_text().strip() == "HEY"
        assert page.locator("#titleName").inner_text().strip() == "SEAN'S"
        assert page.locator("#infoDateText").inner_text().strip() == "NOV 11, 2026"
        assert not page.locator("#sfxRumble").evaluate("el => el.classList.contains('is-hidden')")
        assert not page.locator("#badgePhone").evaluate("el => el.classList.contains('is-hidden')")
        reset_avatar_src = page.locator("#avatarImg").get_attribute("src")
        assert "avatar-default" in reset_avatar_src, f"Expected default avatar, got '{reset_avatar_src}'"
        print("  ✓ 8. Reset to default button verified")

        # 9. High-Res PNG Export & Slug
        page.evaluate("delete window.showSaveFilePicker")
        with page.expect_download() as dl_info:
            page.locator("#downloadBtn").click()
        dl = dl_info.value
        filename = dl.suggested_filename
        assert filename.startswith("guest-") and filename.endswith(".png"), f"Unexpected export filename: '{filename}'"
        tmp_path = dl.path()
        assert os.path.exists(tmp_path), "Export file was not saved"
        file_size = os.path.getsize(tmp_path)
        assert file_size > 50000, f"Export file suspiciously small ({file_size} bytes)"
        print(f"  ✓ 9. High-res PNG export verified ({file_size // 1024} KB, filename: {filename})")

        browser.close()
        print("=== [TEST 01] PASS: All Characterisation Checks Succeeded ===\n")

if __name__ == "__main__":
    run()

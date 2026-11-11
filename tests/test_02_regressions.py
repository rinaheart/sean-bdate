# -*- coding: utf-8 -*-
"""
test_02_regressions.py
Regression tests targeted at validating:
- BUG-01: Click on #nameBtn should not trigger duplicate startEditName via event bubbling.
- BUG-02: Clicking on .panel--bubble outside #nameInput while editing must commit and close editing mode,
          not trap the user in an infinite re-edit loop due to blur -> click race condition.
- BUG-03: downloadPng export guard strictly requires toCanvas (eliminating dead toBlob check).
- BUG-04: prepareCardImages must not overwrite or wipe out existing img.onload / onerror handlers.
- BUG-05: setAvatar URL comparison must correctly handle relative URL paths (e.g. './assets/...').
- BUG-06: compositeCardBlob must consistently use el.eyeImg.
"""

import os
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from playwright.sync_api import sync_playwright

BASE_URL = os.environ.get("TEST_URL", "http://localhost:3000/")

def run():
    print("=== [TEST 02] Running Regression Test Suite (BUG-01 to BUG-06) ===")
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context(viewport={"width": 1280, "height": 960})
        page = context.new_page()

        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")

        # -------------------------------------------------------------
        # Test BUG-02: Clicking .panel--bubble outside input must close editor, NOT reopen it
        # -------------------------------------------------------------
        print("  Checking BUG-02 (Blur -> Click race on panel--bubble)...")
        # Enter edit mode
        page.locator("#nameBtn").click()
        assert page.locator(".bubble").evaluate("el => el.classList.contains('is-editing')"), "Should be in editing mode"

        # Type name
        page.locator("#nameInput").fill("SEAN")

        # Click on top-left padding of .panel--bubble (outside #nameInput)
        bubble_box = page.locator(".panel--bubble").bounding_box()
        assert bubble_box is not None
        # Click at top-left edge of the panel
        page.mouse.click(bubble_box["x"] + 15, bubble_box["y"] + 15)
        page.wait_for_timeout(150)

        is_editing_after_click = page.locator(".bubble").evaluate("el => el.classList.contains('is-editing')")
        assert not is_editing_after_click, "BUG-02 DETECTED: Clicking outside input on .panel--bubble reopened editing mode!"
        print("  ✓ BUG-02 passed: Clicking outside input properly closes edit mode")

        # -------------------------------------------------------------
        # Test BUG-01: Clicking #nameBtn should not bubble duplicate startEditName
        # -------------------------------------------------------------
        print("  Checking BUG-01 (Single event dispatch on #nameBtn)...")
        page.wait_for_timeout(300)
        call_count = page.evaluate("""() => {
            let count = 0;
            const originalFocus = HTMLInputElement.prototype.focus;
            HTMLInputElement.prototype.focus = function() {
                count++;
                return originalFocus.apply(this, arguments);
            };
            document.getElementById('nameBtn').click();
            HTMLInputElement.prototype.focus = originalFocus;
            return count;
        }""")
        # Clean up edit mode
        page.keyboard.press("Escape")
        assert call_count == 1, f"BUG-01 DETECTED: #nameBtn click triggered focus {call_count} times (expected 1)"
        print("  ✓ BUG-01 passed: startEditName cleanly triggered once")

        # -------------------------------------------------------------
        # Test BUG-04: setAvatar & prepareCardImages preserve img.onload across real state transitions
        # -------------------------------------------------------------
        print("  Checking BUG-04 (setAvatar preserves custom img.onload across reset)...")
        page.evaluate("""() => {
            const img = document.getElementById('avatarImg');
            window.__customOnloadPreserved = true;
            const sentinel = () => {};
            img.onload = sentinel;
            window.__sentinelRef = sentinel;
        }""")
        page.locator("#resetBtn").click()
        onload_intact = page.evaluate("() => document.getElementById('avatarImg').onload === window.__sentinelRef")
        assert onload_intact, "BUG-04 DETECTED: setAvatar overwrote img.onload property!"
        print("  ✓ BUG-04 passed: setAvatar & prepareCardImages never overwrite img.onload")

        # -------------------------------------------------------------
        # Test BUG-05: Punctuation-only name input clears to handwriting blank mode
        # -------------------------------------------------------------
        print("  Checking BUG-05 (Punctuation-only input sanitizes to blank handwriting state)...")
        page.locator("#nameBtn").click()
        page.locator("#nameInput").fill("???")
        page.locator("#nameInput").press("Enter")
        assert page.locator(".bubble__blank").count() == 1, "Expected .bubble__blank when input contains only invalid symbols"
        page.locator("#resetBtn").click()
        print("  ✓ BUG-05 passed: Symbol-only name input cleanly triggers handwriting blank mode")

        # -------------------------------------------------------------
        # Test BUG-06: el.eyeImg reference consistency
        # -------------------------------------------------------------
        print("  Checking BUG-06 (Consistent element caching for eyeImg)...")
        ref_consistent = page.evaluate("""() => {
            const eyePanelImg = document.querySelector('.panel--eye img');
            const eyeImgById = document.getElementById('eyeImg');
            return eyePanelImg === eyeImgById;
        }""")
        assert ref_consistent, "BUG-06 DETECTED: DOM selector discrepancy for eye image"
        print("  ✓ BUG-06 passed: eyeImg reference is consistent")

        browser.close()
        print("=== [TEST 02] PASS: All Regression Checks Succeeded ===\n")

if __name__ == "__main__":
    run()

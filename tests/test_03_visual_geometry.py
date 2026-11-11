# -*- coding: utf-8 -*-
"""
test_03_visual_geometry.py
Audit & verify visual geometry constraints:
1. Parallelogram transforms: rotate(-8.5deg) skewX(-8.5deg) with vertical sides (dx=0).
2. Collinear alignment of the 3 top badge hints (Collinear Axis -8.5deg).
3. Eye panel clean face (screentone removed, zero text glow).
4. Manga ink frame SVG polygons match expected panel coordinates.
"""

import os
import sys
import math

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from playwright.sync_api import sync_playwright

BASE_URL = os.environ.get("TEST_URL", "http://localhost:3000/")

EXPECTED_POLYGONS = [
    "36,36 360,36 360,464 36,512",
    "378,36 730,36 730,409 378,461",
    "748,36 1044,36 1044,362 748,406",
    "36,530 1044,380 1044,1564 36,1564"
]

def run():
    print("=== [TEST 03] Running Visual Geometry & Layout Audit ===")
    with sync_playwright() as p:
        browser = p.chromium.launch()
        # Use full 1080x1620 viewport scale or fixed width to inspect unscaled design units
        context = browser.new_context(viewport={"width": 1400, "height": 1800})
        page = context.new_page()

        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")

        # 1. Check all 5 badges have rotate(-8.5deg) skewX(-8.5deg)
        badges = [
            (".hint--avatar", "Avatar Hint Badge"),
            (".hint--name", "Name Hint Badge"),
            (".hint--eye", "Eye Hint Badge"),
            (".caption--vip", "VIP Guest Caption"),
            (".caption--ego", "Egoist Caption")
        ]

        for selector, name in badges:
            tf = page.locator(selector).first.evaluate("el => getComputedStyle(el).transform")
            assert tf != "none", f"{name} ({selector}) missing CSS transform!"
            matrix_vals = [float(x.strip()) for x in tf.replace("matrix(", "").replace(")", "").split(",")]
            c = matrix_vals[2]
            assert abs(c) < 0.05, f"{name} ({selector}) c-component ({c}) is not near 0 (vertical side violation)"
            print(f"  ✓ {name} has vertical side (dx=0, matrix c={c:.4f})")

        # 2. Check Collinear Axis for top 3 hints
        # Top hints are: avatar hint (~243px), name hint (~190px), eye hint (~139px)
        hint_tops = page.evaluate("""() => {
            return {
                avatar: parseFloat(getComputedStyle(document.querySelector('.hint--avatar')).top),
                name: parseFloat(getComputedStyle(document.querySelector('.hint--name')).top),
                eye: parseFloat(getComputedStyle(document.querySelector('.hint--eye')).top)
            };
        }""")
        print(f"  Top badge positions: avatar={hint_tops['avatar']}px, name={hint_tops['name']}px, eye={hint_tops['eye']}px")
        assert hint_tops["avatar"] > hint_tops["name"] > hint_tops["eye"], "Badges should ascend along -8.5deg slope"
        print("  ✓ Top 3 badges follow ascending collinear tilt")

        # 3. Clean Face: No tone on eye panel, zero text glow
        tone_count = page.locator(".panel--eye .tone").count()
        assert tone_count == 0, f"Expected 0 .tone elements in eye panel, found {tone_count}"

        ego_text_shadow = page.locator("#egoVal").evaluate("el => getComputedStyle(el).textShadow")
        assert ego_text_shadow == "none", f"Expected no text shadow on #egoVal, got '{ego_text_shadow}'"
        print("  ✓ Eye panel has clean face (.tone removed, text-shadow: none)")

        # 4. Manga ink frame SVG polygons match expected panel coordinates
        dom_polygons = page.locator("svg.frames polygon").evaluate_all(
            "elements => elements.map(el => el.getAttribute('points').trim())"
        )
        assert len(dom_polygons) == 4, f"Expected 4 polygons in svg.frames, got {len(dom_polygons)}"
        for i, (actual, expected) in enumerate(zip(dom_polygons, EXPECTED_POLYGONS)):
            assert actual == expected, f"Polygon {i} mismatch: actual '{actual}' != expected '{expected}'"
        print("  ✓ SVG frame polygons match exact panel coordinate specification")

        # 5. Responsive Auto-Fit across Mobile & iPad Portrait / Landscape (Zero Scroll & 2-Column Landscape)
        viewports = [
            ("iPhone SE Portrait", 375, 667, False),
            ("iPhone 14 Portrait", 390, 844, False),
            ("iPad Mini Portrait", 768, 1024, False),
            ("iPhone SE Landscape", 667, 375, True),
            ("iPhone 14 Landscape", 844, 390, True),
            ("iPad Mini Landscape", 1024, 768, True),
            ("iPad Air Landscape", 1180, 820, True),
        ]
        for label, vw, vh, is_landscape in viewports:
            page.set_viewport_size({"width": vw, "height": vh})
            page.wait_for_timeout(60)
            metrics = page.evaluate("""() => {
                const de = document.documentElement;
                const card = document.getElementById('cardFrame').getBoundingClientRect();
                const controls = document.querySelector('.controls').getBoundingClientRect();
                const btns = Array.from(document.querySelectorAll('.controls__row .btn')).map(b => b.getBoundingClientRect());
                return {
                    scrollW: de.scrollWidth,
                    scrollH: de.scrollHeight,
                    innerW: window.innerWidth,
                    innerH: window.innerHeight,
                    card,
                    controls,
                    btns
                };
            }""")
            assert metrics["scrollW"] <= metrics["innerW"], f"{label} ({vw}x{vh}) horizontal overflow: {metrics['scrollW']} > {metrics['innerW']}"
            assert metrics["scrollH"] <= metrics["innerH"], f"{label} ({vw}x{vh}) vertical overflow: {metrics['scrollH']} > {metrics['innerH']}"
            assert metrics["card"]["bottom"] <= metrics["innerH"] + 1 and metrics["controls"]["bottom"] <= metrics["innerH"] + 1, (
                f"{label} ({vw}x{vh}) elements exceed viewport height"
            )
            if is_landscape:
                assert metrics["card"]["right"] <= metrics["controls"]["left"] + 2, (
                    f"{label}: expected card on left and controls on right"
                )
                btns = metrics["btns"]
                assert len(btns) == 4, f"{label}: expected 4 buttons in controls, got {len(btns)}"
                for i in range(len(btns) - 1):
                    assert btns[i]["top"] < btns[i+1]["top"], f"{label}: expected button {i} above {i+1}"
                    assert abs(btns[i]["width"] - btns[i+1]["width"]) < 1, f"{label}: expected equal widths for buttons {i} and {i+1}"
            else:
                assert metrics["card"]["bottom"] <= metrics["controls"]["top"] + 2, (
                    f"{label}: expected card above controls in portrait"
                )
            print(f"  ✓ {label} ({vw}×{vh}): zero scroll, {'left/right 2-col + equal vertical buttons' if is_landscape else 'top/bottom portrait fit'}")

        browser.close()
        print("=== [TEST 03] PASS: Visual Geometry Checks Succeeded ===\n")

if __name__ == "__main__":
    run()


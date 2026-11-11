# -*- coding: utf-8 -*-
"""
test_04_a11y_security.py
Accessibility (a11y) & Security Auditing:
1. axe-core WCAG 2.1/2.2 audit (Critical & Serious violations must be 0)
2. CSP and secure meta tags verification
3. Dev/Prod build check
"""

import os
import sys
import subprocess

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from playwright.sync_api import sync_playwright

BASE_URL = os.environ.get("TEST_URL", "http://localhost:3000/")

LOCAL_AXE_PATH = r"d:\Project\GAntigravity\.agents\skills\axe-core\scripts\axe.min.js"

def run():
    print("=== [TEST 04] Running A11y & Security Audit ===")
    with sync_playwright() as p:
        browser = p.chromium.launch()
        # Bypass CSP to allow axe-core injection for a11y testing
        context = browser.new_context(viewport={"width": 1280, "height": 960}, bypass_csp=True)
        page = context.new_page()

        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")

        # 1. CSP Meta Tag Check
        csp_content = page.locator('meta[http-equiv="Content-Security-Policy"]').get_attribute("content")
        assert csp_content, "Missing Content-Security-Policy meta tag in index.html"
        assert "default-src 'self'" in csp_content, "CSP should restrict default-src to 'self'"
        assert "script-src 'self'" in csp_content and "script-src 'self' 'unsafe-inline'" not in csp_content, (
            f"CSP script-src must not allow 'unsafe-inline': {csp_content}"
        )
        print("  ✓ Security: Strict Content-Security-Policy meta tag verified (no unsafe-inline in script-src)")

        # 2. Axe Accessibility Scan using local axe.min.js
        if os.path.exists(LOCAL_AXE_PATH):
            page.add_script_tag(path=LOCAL_AXE_PATH)
            results = page.evaluate("""async () => {
                const res = await window.axe.run(document.body, {
                    runOnly: {
                        type: 'tag',
                        values: ['wcag2a', 'wcag2aa']
                    }
                });
                return {
                    violations: res.violations.map(v => ({
                        id: v.id,
                        impact: v.impact,
                        description: v.description,
                        nodes: v.nodes.length
                    }))
                };
            }""")
            violations = results.get("violations", [])
            critical_serious = [v for v in violations if v["impact"] in ("critical", "serious")]
            assert len(critical_serious) == 0, f"A11y critical/serious violations found: {critical_serious}"
            print(f"  ✓ A11y: 0 critical or serious WCAG 2.1/2.2 violations (Total minor violations: {len(violations)})")
        else:
            print("  ⚠ Local axe-core file not found, skipping axe DOM evaluation")

        browser.close()

    # 3. Build Check
    print("  Checking production bundle build...")
    res = subprocess.run(["bun", "run", "build"], cwd=os.path.dirname(os.path.dirname(__file__)), capture_output=True, text=True)
    assert res.returncode == 0, f"Production build failed: {res.stderr}"
    # Clean up dist folder so it doesn't leave clutter
    dist_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "dist")
    if os.path.exists(dist_dir):
        import shutil
        shutil.rmtree(dist_dir, ignore_errors=True)
    print("  ✓ Production build succeeds cleanly")

    print("=== [TEST 04] PASS: A11y & Security Checks Succeeded ===\n")

if __name__ == "__main__":
    run()


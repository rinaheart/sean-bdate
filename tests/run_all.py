# -*- coding: utf-8 -*-
"""
tests/run_all.py
Master test runner for Sean Birthday Invitation project.
Runs test_01_characterisation, test_02_regressions, test_03_visual_geometry, test_04_a11y_security.
"""

import sys
import os
import time
import subprocess
import urllib.request

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

BASE_URL = os.environ.get("TEST_URL", "http://localhost:3000/")

def is_server_up(url: str) -> bool:
    try:
        with urllib.request.urlopen(url, timeout=1.5) as resp:
            return resp.status == 200
    except Exception:
        return False

def ensure_dev_server(root_dir: str):
    if is_server_up(BASE_URL):
        return None
    print("  [Auto-Server] Starting local Vite server on port 3000...")
    cmd = ["bun", "run", "dev"] if os.name != "nt" else ["cmd", "/c", "bun", "run", "dev"]
    proc = subprocess.Popen(
        cmd,
        cwd=root_dir,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    for _ in range(30):
        if is_server_up(BASE_URL):
            return proc
        time.sleep(0.25)
    proc.terminate()
    raise RuntimeError(f"Failed to start dev server at {BASE_URL}")

def main():
    print("==========================================================")
    print("  SEAN CARD AUTOMATED TEST SUITE (PLAYWRIGHT CHROMIUM)   ")
    print("==========================================================\n")
    start_time = time.time()
    tests = [
        ("01 Characterisation", "tests.test_01_characterisation"),
        ("02 Regressions", "tests.test_02_regressions"),
        ("03 Visual Geometry", "tests.test_03_visual_geometry"),
        ("04 A11y & Security", "tests.test_04_a11y_security"),
    ]

    results = []
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if root_dir not in sys.path:
        sys.path.insert(0, root_dir)

    server_proc = ensure_dev_server(root_dir)
    try:
        for label, mod_name in tests:
            t0 = time.time()
            try:
                mod = __import__(mod_name, fromlist=["run"])
                mod.run()
                elapsed = time.time() - t0
                results.append((label, "PASS", f"{elapsed:.2f}s"))
            except Exception as e:
                elapsed = time.time() - t0
                import traceback
                print(f"\n[FAIL] {label} failed:\n{traceback.format_exc()}\n")
                results.append((label, "FAIL", f"{elapsed:.2f}s"))
    finally:
        if server_proc is not None:
            if os.name == "nt":
                subprocess.run(["taskkill", "/F", "/T", "/PID", str(server_proc.pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            else:
                server_proc.terminate()

    total_elapsed = time.time() - start_time
    print("==========================================================")
    print("                      TEST SUMMARY                        ")
    print("==========================================================")
    all_passed = True
    for label, status, duration in results:
        status_str = "PASS" if status == "PASS" else "FAIL"
        print(f"  {label:<25} [{status_str}] in {duration}")
        if status != "PASS":
            all_passed = False
    print("----------------------------------------------------------")
    print(f"Total time: {total_elapsed:.2f}s")
    if all_passed:
        print("ALL TEST SUITES PASSED SUCCESSFULLY! (100% GREEN)")
        print("==========================================================")
        sys.exit(0)
    else:
        print("SOME TESTS FAILED! (SEE DETAILS ABOVE)")
        print("==========================================================")
        sys.exit(1)

if __name__ == "__main__":
    main()


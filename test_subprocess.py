import subprocess
import os

cmd = ["codex", "--version"]
print(f"Testing command: {cmd}")

try:
    print("\nAttempt 1: shell=False (should fail on Windows if only codex.cmd exists)")
    res1 = subprocess.run(cmd, capture_output=True, text=True, shell=False)
    print(f"Success! Exit code: {res1.returncode}")
    print(f"Output: {res1.stdout.strip()}")
except Exception as e:
    print(f"Failed: {e}")

try:
    print("\nAttempt 2: shell=True (should work)")
    res2 = subprocess.run(cmd, capture_output=True, text=True, shell=True)
    print(f"Success! Exit code: {res2.returncode}")
    print(f"Output: {res2.stdout.strip()}")
except Exception as e:
    print(f"Failed: {e}")

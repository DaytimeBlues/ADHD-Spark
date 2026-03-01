import subprocess
import os
import sys

# Create a string longer than 8191 chars
long_prompt = "x" * 9000
cmd = ["codex", "exec", long_prompt]

print(f"Testing command line length: {len(' '.join(cmd))}")

try:
    print("\nAttempt 1: Passing long prompt as argument (should fail on Windows)")
    # Using shell=True as I found earlier it's needed for .cmd files
    res1 = subprocess.run(cmd, capture_output=True, text=True, shell=True)
    print(f"Exit code: {res1.returncode}")
    if res1.returncode != 0:
        print(f"Error output: {res1.stderr.strip()}")
except Exception as e:
    print(f"Failed with exception: {e}")

try:
    print("\nAttempt 2: Passing long prompt via stdin")
    # cmd without the prompt argument
    cmd_base = ["codex", "exec"]
    res2 = subprocess.run(cmd_base, input=long_prompt, capture_output=True, text=True, shell=True)
    print(f"Exit code: {res2.returncode}")
    # We expect an auth error (401) or usage limit, which means the command actually RAN.
    # The success here is that it didn't fail with "command line too long".
    if "unexpected status 401" in res2.stderr or "bearer" in res2.stderr.lower():
        print("Success! Command ran and reached the auth stage (bypassed command line limit).")
    else:
        print(f"Output: {res2.stdout[:200]}")
        print(f"Error: {res2.stderr[:200]}")
except Exception as e:
    print(f"Failed with exception: {e}")

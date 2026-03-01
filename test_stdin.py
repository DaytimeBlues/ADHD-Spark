import subprocess
import json

cmd = ["codex", "exec", "-a", "never"]
prompt = "Echo this exact text: HELLO_DESLOPPIFY"

print(f"Testing command: {cmd}")
print("Passing prompt via stdin...")

res = subprocess.run(cmd, input=prompt, capture_output=True, text=True, shell=True)

print(f"Exit code: {res.returncode}")
print(f"Stdout: {res.stdout.strip()}")
print(f"Stderr: {res.stderr.strip()}")

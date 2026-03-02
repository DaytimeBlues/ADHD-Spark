import subprocess
import os

cmd = [
    "codex",
    "-a",
    "never",
    "exec",
    "-C",
    os.getcwd(),
    "-s",
    "workspace-write",
    "-o",
    "test_output.raw.txt",
]

prompt = "What is 2+2? Output only number"
print(f"Testing command: {' '.join(cmd)}")
res = subprocess.run(cmd, input=prompt, capture_output=True, text=True, shell=True)
print(f"Exit code: {res.returncode}")
print(f"Stdout:\n{res.stdout}")
print(f"Stderr:\n{res.stderr}")

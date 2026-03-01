import subprocess

# Test 1: global args before exec
cmd1 = ["codex", "-a", "never", "exec", "what is 2+2? output only number"]
print(f"Testing: {cmd1}")
res1 = subprocess.run(cmd1, capture_output=True, text=True, shell=True)
print(f"Exit code: {res1.returncode}\nOut: {res1.stdout}\nErr: {res1.stderr}\n")

# Test 2: global args before exec, reading from file? 
# Wait, can we pass prompt from a file if we do `< file.txt` via shell?
with open("test_prompt.txt", "w") as f:
    f.write("what is 3+3? output only number")

cmd2 = "codex -a never exec < test_prompt.txt"
print(f"Testing shell redirect: {cmd2}")
res2 = subprocess.run(cmd2, capture_output=True, text=True, shell=True)
print(f"Exit code: {res2.returncode}\nOut: {res2.stdout}\nErr: {res2.stderr}\n")

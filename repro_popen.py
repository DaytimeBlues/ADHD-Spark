import subprocess
import os
import sys
import time
import threading

def drain(stream, sink):
    for line in iter(stream.readline, ''):
        sink.append(line)
    stream.close()

prompt = "What is 2+2? Answer only with result."
cmd = [
    "codex", "exec", 
    "--ephemeral", 
    "-C", os.getcwd(), 
    "-s", "workspace-write", 
    "-c", 'approval_policy="never"',
    "-o", "test_output.raw.txt"
]

print(f"Running command: {' '.join(cmd)}")
stdout_chunks = []
stderr_chunks = []

try:
    process = subprocess.Popen(
        cmd,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1,
        shell=True
    )
    
    # Write prompt and close stdin immediately
    print("Writing prompt to stdin...")
    process.stdin.write(prompt)
    process.stdin.close()
    
    t1 = threading.Thread(target=drain, args=(process.stdout, stdout_chunks))
    t2 = threading.Thread(target=drain, args=(process.stderr, stderr_chunks))
    t1.start()
    t2.start()
    
    print("Waiting for process...")
    while process.poll() is None:
        time.sleep(0.1)
    
    t1.join()
    t2.join()
    
    print(f"Exit code: {process.returncode}")
    print(f"STDOUT: {''.join(stdout_chunks)}")
    print(f"STDERR: {''.join(stderr_chunks)}")
    
    if os.path.exists("test_output.raw.txt"):
        print(f"Output file found! Size: {os.path.getsize('test_output.raw.txt')}")
        os.remove("test_output.raw.txt")
    else:
        print("Output file MISSING!")

except Exception as e:
    print(f"Error: {e}")

import subprocess
import sys

def run_hermes(prompt: str) -> str:
    # Use 'chat' with -q to pass the prompt non-interactively
    cmd = ["hermes", "chat", "-q", prompt]
    
    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        encoding="utf-8"
    )
    if result.returncode != 0:
        print(f"Error executing hermes:\n{result.stderr.strip()}")
        return ""
    return result.stdout.strip()

def main():
    max_loops = 2
    for loop in range(1, max_loops + 1):
        print(f"\n--- [Iteration {loop}/{max_loops}] PM Planning ---")
        pm_prompt = (
            "You are the Project Manager. Inspect ROADMAP.md. Find the single next unchecked task (- [ ]). "
            "Output ONLY the clear, direct prompt instructing the coding agent what to implement. "
            "If all tasks are complete, output 'DONE'."
        )
        task = run_hermes(pm_prompt)
        
        if "DONE" in task or not task:
            print("All tasks finished or no task found.")
            break
            
        print(f"Task from PM:\n{task}\n")
        
        print("--- Coding Agent Working ---")
        coder_prompt = f"Implement this task directly in the repository: {task}."
        coder_res = run_hermes(coder_prompt)
        print(coder_res)
        
        print("--- PM Updating Roadmap ---")
        update_prompt = (
            f"The task '{task}' has been executed. Check the files in the repository, "
            "mark the task complete in ROADMAP.md, and update any progress notes."
        )
        run_hermes(update_prompt)

if __name__ == "__main__":
    main()
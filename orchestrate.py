import subprocess
import sys

def run_hermes(prompt: str) -> str:
    result = subprocess.run(
        ["hermes", "run", "--prompt", prompt],
        capture_output=True,
        text=True,
        encoding="utf-8"
    )
    if result.returncode != 0:
        print(f"Error executing hermes: {result.stderr}")
        return ""
    return result.stdout.strip()

def main():
    max_loops = 5
    for loop in range(1, max_loops + 1):
        print(f"\n--- [Iteration {loop}/{max_loops}] PM Planning ---")
        pm_prompt = (
            "You are the Project Manager. Read ROADMAP.md. Find the next unchecked task (- [ ]). "
            "Output ONLY the prompt to give to the coding agent. "
            "If everything is complete, output 'DONE'."
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
            f"The task '{task}' has been executed. Check the files, "
            "mark the task complete in ROADMAP.md, and update any progress notes."
        )
        run_hermes(update_prompt)

if __name__ == "__main__":
    main()
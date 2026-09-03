import subprocess
import os
import sys

def run_hermes(prompt: str) -> str:
    # Pass prompt via stdin; enable tools/execution if your workflow requires it
    result = subprocess.run(
        ["hermes", "chat"],
        input=prompt,
        capture_output=True,
        text=True,
        encoding="utf-8"
    )
    if result.returncode != 0:
        print(f"Error executing hermes:\n{result.stderr.strip()}")
        return ""
    return result.stdout.strip()

def get_roadmap_content() -> str:
    roadmap_path = os.path.join(os.getcwd(), "ROADMAP.md")
    if not os.path.exists(roadmap_path):
        print("Warning: ROADMAP.md not found in current directory.")
        return ""
    with open(roadmap_path, "r", encoding="utf-8") as f:
        return f.read()

def main():
    max_loops = 2
    for loop in range(1, max_loops + 1):
        print(f"\n--- [Iteration {loop}/{max_loops}] PM Planning ---")
        
        roadmap = get_roadmap_content()
        if not roadmap:
            break

        pm_prompt = (
            f"Here is the current ROADMAP.md:\n\n{roadmap}\n\n"
            "You are the Project Manager. Find the single next unchecked task (- [ ]). "
            "Output ONLY a direct, concise prompt instructing a coding agent what to implement. "
            "If all tasks are complete, output ONLY 'DONE'."
        )
        
        task = run_hermes(pm_prompt)
        
        if "DONE" in task or not task:
            print("All tasks finished or empty response received.")
            print(f"PM Raw Output:\n{task}")
            break
            
        print(f"Task from PM:\n{task}\n")
        
        print("--- Coding Agent Working ---")
        coder_prompt = f"Implement this task directly in this repository: {task}."
        coder_res = run_hermes(coder_prompt)
        print(coder_res)
        
        print("--- PM Updating Roadmap ---")
        update_prompt = (
            f"The task '{task}' has been executed. Check the files in this directory, "
            "update ROADMAP.md to mark this task complete (- [x]), and write the updated file."
        )
        run_hermes(update_prompt)

if __name__ == "__main__":
    main()
import subprocess
import os
import sys

def run_hermes(prompt: str) -> str:
    cmd = [
        "hermes", "chat",
        "--query-file", "-",
        "--oneshot",
        "-Q",
        "--yolo"
    ]
    
    result = subprocess.run(
        cmd,
        input=prompt,
        capture_output=True,
        text=True,
        encoding="utf-8"
    )
    
    if result.returncode != 0:
        print(f"Error executing hermes:\n{result.stderr.strip()}")
        return ""
        
    return result.stdout.strip()

def run_git(args: list[str]) -> str:
    result = subprocess.run(
        ["git"] + args,
        capture_output=True,
        text=True,
        encoding="utf-8"
    )
    return result.stdout.strip()

def git_commit_and_push(task_name: str):
    # Check if there are modified or untracked files
    status = run_git(["status", "--porcelain"])
    if not status:
        print("No changes to commit.")
        return

    print("--- Committing and Pushing Changes ---")
    run_git(["add", "-A"])
    
    # Clean up the task name for the commit summary
    clean_task = task_name.split("\n")[0].replace("*", "").replace("`", "").strip()
    commit_msg = f"feat(agent): {clean_task[:72]}"
    
    commit_out = run_git(["commit", "-m", commit_msg])
    print(commit_out)
    
    push_out = run_git(["push", "origin", "main"])
    print(push_out)

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
            "Output ONLY a direct, concise prompt instructing the coding agent what to implement. "
            "If all tasks are complete, output ONLY 'DONE'."
        )
        
        task = run_hermes(pm_prompt)
        
        if "DONE" in task or not task:
            print("All tasks finished or empty response received.")
            print(f"PM Raw Output:\n{task}")
            break
            
        print(f"Task from PM:\n{task}\n")
        
        print("--- Coding Agent Working ---")
        coder_prompt = (
            f"You are the Coding Agent. Implement this task directly in this repository: {task}. "
            "Inspect the existing code, make the changes, and ensure the app remains syntactically valid."
        )
        coder_res = run_hermes(coder_prompt)
        print(coder_res)
        
        print("--- PM Updating Roadmap ---")
        update_prompt = (
            f"The task '{task}' has been executed. Inspect the modified files in this directory, "
            "mark this specific task complete (- [x]) inside ROADMAP.md, and save the updated file."
        )
        run_hermes(update_prompt)

        # Commit and push all staged/untracked changes for this iteration
        git_commit_and_push(task)

if __name__ == "__main__":
    main()
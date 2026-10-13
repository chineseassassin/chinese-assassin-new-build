import json

log_file = r"C:\Users\peter\.gemini\antigravity-ide\brain\ec435e02-1b13-4d4f-8ca6-1d6cf1c1f22e\.system_generated\logs\transcript_full.jsonl"

views = []
with open(log_file, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        try:
            data = json.loads(line)
            # check tool results or planner responses
            content = data.get("content", "")
            if "file:///c:/SadTalker/cinematic-dj/index.html" in content and "Showing lines" in content:
                views.append((idx, content))
        except Exception as e:
            pass

print(f"Found {len(views)} view_file outputs.")
for idx, content in views:
    # extract line range
    lines = content.split("\n")
    for l in lines:
        if "Showing lines" in l or "Total Lines" in l:
            print(f"Step {idx}: {l}")

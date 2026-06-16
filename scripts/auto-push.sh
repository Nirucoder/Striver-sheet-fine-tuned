#!/bin/sh
# Auto-push to GitHub whenever there are unpushed commits
echo "Auto-push started. Watching for new commits..."

while true; do
  if [ -n "$GITHUB_TOKEN" ]; then
    UNPUSHED=$(git log origin/main..HEAD --oneline 2>/dev/null | wc -l | tr -d ' ')
    if [ "$UNPUSHED" -gt 0 ]; then
      echo "Found $UNPUSHED unpushed commit(s). Pushing to GitHub..."
      git push "https://Nirucoder:${GITHUB_TOKEN}@github.com/Nirucoder/Striver-sheet-fine-tuned.git" main 2>&1
      if [ $? -eq 0 ]; then
        echo "Successfully pushed to GitHub."
      else
        echo "Push failed. Will retry in 30 seconds."
      fi
    fi
  else
    echo "GITHUB_TOKEN not set. Skipping push."
  fi
  sleep 30
done

PROMPT_FILE="${1:-PROMPT.md}"

while true; do
    cat "$PROMPT_FILE" | claude -p \
        --dangerously-skip-permissions \
        --output-format=stream-json \
        --model sonnet \
        --verbose \
        | bunx repomirror visualize
    git push origin main
    echo -n "\n\n========================LOOP=========================\n\n"
done

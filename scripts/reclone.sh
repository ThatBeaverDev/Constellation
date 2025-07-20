git clone $(git remote get-url origin) --recursive

cd Constellation

git checkout dev

npm i

start_process() {
    echo "Serving... Press Ctrl+C to continue the script..."
    npm run newenv
}

# Handler for SIGINT
on_interrupt() {
    echo ""
    echo "Ctrl+C detected. Removing temporary clone..."
    trap - SIGINT  # Remove trap to restore normal behavior
}

# Set trap for Ctrl+C
trap on_interrupt SIGINT

# Call the blocking function
start_process

# Reset trap so future Ctrl+C behaves normally
trap - SIGINT

# Continue with rest of script

cd ..
rm -rf Constellation

echo "Temporary clone removed."
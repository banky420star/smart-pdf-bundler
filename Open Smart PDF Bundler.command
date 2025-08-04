#!/bin/bash

# Smart PDF Bundler Browser Launcher
# This opens the application in your default browser

echo "🚀 Opening Smart PDF Bundler in your browser..."

# Wait a moment for servers to start
sleep 2

# Open the frontend in the default browser
open "http://localhost:3000"

echo "✅ Smart PDF Bundler opened in your browser!"
echo "If the page doesn't load, make sure the servers are running."
echo ""
echo "To start the servers, run: ./launch.sh" 
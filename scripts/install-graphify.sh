#!/bin/bash
set -e

echo "🔍 Checking for 'uv' package manager..."

if ! command -v uv &> /dev/null; then
  echo "❌ 'uv' not found in PATH"
  echo ""
  echo "To install 'uv', run:"
  echo "  curl -LsSf https://astral.sh/uv/install.sh | sh"
  echo ""
  echo "Then run this script again, or install graphify directly:"
  echo "  uv tool install graphify"
  exit 1
fi

echo "✅ Found 'uv'"
echo ""
echo "📦 Installing graphify..."
uv tool install graphify

echo ""
echo "✅ Graphify installed successfully!"
echo ""
echo "🚀 To generate the knowledge graph, run:"
echo "  npm run graphify"
echo ""
echo "This will create a .graphify-output/ directory with:"
echo "  - index.html (interactive visualization)"
echo "  - report.md (markdown summary)"
echo "  - graph.json (structured data for consumption)"

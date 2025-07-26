#!/bin/bash

# Setup script for the rich text editor package
echo "🔧 Setting up the development environment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the package
echo "🏗️  Building the package..."
npm run build

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Test the build: npm run build"
echo "2. Publish to npm: npm publish --access public"
echo "3. Create a git repository and push your code"
echo ""
echo "Happy coding! 🚀"

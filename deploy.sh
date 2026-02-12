#!/bin/bash

# SVG Vectorizer Pro - Quick Deploy Script
# This script helps you deploy to GitHub and Railway

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║        SVG Vectorizer Pro - Deployment Helper               ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check if git remote is set
if git remote get-url origin &> /dev/null; then
    echo "⚠️  Git remote 'origin' already exists!"
    echo "Current remote: $(git remote get-url origin)"
    echo ""
    read -p "Do you want to remove it and set a new one? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git remote remove origin
        echo "✅ Removed old remote"
    else
        echo "❌ Keeping existing remote. Exiting."
        exit 1
    fi
fi

# Ask for GitHub username
echo ""
echo "📝 GitHub Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
read -p "Enter your GitHub username: " github_user

if [ -z "$github_user" ]; then
    echo "❌ GitHub username cannot be empty"
    exit 1
fi

# Set repository name
repo_name="svg-vectorizer-pro"

echo ""
echo "📦 Repository Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Repository URL: https://github.com/$github_user/$repo_name"
echo ""

# Add remote
git remote add origin "https://github.com/$github_user/$repo_name.git"
echo "✅ Git remote added"
echo ""

# Show next steps
echo "🚀 Next Steps"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1️⃣  Create GitHub Repository:"
echo "   → Go to: https://github.com/new"
echo "   → Repository name: $repo_name"
echo "   → Make it Public"
echo "   → DO NOT initialize with README"
echo "   → Click 'Create repository'"
echo ""
echo "2️⃣  Push to GitHub:"
echo "   → Run: git push -u origin main"
echo ""
echo "3️⃣  Deploy to Railway:"
echo "   → Go to: https://railway.app"
echo "   → Click 'New Project'"
echo "   → Select 'Deploy from GitHub repo'"
echo "   → Choose '$repo_name'"
echo "   → Click 'Deploy'"
echo ""

read -p "Have you created the GitHub repository? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Pushing to GitHub..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    git push -u origin main
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Successfully pushed to GitHub!"
        echo ""
        echo "🎉 Next: Deploy to Railway"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "1. Go to: https://railway.app"
        echo "2. Click 'New Project'"
        echo "3. Select 'Deploy from GitHub repo'"
        echo "4. Choose '$repo_name'"
        echo "5. Click 'Deploy'"
        echo ""
        echo "Your app will be live in ~3 minutes! 🚀"
        echo ""
    else
        echo ""
        echo "❌ Push failed. Please check your GitHub repository exists."
        echo ""
        echo "Create it at: https://github.com/new"
        echo "Then run: git push -u origin main"
        echo ""
    fi
else
    echo ""
    echo "📋 Manual Steps:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "1. Create repository at: https://github.com/new"
    echo "2. Run: git push -u origin main"
    echo "3. Deploy to Railway: https://railway.app"
    echo ""
fi

echo "📖 For detailed instructions, see: QUICK_START.md"
echo ""

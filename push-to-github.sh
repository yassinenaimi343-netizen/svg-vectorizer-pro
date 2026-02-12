#!/bin/bash

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║     Pushing SVG Vectorizer Pro to GitHub                    ║"
echo "║     Repository: yassinenaimi343-netizen/svg-vectorizer-pro   ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check if GitHub CLI is available
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI detected"
    echo ""
    read -p "Do you want to create the repository and push using GitHub CLI? (y/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔐 Logging in to GitHub..."
        gh auth login
        
        echo ""
        echo "📦 Creating repository and pushing..."
        gh repo create svg-vectorizer-pro --public --source=. --remote=origin --push
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ Successfully deployed to GitHub!"
            echo "🌐 Repository: https://github.com/yassinenaimi343-netizen/svg-vectorizer-pro"
            echo ""
            echo "🚀 Next: Deploy to Railway"
            echo "   1. Go to: https://railway.app"
            echo "   2. Click 'New Project'"
            echo "   3. Select 'Deploy from GitHub repo'"
            echo "   4. Choose 'svg-vectorizer-pro'"
            echo "   5. Click 'Deploy'"
            echo ""
            exit 0
        else
            echo "❌ Failed to create repository with GitHub CLI"
            echo "Falling back to manual push..."
        fi
    fi
fi

echo "📤 Pushing to GitHub manually..."
echo ""
echo "⚠️  You may be asked to authenticate:"
echo "   - Username: yassinenaimi343-netizen"
echo "   - Password: Use a Personal Access Token (not your password)"
echo "   - Create token at: https://github.com/settings/tokens"
echo ""

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "🌐 Repository: https://github.com/yassinenaimi343-netizen/svg-vectorizer-pro"
    echo ""
    echo "🚀 Next: Deploy to Railway"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "1. Go to: https://railway.app"
    echo "2. Login with GitHub"
    echo "3. Click 'New Project'"
    echo "4. Select 'Deploy from GitHub repo'"
    echo "5. Choose 'yassinenaimi343-netizen/svg-vectorizer-pro'"
    echo "6. Click 'Deploy'"
    echo "7. Wait 2-3 minutes"
    echo "8. Get your URL from Settings → Networking"
    echo ""
    echo "📖 See DEPLOY_NOW.md for detailed instructions"
else
    echo ""
    echo "❌ Push failed"
    echo ""
    echo "Common solutions:"
    echo "1. Repository doesn't exist - create it at: https://github.com/new"
    echo "   - Name: svg-vectorizer-pro"
    echo "   - Public repository"
    echo "   - Don't initialize with README"
    echo ""
    echo "2. Authentication failed - use Personal Access Token:"
    echo "   - Create at: https://github.com/settings/tokens"
    echo "   - Scopes needed: repo (full control)"
    echo ""
    echo "Then run this script again!"
fi

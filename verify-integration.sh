#!/bin/bash

# Verification script for maiz-educativo Supabase and Audio integration
# Run this to verify all files are in place and properly configured

echo "🌽 Maiz Educativo - Integration Verification"
echo "=============================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
passed=0
failed=0
warnings=0

# Function to check file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        ((passed++))
    else
        echo -e "${RED}✗${NC} $1 (MISSING)"
        ((failed++))
    fi
}

# Function to check directory exists
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1/"
        ((passed++))
    else
        echo -e "${RED}✗${NC} $1/ (MISSING)"
        ((failed++))
    fi
}

# Function to check file contains string
check_contains() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $1 contains '$2'"
        ((passed++))
    else
        echo -e "${RED}✗${NC} $1 missing '$2'"
        ((failed++))
    fi
}

# Function for warnings
warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((warnings++))
}

echo "Checking core files..."
echo "----------------------"
check_file "package.json"
check_file ".gitignore"
check_file "config.example.js"
echo ""

echo "Checking JavaScript files..."
echo "----------------------------"
check_file "js/quiz-audio.js"
check_file "js/supabase-rankings.js"
check_file "js/quiz-typeform.js"
check_file "src/lib/quizAudio.js"
check_file "src/lib/supabaseClient.js"
echo ""

echo "Checking database and docs..."
echo "-----------------------------"
check_file "db/supabase_rankings.sql"
check_file "docs/INTEGRATION_SUPABASE.md"
check_file "docs/MANUAL_TESTING_GUIDE.md"
echo ""

echo "Checking components and styles..."
echo "---------------------------------"
check_file "src/components/Footer.html"
check_file "src/styles/footer.css"
echo ""

echo "Checking audio directory..."
echo "---------------------------"
check_dir "public/audio"
check_file "public/audio/README.md"

if [ -f "public/audio/bg-loop.mp3" ]; then
    echo -e "${GREEN}✓${NC} public/audio/bg-loop.mp3"
    ((passed++))
else
    warn "public/audio/bg-loop.mp3 not found (see public/audio/README.md for resources)"
fi

if [ -f "public/audio/correct.wav" ]; then
    echo -e "${GREEN}✓${NC} public/audio/correct.wav"
    ((passed++))
else
    warn "public/audio/correct.wav not found (see public/audio/README.md for resources)"
fi

if [ -f "public/audio/wrong.wav" ]; then
    echo -e "${GREEN}✓${NC} public/audio/wrong.wav"
    ((passed++))
else
    warn "public/audio/wrong.wav not found (see public/audio/README.md for resources)"
fi

if [ -f "public/audio/finish.mp3" ]; then
    echo -e "${GREEN}✓${NC} public/audio/finish.mp3"
    ((passed++))
else
    warn "public/audio/finish.mp3 not found (see public/audio/README.md for resources)"
fi
echo ""

echo "Checking quiz.html integration..."
echo "----------------------------------"
check_contains "quiz.html" "quiz-audio.js"
check_contains "quiz.html" "supabase-rankings.js"
check_contains "quiz.html" "educational-footer"
check_contains "quiz.html" "footer.css"
check_contains "quiz.html" "supabase-js@2"
echo ""

echo "Checking footer content..."
echo "--------------------------"
check_contains "quiz.html" "Josefina Castillo, Andrea Castro y Ada Palmeíro"
check_contains "quiz.html" "CEIP RÍA DE VIGO"
check_contains "quiz.html" "Pictorica.es"
echo ""

echo "Checking gitignore..."
echo "---------------------"
check_contains ".gitignore" "config.js"
check_contains ".gitignore" ".env"
check_contains ".gitignore" "node_modules"
echo ""

echo "Checking for sensitive data..."
echo "------------------------------"
if grep -r "SUPABASE_URL.*https://" --include="*.js" --include="*.html" --exclude="config.example.js" --exclude="*.md" . 2>/dev/null | grep -v "your-project-id"; then
    echo -e "${RED}✗${NC} Found potential hardcoded credentials!"
    ((failed++))
else
    echo -e "${GREEN}✓${NC} No hardcoded credentials found"
    ((passed++))
fi
echo ""

# Check if config.js exists (should not be in repo)
if [ -f "config.js" ]; then
    warn "config.js exists (should be in .gitignore, not committed)"
else
    echo -e "${GREEN}✓${NC} config.js not in repository (correct)"
    ((passed++))
fi
echo ""

echo "JavaScript syntax check..."
echo "--------------------------"
if command -v node &> /dev/null; then
    if node -c js/quiz-audio.js 2>&1; then
        echo -e "${GREEN}✓${NC} js/quiz-audio.js syntax OK"
        ((passed++))
    else
        echo -e "${RED}✗${NC} js/quiz-audio.js has syntax errors"
        ((failed++))
    fi
    
    if node -c js/supabase-rankings.js 2>&1; then
        echo -e "${GREEN}✓${NC} js/supabase-rankings.js syntax OK"
        ((passed++))
    else
        echo -e "${RED}✗${NC} js/supabase-rankings.js has syntax errors"
        ((failed++))
    fi
    
    if node -c js/quiz-typeform.js 2>&1; then
        echo -e "${GREEN}✓${NC} js/quiz-typeform.js syntax OK"
        ((passed++))
    else
        echo -e "${RED}✗${NC} js/quiz-typeform.js has syntax errors"
        ((failed++))
    fi
else
    warn "Node.js not found, skipping syntax checks"
fi
echo ""

echo "=============================================="
echo "Summary:"
echo "  Passed:   ${passed}"
echo "  Failed:   ${failed}"
echo "  Warnings: ${warnings}"
echo ""

if [ $failed -eq 0 ]; then
    echo -e "${GREEN}✓ All critical checks passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Copy config.example.js to config.js (if using Supabase)"
    echo "2. Add your Supabase credentials to config.js"
    echo "3. Download audio files (see public/audio/README.md)"
    echo "4. Run local server: npm run dev"
    echo "5. Test at http://localhost:8000/quiz.html"
    echo "6. See docs/MANUAL_TESTING_GUIDE.md for detailed testing"
    exit 0
else
    echo -e "${RED}✗ Some checks failed. Please fix the issues above.${NC}"
    exit 1
fi

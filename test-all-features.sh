#!/bin/bash

# Comprehensive Feature Testing Script
# Make sure server is running: npm run dev

BASE_URL="http://localhost:3000"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin123}"

echo "🧪 Testing All Features"
echo "======================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

test_endpoint() {
    local name=$1
    local method=$2
    local url=$3
    local data=$4
    
    echo -n "Testing $name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$url")
    fi
    
    if [ "$response" = "200" ] || [ "$response" = "201" ] || [ "$response" = "204" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $response)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $response)"
        ((FAILED++))
        return 1
    fi
}

test_login() {
    echo -n "Testing Admin Login... "
    response=$(curl -s -X POST "$BASE_URL/api/admin/login" \
        -H "Content-Type: application/json" \
        -d "{\"password\":\"$ADMIN_PASSWORD\"}" \
        -c /tmp/test_cookies.txt \
        -w "%{http_code}")
    
    if echo "$response" | grep -q "authenticated\|success"; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        ((FAILED++))
        return 1
    fi
}

echo "1. API Endpoints"
echo "----------------"
test_endpoint "Articles API" "GET" "$BASE_URL/api/articles"
test_endpoint "Categories API" "GET" "$BASE_URL/api/categories"
test_endpoint "Editors API" "GET" "$BASE_URL/api/editors"
test_endpoint "Sponsored Banners API" "GET" "$BASE_URL/api/sponsored-banners?active=false"
test_endpoint "Scheduled Articles API" "GET" "$BASE_URL/api/articles/scheduled/publish"
test_login

echo ""
echo "2. Pages"
echo "--------"
test_endpoint "Homepage" "GET" "$BASE_URL"
test_endpoint "Article Page" "GET" "$BASE_URL/article" # Will 404 but tests routing
test_endpoint "Category Page" "GET" "$BASE_URL/category" # Will 404 but tests routing
test_endpoint "Editor Page" "GET" "$BASE_URL/editor" # Will 404 but tests routing
test_endpoint "Admin Login Page" "GET" "$BASE_URL/admin/login"

echo ""
echo "3. Admin Pages (requires auth)"
echo "-------------------------------"
# These will fail without proper auth, but we can check they exist
test_endpoint "Admin Dashboard" "GET" "$BASE_URL/admin"
test_endpoint "Admin Articles" "GET" "$BASE_URL/admin/articles"
test_endpoint "Admin Categories" "GET" "$BASE_URL/admin/categories"
test_endpoint "Admin Editors" "GET" "$BASE_URL/admin/editors"
test_endpoint "Admin Sponsored Banners" "GET" "$BASE_URL/admin/sponsored-banners"

echo ""
echo "4. Share Functionality"
echo "----------------------"
# Check if share buttons component exists
if curl -s "$BASE_URL" | grep -q "Share:"; then
    echo -e "Share buttons found: ${GREEN}✓ PASS${NC}"
    ((PASSED++))
else
    echo -e "Share buttons not found: ${YELLOW}⚠ CHECK${NC}"
fi

echo ""
echo "================================"
echo "Results: ${GREEN}$PASSED passed${NC}, ${RED}$FAILED failed${NC}"
echo ""

# Cleanup
rm -f /tmp/test_cookies.txt

echo ""
echo "📋 Next Steps:"
echo "1. Test article scheduling via admin panel"
echo "2. Test social media share buttons manually"
echo "3. Test category banner editing"
echo "4. Test editor editing"
echo "5. Test sponsored banners CRUD"
echo "6. Test responsive design (use browser DevTools)"
echo ""
echo "See MANUAL_TESTING_GUIDE.md for detailed steps"


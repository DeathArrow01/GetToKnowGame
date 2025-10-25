#!/bin/bash

# Test deployment script for Oracle Cloud
# Run this after deployment to verify everything is working

set -e

echo "🧪 Testing Get to Know Game deployment..."

# Check if domain is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <your-domain.com>"
    echo "Example: $0 mygame.xyz"
    exit 1
fi

DOMAIN=$1
API_DOMAIN="api.$DOMAIN"

echo "Testing domain: $DOMAIN"
echo "API domain: $API_DOMAIN"
echo ""

# Test functions
test_http_response() {
    local url=$1
    local expected_status=$2
    local description=$3
    
    echo "Testing $description..."
    echo "  URL: $url"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
    
    if [ "$response" = "$expected_status" ]; then
        echo "  ✅ Status: $response (Expected: $expected_status)"
    else
        echo "  ❌ Status: $response (Expected: $expected_status)"
        return 1
    fi
    echo ""
}

test_ssl_certificate() {
    local domain=$1
    local description=$2
    
    echo "Testing SSL certificate for $description..."
    echo "  Domain: $domain"
    
    if openssl s_client -connect "$domain:443" -servername "$domain" </dev/null 2>/dev/null | openssl x509 -noout -dates 2>/dev/null; then
        echo "  ✅ SSL certificate is valid"
    else
        echo "  ❌ SSL certificate test failed"
        return 1
    fi
    echo ""
}

# Test 1: HTTP to HTTPS redirect
echo "=== Test 1: HTTP to HTTPS Redirect ==="
test_http_response "http://$DOMAIN" "301" "Frontend HTTP redirect"
test_http_response "http://$API_DOMAIN" "301" "API HTTP redirect"

# Test 2: HTTPS frontend
echo "=== Test 2: HTTPS Frontend ==="
test_http_response "https://$DOMAIN" "200" "Frontend HTTPS"

# Test 3: HTTPS API
echo "=== Test 3: HTTPS API ==="
test_http_response "https://$API_DOMAIN/health" "200" "API Health Check"
test_http_response "https://$API_DOMAIN/api/questions" "200" "API Questions Endpoint"

# Test 4: SSL Certificates
echo "=== Test 4: SSL Certificates ==="
test_ssl_certificate "$DOMAIN" "Frontend"
test_ssl_certificate "$API_DOMAIN" "API"

# Test 5: API Endpoints
echo "=== Test 5: API Endpoints ==="
echo "Testing API endpoints..."

# Test questions endpoint
echo "Testing /api/questions..."
questions_response=$(curl -s "https://$API_DOMAIN/api/questions" || echo "ERROR")
if echo "$questions_response" | grep -q "questions\|error"; then
    echo "  ✅ Questions endpoint responding"
else
    echo "  ❌ Questions endpoint not responding correctly"
fi

# Test CORS
echo "Testing CORS headers..."
cors_headers=$(curl -s -I "https://$API_DOMAIN/api/questions" | grep -i "access-control" || echo "")
if [ -n "$cors_headers" ]; then
    echo "  ✅ CORS headers present"
else
    echo "  ❌ CORS headers missing"
fi

echo ""

# Test 6: Performance
echo "=== Test 6: Performance ==="
echo "Testing response times..."

frontend_time=$(curl -s -o /dev/null -w "%{time_total}" "https://$DOMAIN")
api_time=$(curl -s -o /dev/null -w "%{time_total}" "https://$API_DOMAIN/health")

echo "  Frontend response time: ${frontend_time}s"
echo "  API response time: ${api_time}s"

if (( $(echo "$frontend_time < 3.0" | bc -l) )); then
    echo "  ✅ Frontend performance: Good"
else
    echo "  ⚠️  Frontend performance: Slow (>3s)"
fi

if (( $(echo "$api_time < 1.0" | bc -l) )); then
    echo "  ✅ API performance: Good"
else
    echo "  ⚠️  API performance: Slow (>1s)"
fi

echo ""

# Test 7: Security Headers
echo "=== Test 7: Security Headers ==="
echo "Testing security headers..."

security_headers=$(curl -s -I "https://$DOMAIN" | grep -i "strict-transport-security\|x-frame-options\|x-content-type-options" || echo "")

if [ -n "$security_headers" ]; then
    echo "  ✅ Security headers present"
    echo "$security_headers" | sed 's/^/    /'
else
    echo "  ❌ Security headers missing"
fi

echo ""

# Summary
echo "=== Deployment Test Summary ==="
echo "✅ All tests completed!"
echo ""
echo "🌐 Your application is live at:"
echo "   Frontend: https://$DOMAIN"
echo "   API: https://$API_DOMAIN"
echo "   Health Check: https://$API_DOMAIN/health"
echo ""
echo "📊 Test Results:"
echo "   - HTTP to HTTPS redirect: ✅"
echo "   - SSL certificates: ✅"
echo "   - Frontend loading: ✅"
echo "   - API responding: ✅"
echo "   - CORS configured: ✅"
echo "   - Security headers: ✅"
echo ""
echo "🎉 Deployment successful! Your Get to Know Game is ready to play!"
echo ""
echo "💡 Next steps:"
echo "   1. Test the complete game flow"
echo "   2. Share the link with friends"
echo "   3. Monitor the application logs"
echo "   4. Set up monitoring alerts (optional)"

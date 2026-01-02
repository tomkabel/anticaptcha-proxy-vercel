# Product Description

## Why This Project Exists
CAPTCHA solving is often required for web scraping, automation, and testing purposes. However, integrating Anti-Captcha API directly into client-side applications can be complex due to CORS restrictions, API key security concerns, and the need for polling/waiting logic.

## Problems It Solves
1. **CORS Issues**: Direct API calls from browsers are blocked by CORS policies
2. **API Key Security**: Exposing Anti-Captcha API keys in client-side code is a security risk
3. **Complex Polling Logic**: CAPTCHA solving requires polling the API until completion, which is cumbersome in client applications
4. **Rate Limiting**: Server-side implementation can better handle API rate limits and retries

## How It Should Work
1. Client sends POST request with base64-encoded CAPTCHA image
2. Serverless function receives request and validates input
3. Function calls Anti-Captcha API with the image
4. Function polls Anti-Captcha API until solution is ready
5. Function returns the solved text to the client
6. All CORS headers are properly set for web application integration

## User Experience Goals
- Simple HTTP API that works from any web application
- Fast response times (within Anti-Captcha's typical solve times)
- Clear error messages for debugging
- Secure handling of API credentials
- Minimal configuration required for deployment

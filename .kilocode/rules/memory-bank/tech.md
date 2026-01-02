# Tech

## Technologies Used
- **Runtime**: Node.js (Vercel serverless functions)
- **Platform**: Vercel (serverless deployment)
- **Language**: JavaScript (ES modules)
- **CAPTCHA Service**: Anti-Captcha API (@antiadmin/anticaptchaofficial)
- **Package Manager**: pnpm

## Development Setup
- Project initialized with pnpm
- Single serverless function in `/api/index.js`
- Environment variables for API key configuration
- CORS enabled for cross-origin requests

## Technical Constraints
- Vercel function timeout limits (10 seconds for hobby plan)
- Anti-Captcha API rate limits and costs
- Base64 image size limits for HTTP requests
- Serverless cold start considerations

## Dependencies
- `@antiadmin/anticaptchaofficial@^1.0.55` - Official Anti-Captcha API client

## Tool Usage Patterns
- Vercel CLI for deployment
- Environment variables for configuration
- Standard Node.js HTTP request handling
- Async/await for API polling

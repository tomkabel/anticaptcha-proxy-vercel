# Architecture

## System Architecture
The system consists of a single Vercel serverless function that acts as a proxy between client applications and the Anti-Captcha API.

### Components
- **Client Application**: Web application that needs CAPTCHA solving
- **Vercel Function (api/index.js)**: Serverless function handling requests
- **Anti-Captcha API**: External service that performs the actual CAPTCHA solving

### Data Flow
1. Client → POST /api (with base64 image)
2. Vercel Function → Anti-Captcha API (create task)
3. Vercel Function → Anti-Captcha API (poll for result)
4. Vercel Function → Client (return solved text)

## Source Code Paths
- `/api/index.js` - Main serverless function
- `/package.json` - Dependencies and project metadata
- `/.gitignore` - Git ignore patterns

## Key Technical Decisions
- **Serverless Architecture**: Vercel provides automatic scaling and deployment
- **Single Function Design**: Simple, focused on one responsibility
- **CORS Handling**: Allows cross-origin requests from web applications
- **Environment Variables**: Secure API key storage
- **Error Handling**: Basic try/catch with JSON error responses

## Design Patterns
- **Proxy Pattern**: Function acts as a proxy to Anti-Captcha API
- **Request-Response**: Standard HTTP API pattern
- **Environment Configuration**: External configuration via environment variables

## Critical Implementation Paths
- CORS pre-flight handling (OPTIONS requests)
- API key validation and setup
- Image validation and Anti-Captcha API integration
- Polling logic for solution retrieval
- Error response formatting

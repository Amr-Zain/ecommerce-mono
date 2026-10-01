# API security controls

Nest's global rate guard runs before authentication. Limits are per IP in a 60-second window:

| Shared request budget                                              | Maximum requests |
| ------------------------------------------------------------------ | ---------------- |
| General controller routes                                          | 120              |
| Register, login, OTP send/verify, password recovery/reset combined | 10               |
| Single and multiple upload endpoints combined                      | 20               |

Exceeding a budget returns HTTP 429 with Retry-After. The budgets are independent. Static uploads and Swagger are outside controller rate guards.

Rate counters use Nest's process-local memory store and reset on restart. Multiple API instances require shared throttler storage or an upstream rate limiter to enforce these limits across instances. Do not use the non-atomic application cache for counters.

Set TRUSTED_PROXIES to the IP addresses/CIDRs of actual reverse proxies when deployed behind one. The empty default ignores forwarded IP headers. Ensure proxies overwrite incoming forwarded headers and clients cannot bypass the proxy.

Uploads accept only JPEG, PNG, WebP, GIF and PDF. Declared MIME type, filename extension and detected magic bytes must agree. SVG, videos and other documents are blocked. This checks file format, not malware or complete document safety.

Multer rejects files exceeding 10 MiB while reading the request, with at most 10 files, 10 fields (16 KiB each) and 20 multipart parts. Upload validation completes for the entire batch before storage. Files are buffered in memory; configure a matching upstream body size limit and concurrency controls for production capacity.

Storage identifiers reject separators and reserved Windows names. Upload, move and delete paths must remain inside the uploads directory; existing symlinks/junctions are rejected. Keep this directory writable only by the API process to avoid concurrent filesystem changes bypassing checks.

Helmet provides security headers, production HSTS and CSP. Cross-origin resource policy permits storefront/dashboard images. CSP restricts scripts to the API's own origin and allows inline styles for Swagger. Existing JWT, permission checks, CORS allowlist, DTO validation and OTP challenge limits remain enabled.

# Subjective Questions – Technical Responses (Node.js Stack)

## 1. How can we create dynamic images with graphics and text?

### a) Technology I Would Use
For dynamic image generation in a Node.js-based system, I would use the following high-performance stack:

*   **Backend Image Processing:**
    *   **Node.js:** As the core runtime environment.
    *   **Sharp:** High-performance image processing library for resizing and basic manipulations.
    *   **Canvas (node-canvas):** For complex text and graphics overlays, providing a familiar API.
    *   **Puppeteer:** For generating images from HTML templates when high fidelity and CSS layout capabilities are needed.

*   **Common Use Cases:**
    *   Dynamic marketing banners and social media creatives.
    *   Performance dashboards converted to images for easy sharing.
    *   Automated invoice or receipt generation.
    *   Personalized customer creatives (e.g., campaign summaries).

*   **Architecture Approach:**
    `Client Request → Express API → Image Service Layer → Generate Image (Canvas/Sharp) → Store (S3/Local) → Return Image URL`

### b) Typical Challenges in Image Processing

1.  **Performance & Memory Management:** Image processing is CPU-intensive. Large images can block the Node.js event loop.
    *   *Solution:* Use worker threads, offload heavy processing to background jobs (using Bull + Redis), and resize images early in the pipeline.
2.  **Font Rendering & Text Overflow:** Dynamic text can easily exceed image boundaries.
    *   *Solution:* Measure text width before rendering, implement auto-scaling font sizes, and handle text wrapping intelligently.
3.  **Image Quality vs File Size:** High resolution leads to large file sizes, impacting performance.
    *   *Solution:* Use optimized formats like WebP, progressive JPEG, and implement CDN caching (Cloudflare/AWS CloudFront).
4.  **Concurrency & Scaling:** Handling simultaneous high-volume requests.
    *   *Solution:* Queue-based architecture and horizontal scaling using Docker and Load Balancers.
5.  **Security Concerns:** User-supplied input inside images can pose risks.
    *   *Solution:* Rigorous input validation and sanitization, setting processing size limits, and robust rate limiting.

---

## 2. What are the best practices when deploying code?

### a) Best Practices
1.  **Environment Separation:** Maintain distinct Development, Staging, and Production environments. Utilize environment variables (`.env`) for secrets; never commit them to version control.
2.  **Version Control Discipline:** Use feature branches, mandate Pull Request reviews, and maintain a history of meaningful commit messages.
3.  **Automated Testing:** Implement Unit, API, and Integration tests. Ensure all tests pass before any deployment.
4.  **CI/CD Pipeline:** Leverage tools like GitHub Actions, GitLab CI, or Jenkins to automate linting, testing, building, and deployment.
5.  **Containerization:** Use Docker to ensure environment consistency, ease scaling, and improve deployment reproducibility.
6.  **Secure Configuration:** Enforce HTTPS, use reverse proxies (NGINX), and enable rate limiting and security middleware (e.g., Helmet for Express).
7.  **Monitoring & Logging:** Utilize tools like Winston for logging, PM2 for process management, Sentry for error tracking, and Prometheus/Grafana for monitoring.
8.  **Rollback Strategy:** Always have a validated rollback mechanism in place for every deployment.

### b) My Approach
For this assignment, my deployment strategy would involve:
*   Local development with regular pushes to GitHub.
*   Automated CI/CD workflows for testing and deployment.
*   Backend hosting on Railway, Render, or AWS EC2.
*   Frontend deployment on Vercel or Netlify.
*   Managed SQL database hosting.
*   Strict management of environment variables.

*Philosophy: Deployment is not just about moving code; it's about guaranteeing reliability, security, scalability, and observability.*

---

## 3. How can we ensure payment security when making automated payments?

### a) Best Practices
1.  **Never Store Raw Card Data:** Rely on PCI-DSS compliant providers like Stripe, Razorpay, or PayPal. Use tokenization for all sensitive data.
2.  **Enforce HTTPS:** TLS encryption is mandatory for all transactions.
3.  **Webhook Signature Verification:** Always verify signatures provided by payment gateways to prevent spoofing.
4.  **Idempotency Keys:** Utilize idempotency keys to prevent duplicate payments during retries or network issues.
5.  **Role-Based Access Control (RBAC):** Ensure only authorized backend services and personnel can trigger sensitive financial operations.
6.  **Multi-Factor Authentication (MFA):** Mandatory for admin dashboards managing refunds or financial data.
7.  **Transaction Logging & Audit Trail:** Maintain a complete, immutable, and timestamped log of every transaction.
8.  **Fraud Detection:** Monitor for unusual refund patterns or rapid high-value transactions.

### b) Secure Payment Architecture
A typical secure flow for a refund would be:
`User Refund Request → Backend Order Validation → Create Refund Request → Call Payment Gateway API → Verify Response Signature → Store Transaction Log → Send Notification`

### c) Security Threats & Mitigation
| Threat | Solution |
| :--- | :--- |
| **SQL Injection** | Parameterized queries |
| **XSS / CSRF** | Input sanitization / CSRF tokens |
| **Man-in-the-middle** | Mandatory HTTPS |
| **Replay Attacks** | Idempotency keys |
| **Credential Stuffing** | Rate limiting + MFA |
| **Insider Threat** | Strict RBAC |

*Philosophy: Security is a system-wide responsibility. I build systems defensively, assuming the network may be compromised and requests may be malicious.*

---

## Final Summary
I approached this solution as a production-grade system, focusing on clean architecture, scalability, and security. Software should not only function but be reliable, secure, and ready for the rigors of a production environment.

# MoE LLM Routing Agent

A production-grade, highly resilient Mixture-of-Experts (MoE) LLM routing backend built with Java 17 and Spring Boot.

## Overview
This system dynamically routes user queries to the most capable and cost-effective AI expert (ChatGPT, Claude, Gemini, Hugging Face) in real-time. It evaluates intents, computes dynamic scoring, retrieves semantic memory via Cosine Similarity, synthesizes outputs using concurrent execution, and caches identical queries to achieve near-zero latency and cost for repeated requests.

## Architecture Highlights
- **Classifier & Scorer**: Adjusts model weights dynamically based on complexity and cost.
- **Semantic Caching**: Natively maps user intents to a Cosine Similarity embedded vector space. Short-circuits the LLM pipeline for hits `>= 0.95`.
- **Fault Tolerance**: Wrapped gracefully in Resilience4j. Implements Circuit Breakers, Bulkheads, and Fallbacks if OpenAI/Anthropic APIs fail.
- **Quality Evaluation**: Asynchronously evaluates the quality of LLM responses using a dedicated evaluator prompt before hydrating the memory cache.
- **Observability**: Exposes Micrometer/Prometheus endpoints natively for Grafana telemetry.

## Environment Profiles
The system leverages Spring Profiles to seamlessly shift configurations:

### `dev` (Default)
- **Target**: Local Development
- **Run**: `./mvnw spring-boot:run`
- **Features**: `DEBUG` logging, relaxed cache similarity thresholds (`0.70`), fail-fast timeouts, mock API keys.

### `staging`
- **Target**: Pre-production Validation
- **Run**: `java -jar app.jar --spring.profiles.active=staging`
- **Features**: `INFO` logging, tight caching mimicking production, environment-injected API configurations.

### `prod`
- **Target**: Live Deployment / Kubernetes
- **Run**: Automatically enforced via Docker (`ENV SPRING_PROFILES_ACTIVE=prod`)
- **Features**: Strict Semantic caching (`0.95`), extensive timeout resiliency (`10s`), strict environment variables, rate limits enabled.

## Containerization
The service is fully containerized. To spin it up immediately:
```bash
docker-compose up --build -d
```
*Note: The Docker instance will automatically inherit the `prod` profile. Map your environment variables directly.*

## Target Environment Variables
To operate `staging` or `prod` profiles, ensure the following are exposed:
- `ROUTING_API_KEY`: Defines the secret required to query the REST endpoints.
- `N8N_WEBHOOK_URL`: Target endpoint for agent telemetry and metrics.

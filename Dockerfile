# Multi-stage Docker build for Prompt Code (Rust + Static Assets)
FROM rust:1.88-bookworm AS builder

WORKDIR /app
COPY Cargo.toml Cargo.lock* ./
# Pre-build dummy to cache dependencies
RUN mkdir src && echo "fn main() {}" > src/main.rs && cargo build --release && rm -rf src

COPY src ./src
COPY static ./static
RUN touch src/main.rs && cargo build --release

# Runtime stage
FROM debian:bookworm-slim AS runner

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /app/target/release/prompt-code /app/prompt-code
COPY static /app/static

ENV HOST=0.0.0.0
ENV PORT=8080
ENV STATIC_DIR=/app/static

EXPOSE 8080

USER 10001:10001

CMD ["/app/prompt-code"]

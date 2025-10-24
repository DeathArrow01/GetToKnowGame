# Build stage
FROM golang:1.21-alpine AS builder

# Install git and ca-certificates (needed for go mod download)
RUN apk add --no-cache git ca-certificates

WORKDIR /app

# Copy go mod and sum files from the backend directory
COPY src/backend/get-to-know-game-go/go.mod src/backend/get-to-know-game-go/go.sum ./

# Download dependencies
RUN go mod download

# Copy source code from the backend directory
COPY src/backend/get-to-know-game-go/ .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# Runtime stage
FROM alpine:latest

# Install ca-certificates for HTTPS requests
RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy the binary from builder stage
COPY --from=builder /app/main .

# Copy any static files if needed
COPY --from=builder /app/config ./config

# Expose port
EXPOSE 5012

# Set environment variables
ENV PORT=5012
ENV FIBER_ENV=production

# Run the application
CMD ["./main"]
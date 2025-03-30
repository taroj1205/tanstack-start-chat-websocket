# ---- Builder Stage ----
FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json pnpm-lock.yaml* ./
# *Include pnpm-lock.yaml if it exists

# Install ALL dependencies including devDependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Set production environment for the build process (optional but good practice)
ENV NODE_ENV=production

# Build the application
RUN pnpm run build

# Prune development dependencies (optional, reduces intermediate layer size slightly)
RUN pnpm prune --prod

# ---- Production Stage ----
FROM node:20-alpine

# Set production environment
ENV NODE_ENV=production

# Install pnpm (needed for install and start commands)
RUN npm install -g pnpm

WORKDIR /app

# Create a non-root user and group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy necessary package files from builder
COPY --from=builder /app/package*.json /app/pnpm-lock.yaml* ./
# *Include pnpm-lock.yaml if it exists

# Install ONLY production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built assets from builder stage
COPY --from=builder --chown=appuser:appgroup /app/.vinxi ./.vinxi
COPY --from=builder --chown=appuser:appgroup /app/.output ./.output

# Switch to non-root user
USER appuser

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]

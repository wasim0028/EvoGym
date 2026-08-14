# Build context: the REPO ROOT (not frontend/), because the runtime stage
# also needs devops/docker/frontend/nginx.conf, which sits outside frontend/.
# Build:  docker build -f devops/docker/frontend/Dockerfile \
#           --build-arg VITE_API_URL=/api -t evogym-frontend .
#
# NOTE: Vite inlines env vars at BUILD time, so the API URL is baked into the
# image. That means one image per environment — hence the env-prefixed tags.

FROM node:20-alpine AS build
WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./

ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# --- Runtime: nginx serving the static bundle ---------------------------
FROM nginx:stable-alpine AS runtime

COPY devops/docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

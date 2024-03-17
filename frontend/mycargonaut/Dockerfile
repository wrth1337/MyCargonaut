# Stage 1: Build the Angular application
FROM node:latest as build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build --prod

# Stage 2: Serve the Angular application using Nginx
FROM nginx:latest
COPY --from=build app/dist/mycargonaut /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
EXPOSE 443

RUN echo "--------------debug-nginx-html-directory-----------------"
RUN ls /usr/share/nginx/html
RUN echo "--------------debug-end------------------"

CMD ["nginx", "-g", "daemon off;"]


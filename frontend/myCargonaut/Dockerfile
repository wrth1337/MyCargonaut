# Stage 1: Build the Angular application
FROM node:latest as build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build --prod

# Ausgabe der Dateien im dist-Verzeichnis
#RUN echo "--------------debug-dist-directory-----------------"
#RUN ls dist/myCargonaut
#RUN echo "--------------debug-end------------------"

# Stage 2: Serve the Angular application using Nginx
FROM nginx:latest
COPY --from=build app/dist/my-cargonaut /usr/share/nginx/html

EXPOSE 80
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]

# Ausgabe der Dateien im dist-Verzeichnis
RUN echo "--------------debug-nginx-html-directory-----------------"
RUN ls /usr/share/nginx/html
RUN echo "--------------debug-end------------------"

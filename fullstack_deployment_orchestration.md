# Full-Stack Cloud Deployment Guide
## ReactJS (Vercel) + Java Spring Boot (Render) + MongoDB Atlas

This document outlines the step-by-step process for orchestrating and deploying a modern full-stack architecture across three cloud platforms: **MongoDB Atlas** (Database), **Render** (Java Backend), and **Vercel** (React Frontend).

---

## Architecture & Communication Flow

```
[ ReactJS Frontend ] --(HTTPS / API Calls)--> [ Java Spring Boot Backend ] --(TLS / Drivers)--> [ MongoDB Atlas ]
    (Vercel Cloud)                                (Render Platform)                               (Atlas Cloud)
```

---

## Phase 1: Configure MongoDB Atlas (Database Layer)

Set up your managed cloud database before configuring the backend service.

### 1.1 Create Cluster & Database
1. Sign in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new project (e.g., `prod-app-db`).
3. Deploy a cluster (the **M0 Free Tier** is suitable for development/testing).
4. Select your preferred Cloud Provider and Region (choose a region close to your Render deployment region).

### 1.2 Database Access & Credentials
1. In the left navigation, go to **Security > Database Access**.
2. Click **Add New Database User**.
3. Select **Password** as the Authentication Method.
4. Set a strong username (e.g., `app_user`) and password.
5. Set Database User Privileges to **Read and write to any database** (or assign custom role `readWrite` on your target DB).

### 1.3 Network Access
1. Go to **Security > Network Access**.
2. Click **Add IP Address**.
3. To allow Render services to connect, select **Allow Access from Anywhere** (`0.0.0.0/0`) or configure specific static outbound IPs if using a Render static IP outbound add-on.
4. Confirm and wait for the entry to become active.

### 1.4 Extract the Connection String
1. Go to **Database > Clusters** and click **Connect**.
2. Select **Drivers** (Java).
3. Copy the Connection String URI format:
   ```text
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/<dbname>?retryWrites=true&w=majority
   ```

---

## Phase 2: Prepare & Deploy Java Backend to Render

Deploy your Java Spring Boot application as a Web Service on Render using Docker or Native Buildpacks.

### 2.1 Backend Code Setup (`application.properties` or `application.yml`)
Ensure external configuration properties are mapped to environment variables.

```properties
# src/main/resources/application.properties
server.port=${PORT:8080}

# MongoDB Atlas Configuration
spring.data.mongodb.uri=${SPRING_DATA_MONGODB_URI}

# CORS Configuration for React Frontend
cors.allowed-origins=${FRONTEND_URL:http://localhost:5173}
```

### 2.2 Configure CORS in Spring Boot
Create a global CORS filter configuration to allow requests from your Vercel frontend domain:

```java
package com.example.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${cors.allowed-origins}")
    private String allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins.split(","))
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

### 2.3 Containerize with Docker (Recommended for Render)
Place a `Dockerfile` in the root of your Java repository:

```dockerfile
# Build stage
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 2.4 Deploy Web Service on Render
1. Push your Java codebase to GitHub / GitLab.
2. Log in to [Render Dashboard](https://dashboard.render.com).
3. Click **New + > Web Service**.
4. Connect your Git repository.
5. Configure deployment settings:
   - **Name:** `java-backend-api`
   - **Region:** Match your MongoDB region preference.
   - **Environment:** `Docker` (or `Java` if using buildpack).
   - **Branch:** `main`
6. Add **Environment Variables**:
   - `SPRING_DATA_MONGODB_URI`: `mongodb+srv://app_user:<REAL_PASSWORD>@cluster0.abcde.mongodb.net/prod_db?retryWrites=true&w=majority`
   - `FRONTEND_URL`: `https://your-app-name.vercel.app` *(update after Phase 3)*
7. Click **Create Web Service**. Render will provision and deploy your service, producing a public URL (e.g., `https://java-backend-api.onrender.com`).

---

## Phase 3: Prepare & Deploy React Application to Vercel

### 3.1 Configure API Service Layer
Structure API calls using environment variables.

**For Vite + React (`.env`):**
```env
VITE_API_BASE_URL=https://java-backend-api.onrender.com/api
```

**API Call Example (`src/services/api.js`):**
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export async function fetchItems() {
  const response = await fetch(`${API_BASE_URL}/items`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}
```

*(Note: If using Create React App, name the variable `REACT_APP_API_BASE_URL` and use `process.env.REACT_APP_API_BASE_URL`)*.

### 3.2 SPA Routing Configuration (`vercel.json`)
Create a `vercel.json` file in the root of your React repository to handle client-side routing rewrites:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 3.3 Deploy via Vercel Dashboard
1. Push React project code to GitHub / GitLab.
2. Go to [Vercel Dashboard](https://vercel.com/dashboard) > **Add New Project**.
3. Import your React repository.
4. In **Framework Preset**, select **Vite** or **Create React App**.
5. Under **Environment Variables**, add:
   - Key: `VITE_API_BASE_URL`
   - Value: `https://java-backend-api.onrender.com/api`
6. Click **Deploy**. Vercel will build and output your production domain (e.g., `https://my-react-app.vercel.app`).

---

## Phase 4: Final Orchestration & Verification

### 4.1 Update CORS on Render Backend
1. Copy the finalized Vercel deployment URL (e.g., `https://my-react-app.vercel.app`).
2. Go to **Render Dashboard** > select your Java service > **Environment**.
3. Update `FRONTEND_URL` to `https://my-react-app.vercel.app`.
4. Render will auto-redeploy or restart the service to apply the updated CORS configuration.

### 4.2 End-to-End Testing Verification

| Test Step | Action | Expected Result |
|---|---|---|
| **1. Database Check** | Check Atlas Monitoring Dashboard | Active connection count increases when Spring Boot starts |
| **2. Backend Health Check** | Access `https://java-backend-api.onrender.com/actuator/health` | Returns `{"status":"UP"}` |
| **3. Frontend Load** | Open `https://my-react-app.vercel.app` | UI renders cleanly without console runtime errors |
| **4. Integration / CORS** | Trigger API calls via Frontend interface | Network tab displays successful `200 OK` HTTP responses without CORS policy blocks |

---

## Troubleshooting Guide

### Issue 1: Render Instance Spinning Down (Cold Starts)
* **Symptom:** First request to backend takes 30–50 seconds.
* **Cause:** Render Free Tier spins down inactive web services after 15 minutes of inactivity.
* **Solution:** Upgrade to a paid instance tier, or set up a status monitoring ping service (e.g., UptimeRobot) pointing to a `/health` endpoint.

### Issue 2: CORS Preflight Blocked
* **Symptom:** Browser console error: `Access to fetch at ... has been blocked by CORS policy`.
* **Solution:** Verify `FRONTEND_URL` in Render matches your exact Vercel URL (including `https://`, excluding trailing slashes).

### Issue 3: MongoDB Connection Timeout
* **Symptom:** Spring Boot startup fails with `MongoTimeoutException`.
* **Solution:** Verify IP Access List on MongoDB Atlas contains `0.0.0.0/0` and that the connection string username/password characters are properly URL-encoded if special characters exist.

# Homerag WebUI

A clean and simple Web UI for working with **Homerag**, designed to be easily deployed using Docker Compose.

This project focuses on fast setup, minimal configuration, and flexibility when connecting to your preferred LLM backend.

This webui is insecure for production use! Use only for personal projects.

---

## 🚀 Getting Started

Homerag WebUI is distributed with a ready-to-use Docker Compose configuration. To run the project, you only need Docker and Docker Compose installed on your system.

### Prerequisites

* Docker
* Docker Compose

---

## 🐳 Running with Docker Compose

Follow these steps to start Homerag WebUI:

Copy a `docker-compose.yaml` file from `user_docker_file` folder - this is a ready to use service.

Before starting the containers, configure the following environment variables in the Docker Compose file:

* **LLM_HOST** — URL of your LLM service
* **MODEL_NAME** — name of the model to be used
* **LLM_TOKEN** — authentication token for the LLM service. Set empty if not needed

Example:

```yaml
environment:
  LLM_HOST=https://your-llm-host
  MODEL_NAME=your-model-name
  LLM_TOKEN=your-secret-token
```

Make sure the values match your LLM provider configuration.

---

### 3. Start the application

To run service, locate to a folder with your copy of beforementioned `docker-compose.yaml` file and run:

```bash
docker compose up -d
```

Docker will pull the required image and start in the background.

---

## ✅ Accessing the WebUI

Once the container is running, open your browser and navigate to `http://localhost:1024`. You will have to sign up first to use the app.

---

## 🛠️ Run in developement mode

To run react dev server:

```bash
npm run dev
```

To run fastapi backend app:

### Build app

```bash
npm run build
```

React dev server runs on port `5173` and python backend runs on `1024`. 

---

## 📄 License

This project is provided as-is. Please check the repository for licensing details.

---


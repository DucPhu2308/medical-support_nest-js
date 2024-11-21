# Medical Consulting Support Website
[Live Demo](https://supportmedical-reactjs.onrender.com/) <br>
Please note that the first request may take up to 1 minute due to being deployed on a free tier.

## About The Project
The website supports the connection between doctors and patients, providing basic functions such as creating posts, reacting a post, commenting, calling, texting, and making appointments for consultation. The website meets the criteria of a friendly interface, ease of use, fast access speed, and high security. \
The main purpose of building a website to support patients and doctors is to create an online bridge where patients can directly interact with medical professionals, share accurate and timely medical information, and at the same time create conditions for patients to ask questions and have their health concerns answered. In this way, patients will have the necessary knowledge to proactively take care of their health.

### Built With
- NestJS
- ReactJS
- MongoDB
- Socket.io
- WebRTC
- Firebase Storage

## Getting Started (NestJS only)
### Prerequisites
Before you begin, make sure you have the following tools and software installed on your system:

- Node.js: Version >= 16.x
Download and install it from the Node.js Official Website.

- MongoDB:
Install MongoDB and ensure the service is running. You can download it from the MongoDB Download Center.
Alternatively, you can use Docker to run MongoDB:

```bash
docker run -d --name mongodb -p 27017:27017 mongo
```
- Redis: Redis:
Install Redis and ensure it is running. You can download it from the Redis Official Website.
Alternatively, you can use Docker to run Redis:

```bash
docker run -d --name redis -p 6379:6379 redis
```
- Firebase key: create a firebase project and get its api key. [Read this.](https://firebase.google.com/docs/projects/api-keys)
- Email application password: [Read this.](https://knowledge.workspace.google.com/kb/how-to-create-app-passwords-000009237)
- NestJS CLI (optional):
The CLI makes it easier to manage your NestJS project.

```bash
npm install -g @nestjs/cli
```

### Installation
1. Clone the repo
``` bash
git clone https://github.com/DucPhu2308/medical-support_nest-js.git
```
2. Install dependencies
``` bash
npm i
```
3. Setup environment: 
    - Create ```.env``` at root folder
    - The ```.env``` should look like this:
```
MONGO_URI = "mongodb://localhost:27017/medical-support"

PORT = 4000

JWT_SECRET = "jwt-secret"

EMAIL_HOST = "smtp.example.com"
EMAIL_PORT = 587
EMAIL_USER = "abc@example.com"
EMAIL_PASSWORD = "enco dede dpas swor"

REDIS_HOST = your.redishost.com
REDIS_PORT = 6379
REDIS_PASSWORD = yourredispassword

# Firebase config
TYPE=service_account
PROJECT_ID=medical-support
...
(replace with your firebase key & value pairs)
```

### Executing
Excute this:
```bash
npm run start
```
then the back-end server should be running.

## Related
- [Front-end ReactJS Repo](https://github.com/galaticwarrior123/SupportMedical_ReactJS)
- [Front-end ReactNative Repo](https://github.com/DucPhu2308/MedicalSupport_ReactNative)
- [Full academic report] - to be filled later

## Authors
- Nguyen Duc Phu - nguyenducphu2308@gmail.com
- Nguyen Trong Phuc - trongnguyenphuc22082003@gmail.com
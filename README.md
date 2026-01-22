# Credit Approval Pipeline

A robust, event-driven credit card approval system built with **Node.js**, **TypeScript**, and **RabbitMQ** microservices architecture.

![Status](https://img.shields.io/badge/Status-Completed-success)
![Docker](https://img.shields.io/badge/Docker-Enabled-blue)

## About The Project

This project simulates a real-world banking credit analysis pipeline.
When a user submits a proposal via the REST API, the system triggers a series of asynchronous checks through independent Workers, decoupling the processing logic from the API.

### Architecture Flow

1.  **API Gateway**: Receives the HTTP proposal and publishes it to RabbitMQ.
2.  **Confirmation Worker**: Sends an immediate "We received your proposal" email.
3.  **Credit Analysis Worker**: Generates a Credit Score (Random 300-1200).
4.  **Fraud Analysis Worker**:
    * Checks for Blacklisted CPFs.
    * Validates income consistency vs. score.
5.  **Limit Calculator Worker**: Defines the credit limit and Card Tier (Platinum, Gold, Standard).
6.  **Marketing Worker**: Sends the final approval email with the calculated limit.

## Tech Stack

* **Language**: Typescript
* **Runtime**: Node.js
* **Database**: PostgreSQL (via Docker)
* **ORM**: Prisma
* **Message Broker**: RabbitMQ (via Docker)
* **Containerization**: Docker & Docker Compose
* **SMTP**: AWS SES
* **Testing**: JEST (E2E)

---

## Getting Started

### Prerequisites
* Docker & Docker Compose installed.
* Node.js (v18+) installed (for local scripts and intellisense).

### 1. Installation
Clone the repository and install local dependencies:

```bash
npm install
```
### 2. Env configuration
Create a .env file in the root directory:

```bash
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DB?schema=public"

RABBITMQ_USER=
RABBITMQ_PASS=
RABBITMQ_URL=amqp://rabbituser:rabbitpassword@localhost:5672

CREDIT_ANALYSIS_QUEUE=proposals.credit-analysis
IDENTITY_QUEUE=proposals.identity-check
FRAUD_ANALYSIS_QUEUE=proposals.fraud-check
LIMIT_CALCULATOR_QUEUE=proposals.limit-calculation
CONFIRMATION_QUEUE=proposals.confirmation

APPROVED_EXCHANGE=proposals.approved_fanout
CARD_ISSUER_QUEUE=proposals.card_issuer 
MARKETING_QUEUE=proposals.marketing
NOT_SAFE_QUEUE=proposals.not_safe
REJECTED_EXCHANGE=rejected.exchange

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-2

MAIL_FROM=anotheremail
TEST_EMAIL=youremail
TEST_EMAIL2=youremail
```

### 3. Running Docker
Start with 
```bash
docker compose up --build -d
docker compose exec api npx prisma migrate dev --name init
```
### 4. Running the code and tests

```bash
npm run dev
```

```bash
npm run rest:e2e
``` 

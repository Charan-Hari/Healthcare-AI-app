import swaggerJSDoc from "swagger-jsdoc";

export function getOpenApiSpec() {
  return swaggerJSDoc({
    definition: {
      openapi: "3.0.3",
      info: {
        title: "Healthcare AI App API",
        version: "1.0.0",
        description: "Secure APIs for healthcare data ingestion, auth, and audit-ready operations.",
      },
      servers: [
        { url: "http://localhost:3000", description: "Local" },
      ],
      components: {
        securitySchemes: {
          bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
          cookieAuth: { type: "apiKey", in: "cookie", name: "next-auth.session-token" },
        },
        schemas: {
          ErrorResponse: {
            type: "object",
            properties: {
              error: { type: "string" },
              requestId: { type: "string" },
            },
          },
          RegisterRequest: {
            type: "object",
            required: ["email", "password"],
            properties: {
              email: { type: "string", format: "email" },
              password: { type: "string", minLength: 12 },
              name: { type: "string" },
            },
          },
          LoginRequest: {
            type: "object",
            required: ["email", "password"],
            properties: {
              email: { type: "string", format: "email" },
              password: { type: "string" },
            },
          },
          HealthDataCreateRequest: {
            type: "object",
            required: ["originalUrl"],
            properties: {
              originalUrl: { type: "string", format: "uri" },
              sourceType: { type: "string", enum: ["PDF", "IMAGE", "TEXT"] },
              notes: { type: "string" },
            },
          },
        },
      },
      tags: [
        { name: "Health", description: "Service health endpoints" },
        { name: "Auth", description: "Authentication endpoints" },
        { name: "HealthData", description: "Health data ingestion and retrieval" },
      ],
      paths: {
        "/api/health": {
          get: {
            tags: ["Health"],
            summary: "Health check",
            responses: {
              "200": {
                description: "Service is healthy",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        ok: { type: "boolean" },
                        service: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        "/api/auth/register": {
          post: {
            tags: ["Auth"],
            summary: "Register user",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/RegisterRequest" },
                },
              },
            },
            responses: {
              "201": { description: "User created" },
              "400": { description: "Validation failed" },
              "409": { description: "User already exists" },
            },
          },
        },
        "/api/auth/login": {
          post: {
            tags: ["Auth"],
            summary: "Login user",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/LoginRequest" },
                },
              },
            },
            responses: {
              "200": { description: "Login success" },
              "401": { description: "Invalid credentials" },
            },
          },
        },
        "/api/health-data": {
          get: {
            tags: ["HealthData"],
            summary: "List current user's health records",
            security: [{ cookieAuth: [] }],
            responses: {
              "200": { description: "Records retrieved" },
              "401": { description: "Unauthorized" },
            },
          },
          post: {
            tags: ["HealthData"],
            summary: "Create health data record and queue parsing",
            security: [{ cookieAuth: [] }],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/HealthDataCreateRequest" },
                },
              },
            },
            responses: {
              "201": { description: "Record created and queued" },
              "400": { description: "Validation failed" },
              "401": { description: "Unauthorized" },
            },
          },
        },
      },
    },
    apis: [],
  });
}

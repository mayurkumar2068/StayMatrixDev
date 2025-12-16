const swaggerJSDoc = require("swagger-jsdoc");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "StayMatrix API",
      version: "1.0.0",
      description: "Authentication APIs for StayMatrix",
    },
    servers: [
      {
        url: "http://localhost:4210",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./routes/*.js"], // 👈 auth.js comments read honge
};

module.exports = swaggerJSDoc(swaggerOptions);

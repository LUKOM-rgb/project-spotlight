import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import process from 'process'


const app = express()
const port= process.env.PORT
const host= process.env.HOST
app.use(express.json())
// Importar Rota
import relatorios from './routes/ocorrencia.routes.js'
// Middlewares Globais


// Middlewares
app.use(cors())


// Registar as Rotas
app.use('/relatorios',relatorios)

app.use((req,res,next)=>{
  res.status(404).json({message: 'Endpoint não encontrado'})
})

app.use((err, req, res, next) => {
  // !Uncomment this line to log the error details to the server console!
  console.error(err);

  // error thrown by express.json() middleware when the request body is not valid JSON
  if (err.type === "entity.parse.failed")
    return res.status(400).json({
      error: "Invalid JSON payload! Check if your body data is a valid JSON.",
    });

  // Sequelize validation errors (ALL models)
  if (
    err.name === "SequelizeValidationError" ||
    err.name === "SequelizeUniqueConstraintError"
  ) {
    return res.status(400).json({
      error: "Validation error",
      details: err.errors.map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  // SequelizeDatabaseError related to an invalid ENUM value (utilizador table -> role field)
  if (err.name === "SequelizeDatabaseError") {
    if (err.original.code === "ER_CHECK_CONSTRAINT_VIOLATED") {
      return res.status(400).json({
        error: "Invalid value for enumerated field",
        message: err.message,
      });
    }
    if (err.original.code === "ER_BAD_NULL_ERROR") {
      return res.status(400).json({
        error: "Missing mandatory field",
        message: err.message,
      });
    }
    if (err.original.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        error: "Duplicate entry",
        message: err.message,
      });
    }
  }
  // other errors
  res.status(err.statusCode || 500).json({
    error: "Internal server error",
    message: err.message,
  });
});

// Start server
app.listen(port, host, () => {
  console.log(`Server running on host ${host} and port ${port}`)
  console.log(`Access: http://localhost:${port}/api/relatorios`)
})

export default app

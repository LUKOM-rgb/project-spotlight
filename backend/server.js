require('dotenv').config();
console.log("Loaded ENV config:");

const express = require('express');

// read environment variables from .env file

const app = express();
const port = process.env.PORT;	// use environment variables
const host = process.env.HOST;


app.use(express.json());

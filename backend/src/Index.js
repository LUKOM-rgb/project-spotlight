import dotenv from 'dotenv'
dotenv.config()

import app from './server.js' // 💡 IMPORTANTE: Use 'import' e adicione o '.js' no final!

const port = process.env.PORT || 3000
const host = process.env.HOST || 'localhost'

app.listen(port, host, () => {
    console.log(`App listening at http://${host}:${port}/`)
})

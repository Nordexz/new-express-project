const express = require('express')

const port = 5002

const app = express()

app.get('/pdf', (req, res) => {
  console.log(req.query)
})

app.listen(port, () => {
  console.log(`server started at ${port}`)
})
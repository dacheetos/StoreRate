const express = require('express')
const app = express()
const port = 8080
const cors = require('cors');

const store_router = require('./src/routes');
app.use(express.json())
app.use(cors({ origin: 'http://localhost:3000' }));


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.use('/api/v1/store', store_router);
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})


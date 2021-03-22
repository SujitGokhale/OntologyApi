'use strict'
const app = require('./app')
const config = require('./config.json');

const port = config.port;

app.listen(port, () => console.log(`Ontology Concept API is listening on port ${port}.`))
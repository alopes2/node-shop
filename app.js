const express = require('express');
const bodyParser = require('body-parser');


app.use(bodyParser.urlencoded({ extended: false}));

const app = express();

app.listen(3000, () => {
    console.log('Listening on port 3000');
});
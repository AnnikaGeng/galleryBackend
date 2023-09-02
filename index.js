const express = require("express");
// const app = express();
const cors = require("cors");
const path = require("path")
require("dotenv").config({ path: "./config.env" });
const port = process.env.PORT || 3000;

const createServer = require("./server")

const address =  "localhost";
const app = createServer() 

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(require("./api/gallery"))
const dbo = require("./database/conn");
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));

app.listen(port, address, () => {
    
    dbo.connect(function (err) {
        if (err) console.log(err);
        // console.log("Connected to database.");
    });
    console.log(`Server is listening on ${address}:${port}`);
});


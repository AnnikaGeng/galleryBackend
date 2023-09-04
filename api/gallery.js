const express = require("express");
const routes = express.Router();

const axios = require("axios")
const fs = require("fs")
const path = require("path")
// node-fetch v3 is an ESM-only module, you are not able to import it with a normal require().
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const dbo = require("../database/conn");
const api = process.env.API
/**
 * This route will download the the APOD of this day and store it 
 * into the database.
 */

routes.route("/download/today").post(async (req, res) => {
    const db = dbo.getDb();
    let apiResponse = null
    let apiResult = null

    const fetchError = {
        "status": "failed",
        "information": "The server was not able to fetch the api."
    }
    const reachError = {
        "status": "failed",
        "information": "The api was not reachable."
    }

    try {
        apiResponse = await fetch(api)
    } catch (error) {
        res.status(400).json(fetchError)
        console.error(fetchError)
        return
    }

    if (!apiResponse.ok) {
        res.status(400).json(reachError)
        console.error(reachError)
        return
    }

    // Now the request should be fine
    apiResult = await apiResponse.json()

    // Download image and store information in database
    // TODO: downloadImage still has to be implemented (function head is already below)
    const image = await downloadImage(apiResult.url)
    if (image === null) {
        return
    }

    db.run(
        `INSERT INTO images (title, description, date, path) 
            VALUES(?, ?, strftime('%Y-%m-%d', ?), ?);`,
        [apiResult.title, apiResult.explanation, apiResult.date, image]
    )
    res.status(200).json({
        "status": "success",
        "information": {
            "message": "The Nasa Image of the day, is successfully added into the database.",
            // TODO: edit the placeholder to the real path/url, where you can find the image in the api
            "url": `${apiResult.url}`
        }
    })
})

/**
 * This function will download an image from the submitted url and will safe it in the directory 
 * you can provide as second optional argument.
 * 
 * @param {string} url A String value, which contains the url of the image you want to store.
 * @param {string} directory An optional String value, which contains the directory, where the 
 *  images should be stored. When not specified, it will be downloads.
 * @returns A String or null. It will be null, when something went wrong. Otherwise the string will
 *   contain the path of the image.
 */
async function downloadImage (url, directory = "downloads") {
    try {
        // fetch the image
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        
        // create the directory, if it does not exist
        if(!fs.existsSync(directory)) {
            fs.mkdirSync(directory);
        }

        // get the filename from the url
        const filename = path.basename(url);

        // generate the path
        const imagePath = `./${directory}/${filename}`;

        // write the image to the path
        fs.writeFileSync(imagePath, response.data);
        return imagePath;
    } catch (error) {
        console.error("Error while downloading the image. Try again later.")
        return null;
    }
}

routes.route("/today").get(async (req, res) => {
    let apiResponse = null
    let apiResult = null

    const fetchError = {
        "status": "failed",
        "information": "The server was not able to fetch the api."
    }
    const reachError = {
        "status": "failed",
        "information": "The api was not reachable."
    }

    try {
        console.log(api)
        apiResponse = await fetch(api)
    } catch (error) {
        res.status(400).json(fetchError)
        console.error(fetchError)
        return
    }

    if (!apiResponse.ok) {
        res.status(400).json(reachError)
        console.error(reachError)
        return
    }

    apiResult = await apiResponse.json()

    const imageAddress = apiResponse.url
    if (imageAddress === null) {
        return
    }
    res.status(200).json({
        "status": "success",
        "information": {
            "title": apiResult.title,
            "message": apiResult.explanation,
            "date": apiResult.date,
            "url": `${apiResult.url}`
        }
    })
})



routes.route("/").get(function (req, res) {
    const db = dbo.getDb();
    // TODO: This route will serve the frontend. Implementation is needed.
    ImageData = db.all(`SELECT * FROM images;`, [], (err, rows) => {
        if (err) {
            console.error(err.message);
        }
        res.send(rows);
    });
});

routes.route("/delete/:id").delete(function (req, res) {
    const db = dbo.getDb();
    const id = req.params.id;
    const deleteQuery = 'DELETE FROM images WHERE id = ?';

    // Execute the query
    db.run(deleteQuery, [id], function (err) {
        if (err) {
            console.error('Error deleting record:', err);
            res.status(500).json({ error: 'An error occurred while deleting the record.' });
        } else {
            console.log('Record deleted successfully.');
            res.status(200).json({ message: 'Record deleted successfully.' });
        }
    });
});

routes.route("/:id").get(function (req, res) {
    const db = dbo.getDb();
    const id = req.params.id;
    const selectQuery = 'SELECT * FROM images WHERE id = ?';

    db.get(selectQuery, [id], function (err, row) {
        if (err) {
            console.error('Error selecting record:', err);
            res.status(500).json({ error: 'An error occurred while selecting the record.' });
        } else {
            res.status(200).json(row);
        }
    });
});

module.exports = routes;
"use strict";

const csv = require("fast-csv");
const fs = require("fs");

const readCsv = (file, hasHeaders = false, delimiter = "") => {
    return new Promise((resolve, reject) => {
        try {
            let ticks = [];
            if (!fs.existsSync(file)) {
                resolve(ticks);
                return;
            }
            const options = {};
            if (hasHeaders) {
                options.headers = true;
            }
            if (delimiter !== "") {
                options.delimiter = delimiter;
            }
            csv.parseFile(file, options)
                .on("data", function (tick) {
                    ticks.push(tick);
                })
                /*
                .validate(function(tick) {
                })
                .on("data-invalid", function(tick){
                    console.log('invalid:', tick)
                })
                */
                .on("error", function(data){
                    console.log('Error data entry in:', file)                       
                })
                .on("end", function () {
                    resolve(ticks);
                });
        } catch (e) {
            console.log("Error reading: ", file, e);
            resolve([]);
        }
    });
};

const writeCsv = (ticks, file, hasHeaders = false) => {
    return new Promise((resolve, reject) => {
        const ws = fs.createWriteStream(file);
        csv.write(ticks, { headers: hasHeaders }).pipe(ws);
        ws.on("finish", function () {
            resolve();
        });
    });
};

module.exports = {
    readCsv,
    writeCsv,
}
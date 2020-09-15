/********************************************************************************
 * Copyright (c) 2020 TypeFox
 *
 * This program and the accompanying materials are made available under the terms
 * of the MIT License which is available at https://spdx.org/licenses/MIT.html
 ********************************************************************************/

const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const dataDir = path.join(__dirname, 'data');

function countLicenses() {
    let totalCount = 0;
    let unknownCount = 0;
    const licenseMap = new Map();
    fs.readdirSync(dataDir).forEach(file => {
        totalCount++;
        let output = '';
        try {
            output = cp.execSync(`licensee detect --json --no-remote ${path.join(dataDir, file)}`, {
                cwd: dataDir,
                encoding: 'utf-8'
            });
        } catch (err) {
            if (err.stdout && err.stdout.length > 0) {
                output = err.stdout;
            } else {
                throw err;
            }
        }
        const parsed = JSON.parse(output);
        if (parsed.licenses.length > 0) {
            const id = parsed.licenses[0].spdx_id;
            console.log(`${file}: ${id}`);
            const count = licenseMap.get(id);
            if (count) {
                licenseMap.set(id, count + 1);
            } else {
                licenseMap.set(id, 1);
            }
        } else {
            unknownCount++;
        }
    });
    console.log(`Total number of extensions: ${totalCount}`);
    console.log('---RESULTS');
    console.log(`Unknown: ${unknownCount}`);
    licenseMap.forEach((value, key) => {
        console.log(`${key}: ${value}`);
    });
}

module.exports = { countLicenses };

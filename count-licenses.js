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
    const licenseMap = new Map();
    fs.readdirSync(dataDir).forEach(file => {
        const output = cp.execSync(`licensee detect --json ${path.join(dataDir, file)}`, {
            cwd: dataDir,
            encoding: 'utf-8'
        });
        const parsed = JSON.parse(output);
        if (parsed.licenses.length > 0) {
            totalCount++;
            const id = parsed.licenses[0].spdx_id;
            console.log(`${file}: ${id}`);
            const count = licenseMap.get(id);
            if (count) {
                licenseMap.set(id, count + 1);
            } else {
                licenseMap.set(id, 1);
            }
        }
    });
    console.log(`Total number of extensions: ${totalCount}`);
    licenseMap.forEach((value, key) => {
        console.log(`${key}: ${value}`);
    });
}

module.exports = { countLicenses };

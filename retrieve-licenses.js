/********************************************************************************
 * Copyright (c) 2020 TypeFox
 *
 * This program and the accompanying materials are made available under the terms
 * of the MIT License which is available at https://spdx.org/licenses/MIT.html
 ********************************************************************************/

const fs = require('fs');
const path = require('path');
const { https } = require('follow-redirects');

const queryUrl = new URL('https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery');
const API_VERSION = '3.0-preview.1';
const PAGE_SIZE = 1000;

const requestData = `{
    "filters": [
        {
            "criteria": [
                {
                    "filterType": 8,
                    "value": "Microsoft.VisualStudio.Code"
                }
            ],
            "pageNumber": 1,
            "pageSize": ${PAGE_SIZE},
            "sortBy": 4,
            "sortOrder": 0
        }
    ],
    "assetTypes": [],
    "flags": 514
}`;

const dataDir = path.join(__dirname, 'data');

function retrieveLicenses() {
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
    }
    return new Promise((resolve, reject) => {
        console.log(`POST ${queryUrl}`);
        const requestOptions = {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'accept': `application/json;api-version=${API_VERSION}`
            }
        };
        const request = https.request(queryUrl, requestOptions, response => {
            response.setEncoding('utf-8');
            let json = '';
            response.on('data', chunk => json += chunk);
            response.on('end', () => {
                if (json.length > 0) {
                    fs.writeFile(path.join(__dirname, 'response.json'), json, err => {
                        if (err) {
                            console.error('Could not write to response.json', err);
                        }
                    });
                }
                if (response.statusCode !== undefined && (response.statusCode < 200 || response.statusCode > 299)) {
                    reject(new Error(`${response.statusMessage || 'Request failed'} (${response.statusCode})`));
                } else {
                    processResponse(JSON.parse(json)).then(resolve, reject);
                }
            });
        });
        request.on('error', reject);
        request.write(requestData);
        request.end();
    });
}

function processResponse(resultData) {
    return Promise.all(
        resultData.results[0].extensions.map(extension => {
            const latest = extension.versions[0];
            const license = latest.files.find(file => file.assetType === 'Microsoft.VisualStudio.Services.Content.License');
            if (!license) {
                return Promise.resolve();
            }
            return new Promise((resolve, reject) => {
                console.log(`GET ${license.source}`);
                const request = https.request(license.source, response => {
                    const fileName = `${extension.publisher.publisherName}.${extension.extensionName}-${latest.version}.txt`;
                    const stream = fs.createWriteStream(path.join(dataDir, fileName));
                    stream.on('error', reject);
                    response.pipe(stream);
                    response.on('end', () => {
                        if (response.statusCode !== undefined && (response.statusCode < 200 || response.statusCode > 299)) {
                            reject(new Error(`${fileName}: ${response.statusMessage || 'Request failed'} (${response.statusCode})`));
                        } else {
                            resolve();
                        }
                    });
                });
                request.on('error', reject);
                request.end();
            });
        })
    );
}

module.exports = { retrieveLicenses };

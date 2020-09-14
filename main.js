/********************************************************************************
 * Copyright (c) 2020 TypeFox
 *
 * This program and the accompanying materials are made available under the terms
 * of the MIT License which is available at https://spdx.org/licenses/MIT.html
 ********************************************************************************/

const { retrieveLicenses } = require('./retrieve-licenses');
const { countLicenses } = require('./count-licenses');

if (process.argv.indexOf('retrieve-licenses') > 0) {
    retrieveLicenses().catch(err => console.error(err));
}

if (process.argv.indexOf('count-licenses') > 0) {
    try {
        countLicenses();
    } catch (err) {
        console.error(err);
    }
}

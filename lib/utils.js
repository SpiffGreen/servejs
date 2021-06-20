/**
 * servejs
 * Copyright(c) 2021 Spiff Jekey-Green <spiffjekeygreen@gmail.com>
 * Copyright(c) 2021 Muhammad Bin Zafar <midnightquatumprogrammer@gmail.com>
 * MIT Licensed
 */

const path = require("path");
const fs = require("fs");
/**
 * @private
 * @param {String} text String to sanitize
 * @returns {text} Sanized text
 */
function sanitize(text) {
    text = text.replace(/<br>/g, "\n");
    text = text.replace(/</g, "&lt;"); 
    text = text.replace(/>/g, "&gt;");
    return text;
}

/**
 * @param {String} text String to test for html
 * @returns {Boolean}
 */
function containsHTML(text) {
    const reg = /<b[^<]*?>|<i[^<]*?>|<div[^<]*?>|<span[^<]*?>|<h[1-6][^<]*?>|<p[^<]*?>|<em[^<]*?>/i;
    return reg.test(text);
}

/**
 * 
 * @param {String} filePath Path to file
 * @returns {Boolean}
 */
function fileExists(filePath) {
    try {
        fs.statSync(filePath);
        return true;
    } catch {
        return false;
    }
}

function sendJson(res, obj) {
    if(typeof obj !== "object") throw Error("'obj' is not an object");
    try {
        const json = JSON.stringify(obj);
        res.writeHead(200, "OK", {
            "Content-Type": "application/json"
        });
        res.end(json);
    } catch (err) {
        res.writeHead(500, "BAD", {
            "Content-Type": "text/plain"
        });
        res.end("Server Error");
    }
}

function sendText(res, text) {
    if(typeof text !== "string") throw Error("'text' should be a string");
    res.writeHead(200, "OK", {
        "Content-Type": "text/plain"
    });
    res.end(text);
}

// /**
//  * @param {Number|String} Status code to use
//  * @returns {Object} Response object for method chaining.
//  */
// function status(code) {
//     this.statusCodeCustom = +code;
//     return this;
// }

/**
 * @param {String} text Route prototype
 * @param {Servejs|Object} self 
 */
function buildDynamicRoute(text = "", self) {
    const orig = text;
    text = text.startsWith("/") ? text.replace("/", "") : text;
    text = text.endsWith("/") ? text.slice(0, text.length - 1) : text;
    self.tempReg = "";
    text.split("/").forEach(i => i.startsWith(":") ? self.tempReg += "\/([^/]+)" : self.tempReg += "\/" + i);
    self.tempReg = "^" + self.tempReg + "$";
    // (new RegExp("^/users/([^/]+)/([^/]+)$")).exec("/users/spiff/ddfs"); // Simple test
    self.dynamicRoutes[self.tempReg] = Object.create(null);
    self.dynamicRoutes[self.tempReg].params = [];
    self.dynamicRoutes[self.tempReg].orig = orig;
    text.split("/").forEach(i => {
        if(i.startsWith(":")) self.dynamicRoutes[self.tempReg].params.push(i.slice(1, i.length));
    });
}

/**
    * @description Finds the mimetype of a file
    * @param {String} filename The file name
    * @returns Mimetype of file based on the extension
    */
function Mimeof(filename) {
    const fileExtension = String(path.extname(filename).toLowerCase())
    const Mimes = {
        '.html': 'text/html',
        '.css' : 'text/css',
        '.md'  : 'text/markdown',

        '.ico' : 'image/x-icon',
        '.png' : 'image/png',
        '.jpg' : 'image/jpg',
        '.gif' : 'image/gif',
        '.svg' : 'image/svg+xml',

        '.wav' : 'audio/wav',
        '.mp3' : 'audio/mp3',
        '.mp4' : 'video/mp4',

        '.js':   'application/javascript',
        '.json': 'application/json',
        '.woff': 'application/font-woff',
        '.ttf' : 'application/font-ttf',
        '.eot' : 'application/vnd.ms-fontobject',
        '.otf' : 'application/font-otf',
        '.wasm': 'application/wasm'
    }
    return Mimes[fileExtension] || 'application/octet-stream'
}

module.exports = {
    buildDynamicRoute,
    sendText,
    sendJson,
    fileExists,
    containsHTML,
    sanitize,
    Mimeof
};
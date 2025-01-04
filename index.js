// COL COCUGUN ALTYAPISI ALIN KULLANIN DC: APİFUCKER


import ws from 'ws';

import tls from 'tls';

import extractJsonFromString from 'extract-json-from-string';

import axios from 'axios';

import https from 'https';

import got from 'got';

import phin from 'phin';

import supertest from 'supertest';

import ky from 'ky';

 

async function fasterrequest(url, method, headers, body) {

    return new Promise((resolve, reject) => {

        const req = https.request(url, { method: method, headers: headers }, (res) => {

            let data = '';

            res.on('data', (chunk) => { data += chunk; });

            res.on('end', () => {

                if (res.statusCode >= 200 && res.statusCode < 300) {

                    resolve({ ok: true, status: res.statusCode, body: data });

                } else {

                    resolve({ ok: false, status: res.statusCode, body: data });

                }

            });

        });

        req.on('error', (e) => reject(e));

        if (body) {

            req.write(body);

        }

        req.end();

    });

}

 

const guilds = {};

const token = " token gir";

const apiUrl = 'https://canary.discord.com/api/v7/';

const swid = " sw ıd gır";

let vanity;

 

const tlsSocket = tls.connect({

    host: "canary.discord.com",

    port: 443,

    minVersion: "TLSv1.2",

    maxVersion: "TLSv1.2",

    handshakeTimeout: 500,

    servername: "canary.discord.com"

});

 

tlsSocket.on("secureConnect", () => {

    const websocket = new ws("wss://gateway.discord.gg");

 

    websocket.onclose = () => process.exit();

    

    websocket.onmessage = async (message) => {

        const { d, op, t } = JSON.parse(message.data);

        

        if (t === "GUILD_UPDATE") {

            const find = guilds[d.guild_id];

            if (find && find !== d.vanity_url_code) {

                const requestBody = JSON.stringify({ code: find });

                const tlsRequestHeader = [

                    `PATCH /api/guilds/${swid}/vanity-url HTTP/1.2`,

                    "Host: canary.discord.com",

                    `Authorization: ${token}`,

                    "Content-Type: application/json",

                    `Content-Length: ${Buffer.byteLength(requestBody)}`,

                    "", ""

                ].join("\r\n");

 

                vanity = find;

 

                const requests = [

                    new Promise((resolve, reject) => {

                        tlsSocket.write(tlsRequestHeader + requestBody, 'utf-8', (err) => {

                            if (err) reject(err);

                            else resolve('TLS request sent');

                        });

                    }),

                    axios.patch(

                        `${apiUrl}guilds/${swid}/vanity-url`,

                        { code: find },

                        { headers: { 'Authorization': token, 'Content-Type': 'application/json' } }

                    ).then(response => ({ source: 'axios', response })),

                    ky.patch(`${apiUrl}guilds/${swid}/vanity-url`, {

                        json: { code: find },

                        headers: { 'Authorization': token, 'Content-Type': 'application/json' }

                    }).json().then(response => ({ source: 'ky', response })),

                    fasterrequest(

                        `${apiUrl}guilds/${swid}/vanity-url`,

                        'PATCH',

                        {

                            'Authorization': token,

                            'Content-Type': 'application/json',

                            'Content-Length': Buffer.byteLength(requestBody),

                        },

                        requestBody

                    ).then(response => ({ source: 'fasterrequest', response })),

                    got.patch(`${apiUrl}guilds/${swid}/vanity-url`, {

                        json: { code: find },

                        headers: { 'Authorization': token, 'Content-Type': 'application/json' }

                    }).json().then(response => ({ source: 'got', response })),

                    phin({

                        url: `${apiUrl}guilds/${swid}/vanity-url`,

                        method: 'PATCH',

                        headers: {

                            'Authorization': token,

                            'Content-Type': 'application/json',

                        },

                        data: requestBody,

                        parse: 'json'

                    }).then(response => ({ source: 'phin', response })),

                    supertest('https://canary.discord.com')

                        .patch(`/api/guilds/${swid}/vanity-url`)

                        .set('Authorization', token)

                        .set('Content-Type', 'application/json')

                        .send({ code: find })

                        .then(response => ({ source: 'supertest', response }))

                ];

 

                Promise.all(requests)

                    .then((responses) => {

                        responses.forEach((res) => console.log(`${res.source}:`, res.response));

                    })

                    .catch((error) => {

                        console.error('Error sending requests:', error);

                    });

            }

        } else if (t === "READY") {

            d.guilds.forEach((guild) => {

                if (guild.vanity_url_code) {

                    guilds[guild.id] = guild.vanity_url_code;

                }

            });

            console.log(guilds);

        }

 

        if (op === 10) {

            websocket.send(JSON.stringify({

                op: 2,

                d: {

                    token,

                    intents: 1,

                    properties: {

                        os: "GNOME",

                        browser: "Vivaldi",

                        device: "IoS",

                    },

                },

            }));

 

            setInterval(() => websocket.send(JSON.stringify({ op: 1, d: {}, s: null, t: "heartbeat" })), d.heartbeat_interval);

        } else if (op === 7) {

            process.exit();

        }

    };

 

    setInterval(() => {

        tlsSocket.write(["GET / HTTP/1.2", "Host: canary.discord.com", "", ""].join("\r\n"));

    }, 900);

});

 

tlsSocket.on("error", (error) => process.exit());

tlsSocket.on("end", () => process.exit());

tlsSocket.on("data", async (data) => {

    const ext = extractJsonFromString(data.toString());

    const find = ext.find((e) => e.code) || ext.find((e) => e.message);

    

    if (find) {

        console.log(find);

 

        const requestBody = JSON.stringify({

            content: `${vanity} \n\`\`\`json\n${JSON.stringify(find)}\`\`\`\n\n|| ||`,

        });

        const contentLength = Buffer.byteLength(requestBody);

 

        const requestHeader = [

            `POST /api/webhooks/1275609343462735955/ HTTP/1.1`,

            "Host: canary.discord.com",

            "Content-Type: application/json",

            `Content-Length: ${contentLength}`,

            "",

            "",

        ].join("\r\n");

 

        tlsSocket.write(requestHeader + requestBody);

    }

});
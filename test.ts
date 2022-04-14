import * as https from 'https';
import { JSDOM } from 'jsdom';
import { Readable } from 'stream';
import { createGunzip } from 'zlib';

https.get("https://nyaa.si/", response => {
    let output: Readable = response;

    if (response.headers['content-encoding'] === "gzip") {
        const gunzip = createGunzip();
        response.pipe(gunzip);
        output = gunzip;
    }

    const chunks: any[] = [];
    output.on("data", d => {
        chunks.push(d);
    });
    output.on("end", () => {
        const html: string = Buffer.concat(chunks).toString();
        const nodes = new JSDOM(html).window.document.querySelectorAll("tbody > tr");
        nodes.forEach(n => {
            const title = n.querySelector("a[href^=\\/view]")?.textContent;
            console.info(title);
            const link = n.querySelector("a[href^=\\magnet]")?.getAttribute("href");
            console.info(link);
            // console.info(`${n.textContent}: ${n.getAttribute("href")}`);
        });
    })
    
})
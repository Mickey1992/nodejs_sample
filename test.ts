import { group } from 'console';
import * as https from 'https';
import { JSDOM } from 'jsdom';
import { resolve } from 'path';
import { Readable } from 'stream';
import { createGunzip } from 'zlib';

getHashCode();

async function getHashCode() {
    const baseURL: string = "https://nyaa.si" ;
    let document = await getDocument(baseURL);
    let nodes = document.querySelectorAll("a[href^=\\/view]:not(.comments)");
    for (const node of nodes) {
        const link = baseURL + node.getAttribute("href");
        let d = await getDocument(link);
        const hashCode = d.querySelector("kbd")?.textContent;
        console.info(`${node.textContent} : link = ${link}, hashCode = ${hashCode}`);
    }
}

function getDocument(url: string): Promise<Document>{
    return new Promise<Document>((resolve, reject) =>{
        https.get(url, response => {
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
                const document = new JSDOM(Buffer.concat(chunks).toString()).window.document;
                resolve(document);
            })
        })
    });
    
}



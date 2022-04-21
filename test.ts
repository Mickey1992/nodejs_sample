import { group } from 'console';
import * as https from 'https';
import { JSDOM } from 'jsdom';
import { resolve } from 'path';
import { Readable } from 'stream';
import { createGunzip } from 'zlib';

const baseURL: string = "https://nyaa.si" ;


// getInfo(baseURL, document => {
//     const nodes = document.querySelectorAll("a[href^=\\/view]:not(.comments)");
//     getHashInfo(nodes, 0);
// });


// function getHashInfo(nodes: NodeListOf<Element>, index: number){
//     if(index < nodes.length){
//         const link = baseURL + nodes[index].getAttribute("href");
//         getInfo(link, document => {
//             const hashCode = document.querySelector("kbd")?.textContent;
//             console.info(`${nodes[index].textContent} : link = ${link}, hashCode = ${hashCode}`);
//             getHashInfo(nodes, index+1);
//         })
//     }
    
// }

getInfo(baseURL).then(document => {
    return document.querySelectorAll("a[href^=\\/view]:not(.comments)");
}).then(nodes => {
    console.info(nodes.length);
    let promise = new Promise<void>((resolve, reject) => {resolve();});
    for (const node of nodes){
        const link = baseURL + node.getAttribute("href");
        promise = promise.then(() => {
            //console.info(link);
            return getInfo(link);
        }).then(d => {
            const hashCode = d.querySelector("kbd")?.textContent;
            console.info(`${node.textContent} : link = ${link}, hashCode = ${hashCode}`);
        });     
    }
})

function getInfo(url: string): Promise<Document>{
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



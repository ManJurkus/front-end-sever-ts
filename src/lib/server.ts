import http, { IncomingMessage, ServerResponse } from 'node:http';
import { file } from './file.js';
import { StringDecoder } from 'node:string_decoder';
import { log } from 'node:console';
import { json } from 'stream/consumers';
import { userInfo } from 'node:os';

type Server = {
    init: () => void;
    // httpServer: typeof http.createServer;
    httpServer: any;
}

const server = {} as Server;

server.httpServer = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const socket = req.socket as any;
    const encryption = socket.encryption as any;
    const ssl = encryption !== undefined ? 's' : '';

    const baseURL = `http${ssl}://${req.headers.host}`;
    const parsedURL = new URL(req.url ?? '', baseURL);
    const httpMethod = req.method ? req.method.toLowerCase() : 'get';
    const trimmedPath = parsedURL.pathname
        .replace(/^\/+|\/+$/g, '')
        .replace(/\/\/+/g, '/');

    const textFileExtensions = ['css', 'js', 'svg', 'webmanifest'];
    const binaryFileExtensions = ['png', 'jpg', 'jpeg', 'webp', 'ico', 'eot', 'ttf', 'woff', 'woff2', 'otf'];
    const fileExtension = trimmedPath.slice(trimmedPath.lastIndexOf('.') + 1);

    const isTextFile = textFileExtensions.includes(fileExtension);
    const isBinaryFile = binaryFileExtensions.includes(fileExtension);
    const isAPI = trimmedPath.startsWith('api/');
    const isPage = !isTextFile && !isBinaryFile && !isAPI;

    // type Mimes = { [key: string]: string };
    type Mimes = Record<string, string>;

    const MIMES: Mimes = {
        html: 'text/html',
        css: 'text/css',
        js: 'text/javascript',
        json: 'application/json',
        txt: 'text/plain',
        svg: 'image/svg+xml',
        xml: 'application/xml',
        ico: 'image/vnd.microsoft.icon',
        jpeg: 'image/jpeg',
        jpg: 'image/jpeg',
        png: 'image/png',
        webp: 'image/webp',
        woff2: 'font/woff2',
        woff: 'font/woff',
        ttf: 'font/ttf',
        webmanifest: 'application/manifest+json',
    };

    // console.log(trimmedPath);

    let responseContent: string | Buffer = 'ERROR: neturiu tai ko tu nori...';
    let buffer = '';
    const stringDecoder = new StringDecoder('utf-8');


    console.log(res); 

    console.log(); 
    
    

    req.on('data', (data) => {
        buffer += stringDecoder.write(data);

    });

    req.on('end', async () => {
        buffer += stringDecoder.end();
        

        if (isTextFile) {
            const [err, msg] = await file.readPublic(trimmedPath);
            
            res.writeHead(err ? 404 : 200, {
                'Content-Type': MIMES[fileExtension],
                'cache-control': `max-age=60`,
            });
            if (err) {
                responseContent = msg;
            } else {
                responseContent = msg;
            }
        }
    
        if (isBinaryFile) {
            const [err, msg] = await file.readPublicBinary(trimmedPath);
            
            res.writeHead(err ? 404 : 200, {
                'Content-Type': MIMES[fileExtension],
                'cache-control': `max-age=60`,
            });
            if (err) {
                responseContent = msg;
            } else {
                responseContent = msg;
            }
        }
    
        if (isAPI) {


            console.log(buffer);


            const jsonData = buffer ? JSON.parse(buffer) : {};

            console.log(jsonData);
                const newKey = "id";
                let lastId = 0;
                jsonData[newKey] = lastId;

            
            if( req.method === 'POST'){
            const [err, msg] = await file.create('users', jsonData.email + '.json', jsonData);
    
            if(err){
                responseContent = msg.toString();
            } else {
                responseContent = 'User created!';

            }
            }

            
            
        }
    
        if (isPage) {
            let fileResponse = await file.read('../pages', trimmedPath + '.html');
            let [err, msg] = fileResponse;
    
            if (err) {
                fileResponse = await file.read('../pages', '404.html');
                err = fileResponse[0];
                msg = fileResponse[1];
            }
    
            res.writeHead(err ? 404 : 200, {
                'Content-Type': MIMES.html,
            });
    
            responseContent = msg as string;
        }
    
        return res.end(responseContent);

    });



    
});

async function getInfo (info:string) {
    // let fileResponse = await file.read('../.data/users', info);
    

    // return fileResponse;

    

}
console.log(getInfo("jonas2@jonass.lt.json"));


server.init = () => {
    server.httpServer.listen(4433, () => {
        console.log('Serveris sukasi ant http://localhost:4433');
    });
};

export { server };
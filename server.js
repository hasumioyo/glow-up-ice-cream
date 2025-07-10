const http = require('http');
const fs = require('fs');
const path = require('path');
const {parse} = require('querystring');
const mysql = require('mysql2');

const publicDir = path.join(__dirname, 'public');
const PORT = 3000;

const db = mysql.createConnection({

    host: 'localhost',

    user: 'root',

    password: '',

    database: 'glow_up_icecream'

});
db.connect((err) => {

    if(err){
        
        console.error("koneksi database gagal");

        process.exit();

    }
    console.log("koneksi ke database berhasil!");

})

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');  
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'GET') {
        const filePath = req.url === '/' ? '/index.html' : req.url;
        const fullPath = path.join(publicDir, filePath);

        fs.readFile(fullPath, (err, content) => {
            if (err) {
                res.writeHead(404);
                return res.end('File not found');
            }

            const ext = path.extname(fullPath);
            const contentType = ext === '.css' ? 'text/css' :
                                ext === '.js' ? 'text/javascript' :
                                ext === '.html' ? 'text/html' : 'text/plain';

            res.writeHead(200, {'Content-Type' : contentType});
            res.end(content);
        });

    } else if (req.method === 'POST' && req.url === '/contact') {
        // let body = '';
        // req.on('data', chunk => body += chunk);
        // req.on('end', () => {
        //     const parsed = parse(body);
        //     const log = `Nama: ${parsed.name}, Email: ${parsed.email}, Pesan: ${parsed.message}\n`;
        //     fs.appendFileSync('./submissions/data.txt', log);
        //     res.writeHead(200, {'Content-Type' : 'text/plain'});
        //     res.end('Terima kasih! Pesan Anda telah diterima.');
        // });
        let body = '';
        req.on('data', chunk => body += chunk); //terima potongan data
        req.on('end', () => { //semua data diterima, siap dimasukan
            const parsed = parse(body); //mengubah string menjadi objek
            const {name, email, message} = parsed;
            const sql = 'INSERT INTO contacts (name, email, message) values(?,?,?)';
            db.query(sql, [name, email, message], (err) => {
                if(err){
                    console.log("gagal tersimpan ke DB");
                    res.writeHead(500, {'Content-Type': 'text/plain'});
                    return res.end("gagal menyimpan data");

        }

            res.writeHead(200, {'Content-Type' : 'text/plain'});
            return res.end("Data Anda telah tersimpan!");

        })

    });

    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(PORT, () => {console.log (`Server running at http://localhost:${PORT}`)});
const {app, BrowserWindow } = require('electron');
const express = require('express');
const cheerio = require('cheerio');

app.on('ready', () => {
    const www = express();
    www.listen(8888);
    
    Route(www);
});

function Route(www){
    www.get("/",(req, res)=>{
        if (req.query.site){
            let html = Loader(req.query.site,data=>{
                res.send(data);
            });
        } else {
            res.status(500).send('Bad Query');
        }
    });
}

function Loader(query,call){
    const win = new BrowserWindow({show: false});
    win.loadURL(query); 

    win.webContents.on('did-finish-load',()=>{
        let contents = win.webContents;
            
        contents.executeJavaScript('document.querySelector("html").innerHTML',true)
            .then((result) => {
                let data = toFrame(result,query);
                call(data);
            });
    });
    
    setTimeout(()=>{
        call('load fail');
    },5000);
}

function toFrame(html,query){
    const $ = cheerio.load(html);
    const url = new URL(query);
    const base = url.protocol+"//"+url.hostname+"/";
    
    if ($("base")[0]){
        $("base").attr("href",base);
    } else {
        $("head").prepend(`<base href="${base}">`);
    }
    
    return $.html();
}

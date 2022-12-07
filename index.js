'use strict';

const Hapi = require('@hapi/hapi');
const datas = require('./production.json');
const test = require('./testProduction.json');
const moment = require('moment');
var fs = require('fs');

const init = async () => {

    const server = Hapi.server({
        port: 3004,
        host: 'localhost',
        routes: {
            cors: {
                origin:['*'],
                headers: ["Accept", "Content-Type"],
                additionalHeaders: ["X-Requested-With"]
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/status',
        handler: (request, h) => {

            return 'API production: ok';
        }
    });

    server.route({
        method: 'GET',
        path: '/lastProduction',
        handler: (request, h) => {
            return datas[datas.length-1];
        }
    });

    server.route({
        method: 'GET',
        path: '/productionsByWeek',
        handler: (request, h) => {
            return datas.filter((el)=>{
                return el.date > moment().startOf('week').add(1, 'day').format('YYYY-MM-DD HH:mm:ss') && el.date < moment().endOf('week').add(1, 'day').format('YYYY-MM-DD HH:mm:ss') 
            });;
        }
    });

    server.route({
        method: 'GET',
        path: '/productionsByMonth',
        handler: (request, h) => {
            return datas.filter((el)=>{
                return el.date > moment().startOf('month').format('YYYY-MM-DD HH:mm:ss') && el.date < moment().endOf('month').format('YYYY-MM-DD HH:mm:ss') 
            });;
        }
    });

    server.route({
        method: 'POST',
        path: '/addProduction',
        handler: (request, h) => {
            const payload = request.payload
            fs.readFile('production.json', function (err, data) {
                var json = JSON.parse(data)
                json.push(payload)
                fs.writeFile("production.json", JSON.stringify(json), function(err) {})
            })
            return payload;
        }
    });

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = new require("socket.io")(server);
server.listen(8888, () => {console.log('Le serveur écoute sur le port 8888');});

var nbJoueurs = 0;
var listeJoueurs = [];
var listMes = [];

app.get('/', (request, response) => {
    response.sendFile('client_socket.io.html', {root: __dirname});
    
});

app.get('/file/:file', (request, response) => {
    response.sendFile(request.params.file, {root: __dirname});
    console.log("envoie de ", request.params.file);
    
});

io.on('connection', (socket) => {
    socket.on('test', data => {
        console.log("Message reçu du client :", data);
        socket.emit('test', {'quiterepond': 'le serveur !'})
        //socket.emit('test', {'nbJoueurs': nbJoueurs,'listeJoueurs' : listeJoueurs})
    });

    socket.on('connectionS', data => {
        console.log("demande reçu:", data);
        socket.emit('connectionS', {'quiterepond': 'Demande de '+data+' prise en compte'})
        if(listeJoueurs.includes(data) == false){
            listeJoueurs.push(data);
            nbJoueurs += 1;
            socket.emit('connectionS', {'nomJ': data,'numJ':nbJoueurs,'listJ' : listeJoueurs, 'listM' : listMes});
            io.emit("newJoueur", {'nomJ': data,'listJ' : listeJoueurs})
        }else{
            socket.emit('connectionS', {'quiterepond': 'Demande de '+data+' refusé, le joueur est déja dans la partie'});
        }
    });

    socket.on('quitJoueur', data => {
        console.log("Message reçu du client :", data);
        socket.emit('quitJoueur', {'quiterepond': 'le joueur n°'+data.numJ+' veut quitter la partie'})
        console.log(listeJoueurs);
        listeJoueurs.splice(data.numJ-1,1);
        nbJoueurs -= 1;
        console.log("liste des joueurs :");
        console.log(listeJoueurs);
        socket.broadcast.emit('autrejoueurQuit',{"nomJ": data.nomJ,"numJ" :data.numJ,"listJ": listeJoueurs})//modifie le numéro des autrs joueurs
    });

    socket.on('envMes',data => {
        listMes.push({'nomJ' : data.nomJ,"message" : data.message});
        io.emit('newMes',{'nomJ' : data.nomJ,"message" : data.message});
    });



});
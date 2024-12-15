const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = new require("socket.io")(server);
server.listen(8888, () => {console.log('Le serveur écoute sur le port 8888');});

var nbJoueurs = 0;//nombre de joueurs connectés au chat
var listeJoueurs = [];//liste des joueurs connectés au chat
var listMes = [];//liste de tous les messages
var nbJPartie = 0;//nombre de joueurs dans la partie d'Hex (<=2)
var nbJPMax = 2
var listeJPartie = [];//liste des joueurs dans la partie d'Hex
var jeton;//détermine quel joueur peut jouer -> false : le joueur 0 et true le joueur 1
var permierJoueur = 0;
var playersCases = [[],[]] // tableau qui contient les cases du joueur 0 et les cases su joueur 1
var listCouleurs = ["red","blue"]// couleur du joueur 0 et du joueur 1
var nbLignes = 11;//modifier pour pas écrit dans client et serveur
var nbColonnes = 11 ;

function choix1erJ(){
    let res = Math.random();//choix d'un nombre aléatoire entre 0 et 1
    if(res<0.5){ 
        jeton = 0
    }else{
        jeton = 1;
    }
    
    permierJoueur = jeton;
    return jeton;
}

function dejaSelect(num){
    for(let c of playersCases){
        if(c.includes(num)){ return true};
    }
    return false;
}

function bonJoueur(name,numC,numU){
    if(name == listeJPartie[numU]){// si c'est au joueur 1 de jouer
        
        if(dejaSelect(numC) == false){//et qu'il à clické sur une case vierge
            console.log("case h"+numC+" clické")
            playersCases[numU].push(numC);//le joueur peut jouer
            jeton = changeJoueur(jeton); //on change de jeton
            console.log("jeton");
            return numU;
        }else{
            console.log("la case est déja occupé");
        }   
    }else{
        console.log("ce n'est pas votre tour");
    }
    return -1;
}

function coteG(c){
    if(c%nbColonnes == 0){
        return true;
    };
    return false;
};

function coteH(c){
    if(c<nbColonnes){
        return true;
    };
    return false;
};

function coteD(c){
    if(c%nbColonnes == nbColonnes-1){
        return true;
    };
    return false;
};

function coteB(c){
    if(c > nbColonnes*(nbLignes-1) && c < nbColonnes*nbLignes){
        return true;
    };
    return false;
};

function testCote(){
    let cg = [];
    let ch = [];
    let cd = [];
    let cb = [];
    console.log(nbColonnes*nbLignes);
    for(let i =0;i<nbColonnes*nbLignes;i++){
        if(coteG(i)){ cg.push(i)};
        if(coteH(i)){ ch.push(i)};
        if(coteD(i)){ cd.push(i)};
        if(coteB(i)){ cb.push(i)};
    }
    console.log("gauche : ", cg);
    console.log("haut : ", ch);
    console.log("droite : ", cd);
    console.log("bas : ", cb);
}

function voisins(c){//renvoie la liste des voisins
    let v = [];
    
    if(!coteG(c)){//si la case n'est pas sur le cote gauche
        v.push(c-1);
    };

    if(!coteH(c)){//si la case n'est pas sur le cote du haut
        v.push(c-nbColonnes);
        if(!coteD(c)){// les casesde droites n'ont qu'un voisin au dessus
            v.push(c-nbColonnes+1);
        }
    }

    if(!coteD(c)){//si la case n'est pas sur le cote gauche
        v.push(c+1);
    }

    if(!coteB(c)){//si la case n'est pas sur le cote du haut
        v.push(c+nbColonnes);
        if(!coteG(c)){// les casesde droites n'ont qu'un voisin au dessus
            v.push(c+nbColonnes-1);
        }
    }
    return v;// au minimu 2 voisins, au max 6
}


function verifWin(numU){//utiliser call back 
    let aRegard = [];
    let DeJaV = []
    let voisinsL =  [];
    console.log("numU dans verifWin : ",numU);
    if(numU == 0){//le joueur 0 gauche et droit
        for(let i of playersCases[numU]){
            if(coteG(i)){
                aRegard.push(i);
            };
        };
        console.log("cases à regarder : ",aRegard);

        for(let c of aRegard){
            DeJaV.push(c);
            voisinsL = voisins(c);
            console.log("voisins ",voisinsL);
            for(let v of voisinsL){
                if(playersCases[numU].includes(v) && DeJaV.includes(v) == false){//si elle à été cochée et qu'on n" l'a pas encore vue
                    if(coteD(v)){//si il est de l'autre coté
                        return true;
                    }
                    aRegard.push(v);
                }
            }
        }
    }else{//le joueur 1 hauts et bas
        for(let i of playersCases[numU]){
            if(coteH(i)){
                aRegard.push(i);
            };
        };

        console.log("cases à regarder : ",aRegard);

        for(let c of aRegard){
            DeJaV.push(c);
            voisinsL = voisins(c);
            for(let v of voisinsL){
                if(playersCases[numU].includes(v) && DeJaV.includes(v) == false){//si elle à été coché
                    if(coteB(v)){//si il est de l'autre coté
                        return true;
                    }
                    aRegard.push(v);
                }
            }
        }
    }
    return false;
}

function changeJoueur(j){//prend en parametre numero du joueur qui vient de jouer et renvoie le numéro du prochain joueur
    if(j >= nbJPMax-1){//si le dernier joueur vient de jouer
        return 0;
    }else{
        return j+1;
    }
}

function listeautresJ(n,l){//renvoie la liste des autres joueurs de la liste l que celui qui a l'indice n 
    let s = l.length;
    let res = [];
    for(let i = 0;i<s;i++){
        if(i!=n){
            res.push(l[i]);
        }
    }
    return res;
};

function reiniPartie(){//fonction pour redémarer une partie
    nbJPartie = 0;
    playersCases = [[],[]];
    listeJPartie = [];
};

app.get('/', (request, response) => {
    response.sendFile('client_socket.io.html', {root: __dirname});
    
});

app.get('/file/:file', (request, response) => {
    response.sendFile(request.params.file, {root: __dirname});
    console.log("envoie de ", request.params.file);
    
});

io.on('connection', (socket) => {
    socket.on('arrive', data => {//un nouvel utilisateur arrive sur le site
        console.log("Un nouvel utilisateur viens de se connecter");
        let actuelJP = -1;
        if(nbJPartie == nbJPMax){//si la partie à commencé
            actuelJP = jeton;//on renvoie le numéro du joueur qui doit jouer
        }
        socket.emit('init', {'listJ' : listeJoueurs, 'listM' : listMes,"listeCases": playersCases,"couleurs":listCouleurs,"listeJP": listeJPartie,"numActuelJP" : actuelJP,"nbL":nbLignes,"nbC":nbColonnes,"JPMax":nbJPMax})

    });

    socket.on('connectionS', data => {//un utilisateur se connecte
        if(listeJoueurs.includes(data) == false){
            listeJoueurs.push(data);
            socket.emit('connectionS', {'nomU': data,'numU':nbJoueurs});
            io.emit("newJoueur", {'nomU': data,'listJ' : listeJoueurs});
            nbJoueurs += 1;
        }else{
            socket.emit('connectionS', {'quiterepond': 'Demande de '+data+' refusé, le joueur est déja dans la partie'});
        }
    });

    socket.on('quit', data => {//un utilisateru veut quitter
        console.log("Message reçu du client :", data);
        
        console.log(listeJoueurs);
        nomUQuit = listeJoueurs[data.numU];
        listeJoueurs.splice(data.numU,1);
        nbJoueurs = nbJoueurs - 1;
        console.log("liste des joueurs :");
        console.log(listeJoueurs);
        io.emit('userQuit', {"nomU": nomUQuit,"listJ": listeJoueurs,"numU" :data.numU})
        if(listeJPartie.includes(nomUQuit)){//si c'est un joueur du jeu de Hex qui à quitté la partie
            io.emit("arretGame",{"cases":playersCases})
            reiniPartie();
        }
    });

    socket.on('envMes',data => {
        listMes.push({'nomU' : data.nomU,"message" : data.message});
        io.emit('newMes',{'nomU' : data.nomU,"message" : data.message});
    });

    socket.on("accesJ",data =>{//acces a la partie de hex
        if(nbJPartie < nbJPMax){//on vérifie que la partie ne soit pas pleine
            nbJPartie += 1;
            listeJPartie.push(data.nomU);
            socket.emit('AccesPartieValid',{"numP":nbJPartie-1});
            
            io.emit('newJPartie',{"newJPartie":data.nomU});
            console.log("joueurs dans la partie de Hex : ", listeJPartie);
            if(nbJPartie == nbJPMax){//la partie est pleine 
                console.log("partie pleine");
                io.emit("DebutP",{"listeJPartie":listeJPartie,"numPremierJ":choix1erJ()})//envoie le numero du premier joueurs 
                console.log("c'est au joueur ", jeton)    
        }

        }else{
            socket.emit("AccesPartieRefus");
        }
    })

    socket.on("caseSelect",data =>{
        let numJP;
        console.log("le joueur ",data.nomU," veut jouer sur la case : ",data.numC);
        numJP = bonJoueur(data.nomU,data.numC,jeton);//Si le jeton vaut 1 c'est au joueur 1 de jouer, on vé rifie que c'est bien le cas
        if(numJP != -1){//si le joueur à bien pu jouer
            
            console.log("cases jouées : ",playersCases )
            io.emit("newCaseSelect",{"casesS" :playersCases,"numJP" : changeJoueur(numJP)});
            
            
            if(verifWin(numJP)){
                console.log("bravo "+listeJPartie[numJP]+" vous avez gagné");
                io.emit("victoire",{"nomV":listeJPartie[numJP],"nomD":listeautresJ(numJP,listeJPartie),"cases":playersCases});
                reiniPartie()               

            }else{
                console.log("c'est au joueur ",jeton);
            }
            
        }
    })


    socket.on("specMode",data =>{
        let actualRound = 0;
        for(let t of playersCases){
            actualRound += t.length;
        }
        console.log("roud à regarder: ",data.roudS,"/",actualRound)
        let specTab = [[],[]];
        if(data.roudS<0){
            socket.emit("specModeTab",{"allCases":playersCases,"specTab":specTab,"specRoud":0,"couleurs":listCouleurs});
        }else if(data.roudS>=actualRound){
            socket.emit("specModeTab",{"allCases":playersCases,"specTab":playersCases,"specRoud":actualRound,"couleurs":listCouleurs});
        }else{
            let c = 0;
            while(c<Math.floor(data.roudS/2)){
                for(let i in playersCases){
                    specTab[i].push(playersCases[i][c]);
                }
                c++
            }
            if(data.roudS%2 == 1){
                specTab[permierJoueur].push(playersCases[permierJoueur][c])
            };
            console.log("spectateur retour : ",specTab)
            socket.emit("specModeTab",{"allCases":playersCases,"specTab":specTab,"specRoud":data.roudS,"couleurs":listCouleurs});
        }
    })

    socket.on("leave",data =>{
        console.log(data);
    })
});
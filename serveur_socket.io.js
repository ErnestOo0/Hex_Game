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
var permierJoueur = 0;//A MODIFIER, INUTILE DE PASSER PAR UN >BOOLEEN -> FONCTION CHANGER JOUEUR
var playersCases = [[],[]] // tableau qui contient les cases du joueur 0 et les cases su joueur 1
var listCouleurs = ["red","blue"]// couleur du joueur 0 et du joueur 1
var nbLignes = 11;//modifier pour pas écrit dans client et serveur
var nbColonnes = 11 ;

function choix1erJ(){
    let res = Math.random();
    if(res<0.5){ 
        jeton = 0
    }
    jeton = 1;
    permierJoueur = jeton;
    return jeton;
}

// function jeton2int(j){ A SUPPRIMER
//     if(j  = false){
//         return 0;
//     }else{
//         return 1
//     }
// }

function dejaSelect(num){
    for(let c of playersCases){
        if(c.includes(num)){ return true};
    }
    return false;
}

function bonJoueur(name,numC,numJ){
    if(name == listeJPartie[numJ]){// si c'est au joueur 1 de jouer
        
        if(dejaSelect(numC) == false){//et qu'il à clické sur une case vierge
            console.log("case h"+numC+" clické")
            playersCases[numJ].push(numC);//le joueur peut jouer
            jeton = changeJoueur(jeton); //on change de jeton
            console.log("jeton");
            return numJ;
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


function verifWin(numJ){//utiliser call back 
    let aRegard = [];
    let DeJaV = []
    let voisinsL =  [];
    console.log("numJ dans verifWin : ",numJ);
    if(numJ == 0){//le joueur 0 gauche et droit
        for(let i of playersCases[numJ]){
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
                if(playersCases[numJ].includes(v) && DeJaV.includes(v) == false){//si elle à été cochée et qu'on n" l'a pas encore vue
                    if(coteD(v)){//si il est de l'autre coté
                        return true;
                    }
                    aRegard.push(v);
                }
            }
        }
    }else{//le joueur 1 hauts et bas
        for(let i of playersCases[numJ]){
            if(coteH(i)){
                aRegard.push(i);
            };
        };

        console.log("cases à regarder : ",aRegard);

        for(let c of aRegard){
            DeJaV.push(c);
            voisinsL = voisins(c);
            for(let v of voisinsL){
                if(playersCases[numJ].includes(v) && DeJaV.includes(v) == false){//si elle à été coché
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

app.get('/', (request, response) => {
    response.sendFile('client_socket.io.html', {root: __dirname});
    
});

app.get('/file/:file', (request, response) => {
    response.sendFile(request.params.file, {root: __dirname});
    console.log("envoie de ", request.params.file);
    
});

io.on('connection', (socket) => {
    socket.on('test', data => {
        console.log("Message reçu du client :", data.message);
        let actuelJP = -1;
        if(nbJPartie == nbJPMax){//si la partie à commencé
            actuelJP = jeton;//on renvoie le numéro du joueur qui doit jouer
        }
        socket.emit('test', {'quiterepond': 'le serveur !','listJ' : listeJoueurs, 'listM' : listMes,"listeCases": playersCases,"couleurs":listCouleurs,"listeJP": listeJPartie,"numActuelJP" : actuelJP})
        data.nbL = nbLignes;
        data.nbC = nbColonnes;
        //socket.emit('test', {'nbJoueurs': nbJoueurs,'listeJoueurs' : listeJoueurs})
    });

    socket.on('connectionS', data => {
        if(listeJoueurs.includes(data) == false){
            listeJoueurs.push(data);
            nbJoueurs += 1;
            socket.emit('connectionS', {'nomJ': data,'numJ':nbJoueurs});
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

    socket.on("accesJ",data =>{
        if(nbJPartie < nbJPMax){//on vérifie que la partie ne soit pas pleine
            nbJPartie += 1;
            listeJPartie.push(data.nomJ);
            socket.emit('AccesPartieValid',{"numP":nbJPartie-1});
            
            io.emit('newJPartie',{"listeJPartie":listeJPartie,"newJPartie":data.nomJ});
            console.log("joueurs dans la partie de Hex : ", listeJPartie);
            if(nbJPartie == nbJPMax){//la partie est pleine 
                console.log("partie pleine");
                io.emit("DebutP",{"numJ1":choix1erJ()})
                console.log("c'est au joueur ", jeton)    
        }

        }else{
            socket.emit("AccesPartieRefus");
        }
    })

    socket.on("caseSelect",data =>{
        let numJP;
        console.log("le joueur ",data.nomJ," veut jouer sur la case : ",data.numC);
        numJP = bonJoueur(data.nomJ,data.numC,jeton);//Si le jeton vaut 1 c'est au joueur 1 de jouer, on vé rifie que c'est bien le cas
        if(numJP != -1){//si le joueur à bien pu jouer
            
            console.log("cases jouées : ",playersCases )
            io.emit("newCaseSelect",{"casesS" :playersCases,"couleurs" : listCouleurs,"numJP" : changeJoueur(numJP)});
            
            
            if(verifWin(numJP)){
                console.log("bravo "+listeJPartie[numJP]+" vous avez gagné");
                io.emit("victoire",{"nomV":listeJPartie[numJP],"nomD":listeautresJ(numJP,listeJPartie),"cases":playersCases});
                nbJPartie = 0;
                playersCases = [[],[]];
                listeJPartie = [];
               

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

});
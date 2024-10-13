

var numJoueur;
var nomJoueur;
var connected = false;
var socket = io();
var numJPartie = -1;
var nbC = 11;
var nbL = 11;
var specRound = 0;
tablier = [[],[]];
backColor = "white";

function Tab2TabLength(tab){
   let res = 0;
   for(let t of tab){
      res += t.length;
   }
   return res;
}

function infoT(s,a){
   document.getElementById("infoTour").innerHTML = "";
   document.getElementById("infoTour").innerHTML += s + "/" + a;
}

function test() {
   console.log("Appel du serveur");
   socket.emit('test', {"message":"Ô serveur je t'envoie ce message","nbL" : nbL,"nbC":nbC});
   
};

function ajoutList(id,tab){
    document.getElementById(id).innerHTML = ""
    for(let j of tab){
        document.getElementById(id).innerHTML +="<li>"+j+"</li>";
    }
};

function makeListJHex(listJH){//crée la liste des joueurs dans la partie de Hex avec un id pNumérodeJoueurDansLaPartie
   for(let j in listJH){
      document.getElementById("listeJHex").innerHTML += "<li id = p"+j+">"+listJH[j]+"</li>";
   }
};

function messagePrint(m,de){
   if(de == ""){//il s'agit d'un message d'information

      document.getElementById("listMessages").innerHTML +="<li class = 'mesInfo'>"+m+"</li>";
   
   }else if(de == nomJoueur){//si c'est l'utilisateur qui a envoyé le message
      
      document.getElementById("listMessages").innerHTML +="<li class = 'mesMes'>"+m+"</li>"; 
   
   }else{//un autre joueur à envoyé un message
      
      document.getElementById("listMessages").innerHTML +="<li class = 'autreMes'>"+de+" : "+m+"</li>";
  
   }
}

function colorierCases(tabCases,tabCouleurs){
   for(let j in tabCases){
      for(let c of tabCases[j]){
         console.log("h"+c);
         document.getElementById("h"+c).style.fill = tabCouleurs[j];
      }
   }
}

function reiniParite(listeCases,listeNom){//quand la partie est finie on enleve tous les joueurs
   numJPartie = -1;//les joueurs ne sont plus dans la partie  possiblité de faire un system de file d'attente
   console.log("réinitialistaion de la partie");
   for(let caseJ of listeCases){
      for(let c of caseJ){//on colorie toutes les cases en blanc
    
      document.getElementById("h"+c).style.fill = backColor;
   }
   document.getElementById(listeNom).innerHTML = ""//on vide al liste des joueurs dans la partie
   }
}

function entrerPartie() {
   if(nom.value == ""){//empeche les joueurs d'avoir un nom vide
      console.log("entrez un nom valde");
   }else{
      console.log("le joueur "+nom.value+" veut rejoindre");
      socket.emit('connectionS', nom.value);
}
   }
   

function quitterPartie(){
   socket.emit('quitJoueur', {"numJ": numJoueur, "nomJ": nomJoueur});
}

function envoieMessage(){
   if(nomJoueur != undefined){
      socket.emit('envMes',{"nomJ" : nomJoueur, "message" : message.value});
   }
   
}

function accesJeu(){//si le bouton rejoindre est pressé, on demande au serveur si on peut rejoindre la partie
   if(nomJoueur != undefined){
      socket.emit("accesJ",{"numJ": numJoueur, "nomJ": nomJoueur});
      console.log(nomJoueur, " veut rejoindre la partie");
   }
   
}

function id2Chif(id){// prend un l'id d'uen case de la forme h+nombre et en renvoie que le nombre
   let c = "";
   let l = id.length -1;
   while(l>0){//on recupere juste les chiffres
      c = id[l]+c;
      l -=1;
   }
   return Number(c);
}

function selecteCase(cNum){
   if(numJPartie < 0){
      messagePrint("Vous n'etes pas dans la partie","");
   }else{
      let c = id2Chif(cNum);
      socket.emit("caseSelect",{"numC":c,"nomJ":nomJoueur});
      
      console.log("numero ",c);
   }
   
};

function TourDeJouer(num){//le joueur qui doit jouer est en rouge et les autres n'ont pas de couleur
   console.log("c'est au joueur n°",num);
   for(let i = 0;i<2;i++){
      console.log(i == num);
      if(i == num){
         document.getElementById("p"+i).style.color = "red";
      }
      else{
         document.getElementById("p"+i).style.color = "black";
      }
   }
   
};

function actionPrec(){
   socket.emit("specMode",{"roudS":specRound -1});
}

function actionSuiv(){
   socket.emit("specMode",{"roudS":specRound +1});
}

function goDirect(){
   socket.emit("specMode",{"roudS":nbL*nbC+1});//on envoie le tour max, le nnompbre de cases +1
}

socket.on("specModeTab",data=>{
   specRound = data.specRoud;
   colorierCases(data.allCases,[backColor,backColor]);//on colorie toutes les cases joués en blanc
   colorierCases(data.specTab,data.couleurs);//on colorie seulement les cases voulus de la bonne couleure
   infoT(specRound,Tab2TabLength(data.allCases))
})

socket.on('test', data => {//premiere réponse du serveur
   console.log('Réponse du serveur :');
   console.dir(data);
   for(let i of data.listM){
      messagePrint(i.message,i.nomJ);
   }
   ajoutList("playersList",data.listJ);
   makeListJHex(data.listeJP);
   if(data.numActuelJP >= 0){//si le numéro du joueur qui doit jouer est bonne
      TourDeJouer(data.numActuelJP);
   }
   goDirect();


});

socket.on('connectionS', data => {//réponses du serveur à la demande NewJoueur
   if(data.numJ!=null){
      numJoueur = data.numJ
      nomJoueur = data.nomJ
      connected = true;

      document.getElementById("connexion").disabled = true;
      document.getElementById("deconnexion").disabled = false;
   }
   
});

socket.on("newJoueur",data => {
    console.log(data.nomJ + " a rejoint la partie");
    console.log("liste des joueurs :");
    console.log(data.listJ);
    ajoutList("playersList",data.listJ);
    messagePrint(data.nomJ+" vient de se connecter","");
});

socket.on('quitJoueur', data => {
   console.log('Réponse du serveur :');
   console.dir(data);
   connected = false
   document.getElementById("connexion").disabled = false;
   //document.getElementById("nom").style.display = "block";
   document.getElementById("deconnexion").disabled = true;
});

socket.on('autrejoueurQuit', data => {//si un autre joueur quitte la partie on adapte le numéro des joueurs
   if(data.numJ < numJoueur){
      numJoueur -=1;
      console.log("nouveau numéro ", numJoueur);
   }
   ajoutList("playersList",data.listJ);
   messagePrint(data.nomJ+" s'est déconnecté","");
});

socket.on('newMes',data => {
   messagePrint(data.message,data.nomJ)
});

socket.on("AccesPartieValid",data =>{
   console.log("vous avez rejoint la partie");
   numJPartie = data.numP;
});

socket.on("newJPartie",data => {
   document.getElementById("listeJHex").innerHTML = "";//on vide la liste
   makeListJHex(data.listeJPartie);
   
   if(data.newJPartie == nomJoueur){
      messagePrint("Vous avez rejoint la partie","");
   }else{
      messagePrint(data.newJPartie+" a rejoint la partie","")
   }
});

socket.on("AccesPartieRefus",function(){
   messagePrint("La partie est pleine","");
});

socket.on("DebutP",data =>{
   TourDeJouer(data.numJ1);
   specRound = 0;  
});

socket.on("newCaseSelect",data =>{
   TourDeJouer(data.numJP);
   if(specRound == Tab2TabLength(data.casesS)-1){//si le spectateur n'est pas entrain de regarder dans le passé (-1 car on incrémente apres)
      colorierCases(data.casesS,data.couleurs)
      specRound+=1
   }
   infoT(specRound,Tab2TabLength(data.casesS))
});



socket.on("victoire",data =>{
   
   reiniParite(data.cases,"listeJHex");
   
   if(data.nomV == nomJoueur){
      messagePrint("Vous avez gagné la partie ","")
   }else{
      if(data.nomD.includes(nomJoueur)){
         messagePrint("Vous avez perdu la partie ","")
      }
      messagePrint(data.nomV+" a gagné la partie la partie","")
   }
});

window.addEventListener('load', () => { 
   test();
   genereDamier(25, nbL, nbC);
   document.getElementById("deconnexion").disabled = true;
});
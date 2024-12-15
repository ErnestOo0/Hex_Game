var numUser;
var nomUser;
var socket = io();
var numJPartie = -1;
var nbColones;
var nbLignes;
var rayonHex = 25
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

function infoT(s,a){//pour le mode spectateur
   document.getElementById("infoTour").innerHTML = "";
   document.getElementById("infoTour").innerHTML += s + "/" + a;
}

function test() {
   console.log("Premier échange avec le serveur");
   socket.emit('arrive');
   
};

function makeHTMLList(id,tab){
    document.getElementById(id).innerHTML = ""
    for(let j of tab){
        document.getElementById(id).innerHTML +="<li>"+j+"</li>";
    }
};

function makeListJHex(listJH){//crée la liste des joueurs dans la partie de Hex avec un id pNumérodeJoueurDansLaPartie
   
   let html = "<ol>";
   for(let j in listJH){
 
      html += "<li id = 'p"+j+"' style='color:"+couleursHex[j]+"'>"+listJH[j]+"</li>";
   }
   html += "</ol>";
   console.log("html liste joueurs =",html);
   document.getElementById("listeJHex").innerHTML = html;
};

function afficheAttente(){

   document.getElementById("listeJHex").innerHTML = "en attente de votre adversaire";
}

function messagePrint(m,de){
   if(de == ""){//il s'agit d'un message d'information

      document.getElementById("listMessages").innerHTML +="<li class = 'mesInfo'>"+m+"</li>";
   
   }else if(de == nomUser){//si c'est l'utilisateur qui a envoyé le message
      
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
   document.getElementById("rejoindre").disabled = false;//on remet le bouton pour rejoindre la partie
   for(let caseJ of listeCases){
      for(let c of caseJ){//on colorie toutes les cases en blanc
    
      document.getElementById("h"+c).style.fill = backColor;
   }
   document.getElementById("listeJHex").innerHTML = ""//on vide al liste des joueurs dans la partie
   }
   document.getElementById("rejoindre").disabled = false;//on remet le bouton pour rejoindre la partie
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
   socket.emit('quit', {"numU": numUser});//modifier numJ par numU
}

function envoieMessage(){
   if(nomUser != undefined){
      socket.emit('envMes',{"nomU" : nomUser, "message" : message.value});
   }
   
}

function accesJeu(){//si le bouton rejoindre est pressé, on demande au serveur si on peut rejoindre la partie
   if(nomUser != undefined){
      socket.emit("accesJ",{"numU": numUser, "nomU": nomUser});
      console.log(nomUser, " veut rejoindre la partie");
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

function selecteCase(cNum){//modifier pour afficher les noms de la bonne couleur et mettre unenetoile à coté du joueur qui dois jouer
   if(numJPartie < 0){
      messagePrint("Vous n'etes pas dans la partie","");
   }else{
      let c = id2Chif(cNum);
      socket.emit("caseSelect",{"numC":c,"nomU":nomUser});
      
      console.log("numero ",c);
   }
   
};

function TourDeJouer(num){//le joueur qui doit jouer a une petite etoile
   console.log("c'est au joueur n°",num);
   for(let i = 0;i<2;i++){

      if(i == num){//on met une etoile devant le joueur qui doit jouer

         document.getElementById("p"+i).innerHTML = "* "+document.getElementById("p"+i).innerHTML;
      }
      else{

         if(document.getElementById("p"+i).innerHTML.substring(0,2)=="* "){//au premier tour il n'a pas d'etoile devant
            
            document.getElementById("p"+i).innerHTML = document.getElementById("p"+i).innerHTML.substring(2);//on enleve les 3 premiers caracteres
         }
         
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
   socket.emit("specMode",{"roudS":nbLignes*nbColones+1});//on envoie le tour max, le nnompbre de cases +1
}

socket.on("specModeTab",data=>{
   specRound = data.specRoud;
   colorierCases(data.allCases,[backColor,backColor]);//on colorie toutes les cases joués en blanc
   colorierCases(data.specTab,data.couleurs);//on colorie seulement les cases voulus de la bonne couleure
   infoT(specRound,Tab2TabLength(data.allCases))
})

socket.on('init', data => {//premiere réponse du serveur
   console.log('Serveur :');
   console.dir(data);
   couleursHex = data.couleurs

   document.getElementById("rejoindre").disabled = false;//on met le bouton pour rejoindre la partie

   makeHTMLList("userList",data.listJ);
   
   for(let i of data.listM){
      messagePrint(i.message,i.nomU);
   }

   if(data.numActuelJP >= 0){//si le numéro du joueur qui doit jouer est bon, alors la partie à commencé
      makeListJHex(data.listeJP)
      TourDeJouer(data.numActuelJP);
      document.getElementById("rejoindre").disabled = true;//la partie à deja commencé, on ne peut pas la rejoindre
   }

   nbColones = data.nbC;
   nbLignes = data.nbL
   
   genereDamier(rayonHex, nbLignes, nbColones);
   goDirect();
   //console.log(nbColones)
});

socket.on('connectionS', data => {//réponses du serveur à la demande NewJoueur
   if(data.numU!=null){
      numUser = data.numU
      console.log("numreo de joueur",numUser)
      nomUser = data.nomU

      document.getElementById("connexion").disabled = true;
      document.getElementById("deconnexion").disabled = false;
   }
   
});

socket.on("newJoueur",data => {// un novel utilisateur vient de se connecter
  
    makeHTMLList("userList",data.listJ);//on actualise la liste des joueurs
    messagePrint(data.nomU+" vient de se connecter","");
});

socket.on('userQuit', data => {
   console.dir(data);

   makeHTMLList("userList",data.listJ);
   messagePrint(data.nomU+" s'est déconnecté","");
   
   if(data.numU == numUser){
      
      numUser = -1;
      document.getElementById("connexion").disabled = false;
      document.getElementById("deconnexion").disabled = true;
   
   }else {
      
      if(data.numU < numUser){
         numUser -=1;
         console.log("nouveau numéro ", numUser);
      
      }
   }
   
});

socket.on('newMes',data => {
   messagePrint(data.message,data.nomU)
});

socket.on("AccesPartieValid",data =>{//on est connecté à la partie
   document.getElementById("rejoindre").disabled = true;// on désactive le bouton pour rejoindre la partie
   console.log("vous avez rejoint la partie");
   numJPartie = data.numP;
   document.getElementById("listeJHex").innerHTML = "";//on vide la liste
   afficheAttente()//indique qu'on atttend un autre joueur
});

socket.on("newJPartie",data => {
   
   if(data.newJPartie == nomUser){
      messagePrint("Vous avez rejoint la partie","");
   }else{
      messagePrint(data.newJPartie+" a rejoint la partie","")
   }
});

socket.on("AccesPartieRefus",function(){//le joueur ne peut pas accéder à la partie car elle est pleine
   messagePrint("La partie est pleine","");
});

socket.on("DebutP",data =>{
   
   console.log("debut de la partie")
   makeListJHex(data.listeJPartie);

   TourDeJouer(data.numPremierJ);
   specRound = 0;
   document.getElementById("rejoindre").disabled = true;//si la partie est pleine, personne ne peut rejoindre
});

socket.on("newCaseSelect",data =>{
   TourDeJouer(data.numJP);
   if(specRound == Tab2TabLength(data.casesS)-1){//si le spectateur n'est pas entrain de regarder dans le passé (-1 car on incrémente apres)
      colorierCases(data.casesS,couleursHex)
      specRound+=1
   }
   infoT(specRound,Tab2TabLength(data.casesS))
});



socket.on("victoire",data =>{
   
   reiniParite(data.cases);
   
   if(data.nomV == nomUser){
      messagePrint("Vous avez gagné la partie ","")
   }else{
      if(data.nomD.includes(nomUser)){
         messagePrint("Vous avez perdu la partie ","")
      }
      messagePrint(data.nomV+" a gagné la partie la partie","")
   }
});

socket.on("arretGame",data =>{//la partie est arreté car un  joueur à quitté
   reiniParite(data.cases);
   messagePrint("la partie est arrêté","");
});

window.addEventListener('load', () => { 
   test();
   //genereDamier(rayonHex, nbL, nbC);
   document.getElementById("deconnexion").disabled = true;
});

window.addEventListener('beforeunload',quitterPartie);//losque l'on quitte la page, on est déconnnecté
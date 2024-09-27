

var numJoueur;
var nomJoueur;
var connected = false;
var socket = io();

function test() {
   console.log("Appel du serveur");
   socket.emit('test', "Ô serveur je t'envoie ce message");
};

function ajoutList(id,tab){
    document.getElementById(id).innerHTML = ""
    for(let j of tab){
        document.getElementById(id).innerHTML +="<li>"+j+"</li>";
    }
};

function messagePrint(m,de){
   if(de == nomJoueur){//si c'est l'utilisateur qui a envoyé le message
      document.getElementById("listMessages").innerHTML +="<li class = 'mesMes'>"+m+"</li>";
  }else{
      document.getElementById("listMessages").innerHTML +="<li class = 'autreMes'>"+de+" : "+m+"</li>";
  }
}

socket.on('test', data => {
   console.log('Réponse du serveur :');
   console.dir(data);
});

socket.on('connectionS', data => {//réponses du serveur à la demande NewJoueur
   console.log('Réponse du serveur :');
   console.dir(data);
   if(data.numJ!=null){
      numJoueur = data.numJ
      nomJoueur = data.nomJ
      connected = true;
      for(let i of data.listM){
         messagePrint(i.message,i.nomJ);
      }

      document.getElementById("connexion").disabled = true;
      document.getElementById("deconnexion").disabled = false;
   }
   
});

socket.on("newJoueur",data => {
    console.log(data.nomJ + " a rejoint la partie");
    console.log("liste des joueurs :");
    console.log(data.listJ);
    ajoutList("playersList",data.listJ);
    document.getElementById("listMessages").innerHTML +="<li class = 'mesInfo'>"+data.nomJ+" a rejoint la partie</li>";
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
   document.getElementById("listMessages").innerHTML +="<li class = 'mesInfo'>"+data.nomJ+" a quitté la partie</li>";
});

function entrerPartie() {
   console.log("le joueur "+nom.value+" veut rejoindre");
   socket.emit('connectionS', nom.value);
}

function quitterPartie(){
   socket.emit('quitJoueur', {"numJ": numJoueur, "nomJ": nomJoueur});
}

function envoieMessage(){
   socket.emit('envMes',{"nomJ" : nomJoueur, "message" : message.value});
}

socket.on('newMes',data => {
   messagePrint(data.message,data.nomJ)
});

window.addEventListener('load', () => { 
   test()
   genereDamier(25, 11, 11);
   document.getElementById("deconnexion").disabled = true;
});
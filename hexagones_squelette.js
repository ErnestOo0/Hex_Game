      var agrand = 1.25;
      
      function creeHexagone(rayon) {
        var points = new Array();
        for (var i = 0; i < 6; ++i) {
            var angle = i * Math.PI / 3; 
            var x = Math.sin(angle) * rayon;
            var y = -Math.cos(angle) * rayon;
	         //console.log("x="+Math.round(x*100)/100+" y="+Math.round(y*100)/100);
            points.push([Math.round(x*100)/100, Math.round(y*100)/100]);
        }
        return points;
     }

     function createPath(rayon,agr,hexagone,distance,colonne,ligne){//si agr == 1 c'est qu'il n'y a aps d'agrandissement
         let d = "";
         let x, y;
         rayon = rayon*agr
         rayDist = rayon-distance;
         
         for (h in hexagone) {
            if(agr == 1){
               x = hexagone[h][0]+(rayon-distance)*(2+2*colonne)+((rayon) - distance)*ligne;//on ajoute ligne*(le rayon - la distance) pour decaller les hexa, enlever la distance qu rayon permet de bien aligner les hexa
               y = distance*2 + hexagone[h][1]+(rayon-distance*2)*(1+2.05*ligne);
            }else{//si il y a un agendissement ont ne les place pas pareil

               x = hexagone[h][0]+(rayDist/agr)*(2+2*colonne)+(rayDist/agr)*ligne;//on ajoute ligne*(le rayon - la distance) pour decaller les hexa, enlever la distance qu rayon permet de bien aligner les hexa
               y = distance*2 + hexagone[h][1]+((rayon-distance*2)/agr)*(1+2.05*ligne);
            }
            
            if(h == 0){
               d+="M"+x+","+y+" L";
            }else{
               d+=x+","+y+" ";
            }
         }
         d += "Z";
         //console.log(d);
         return d;
     }

     function calcDist(r){
         return r - (Math.sin(1 * Math.PI / 3) * r);
     }
 
   function genereDamier(rayon, nbLignes, nbColonnes) {

      distance =  calcDist(rayon);  // plus grande distance entre l'hexagone et le cercle circonscrit

      d3.select("#tablier").append("svg").attr("width",nbColonnes*2*(rayon*agrand)+(rayon*agrand)*nbLignes).attr("height", nbLignes*2*(rayon*agrand));//largeur et auteur de la balise svg lageure +grande de (rayon/2) *nblignes (on prend en compte l'agrandissement des hexa au survol de la souris)
      
      var hexagone = creeHexagone(rayon);

      for (var ligne=0; ligne < nbLignes; ligne++) {
         for (var colonne=0; colonne < nbColonnes; colonne++) {
            var d = createPath(rayon,1,hexagone,distance,colonne,ligne)                      

            d3.select("svg").append("path")
               .attr("d", d)
               .style("stroke", "black")
               .style("fill", "white")
               .style("stroke-width","2")
               .attr("z-index","1")//permet de gérer les plans, plus z index petit = moins devant
               .attr("id", "h"+(ligne*nbColonnes+colonne)) // car un id doit commencer par une lettre
               .on("mouseover", function(){
               
                  console.log("entrée ",[id2Chif(d3.select(this).attr('id'))%nbColonnes, Math.floor(id2Chif(d3.select(this).attr('id'))/nbColonnes)]);
               
                  d3.select(this).attr("d", createPath(rayon, agrand, creeHexagone(rayon*agrand), calcDist(rayon*agrand), id2Chif(d3.select(this).attr('id'))%nbColonnes, Math.floor(id2Chif(d3.select(this).attr('id'))/nbColonnes)));
                  console.log("avant : ",d3.select(this).attr.zInndex);
                  
                  d3.select(this).attr.zInndex = "999";//on met au premier plan
                 
                  console.log("apres : ",d3.select(this).attr.zInndex);
               })
               .on("mouseout",function(){//si rerentre ou entre dans nouvlle case ou alors mettre bordures en énorme
                  console.log("sortie ",[id2Chif(d3.select(this).attr('id'))%nbColonnes, Math.floor(id2Chif(d3.select(this).attr('id'))/nbColonnes)]);
                  
                  d3.select(this).attr("d", createPath(rayon, 1, creeHexagone(rayon), distance, id2Chif(d3.select(this).attr('id'))%nbColonnes, Math.floor(id2Chif(d3.select(this).attr('id'))/nbColonnes)));
              
                  d3.select(this).attr.zInndex = "1";// on remet au plan initial
               })
               .on("click",function(){
                  let c = d3.select(this).attr('id');
                  console.log("clické : "+c);
                  selecteCase(c);
               });
         }
      }
   }


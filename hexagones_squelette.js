
     function creeHexagone(rayon) {
        var points = new Array();
        for (var i = 0; i < 6; ++i) {
            var angle = i * Math.PI / 3;
            var x = Math.sin(angle) * rayon;
            var y = -Math.cos(angle) * rayon;
	         console.log("x="+Math.round(x*100)/100+" y="+Math.round(y*100)/100);
            points.push([Math.round(x*100)/100, Math.round(y*100)/100]);
        }
        return points;
     }
 
     function genereDamier(rayon, nbLignes, nbColonnes) {

      distance =  rayon - (Math.sin(1 * Math.PI / 3) * rayon);  // plus grande distance entre l'hexagone et le cercle circonscrit

      d3.select("#tablier").append("svg").attr("width",nbColonnes*2*rayon+rayon*nbLignes).attr("height", nbLignes*2*rayon);//largeur et auteur de la balise svg lageure +grande de (rayon/2) *nblignes
      var hexagone = creeHexagone(rayon);
      var n = 0;//nb de fois que l'on a parcouru la boucle =  nème colonne
      for (var ligne=0; ligne < nbLignes; ligne++) {
         for (var colonne=0; colonne < nbColonnes; colonne++) {
               var d = "";
               var x, y;
               
               for (h in hexagone) {
                  x = (hexagone[h][0]+(rayon-distance)*(2+2*colonne))+(rayon -distance) *n;
                  y = distance*2 + hexagone[h][1]+(rayon-distance*2)*(1+2.05*ligne);
                  if(h == 0){
                     d+="M"+x+","+y+" L";//on ajoute n*le rayon pour decaller les hexa
                  }else{
                     d+=x+","+y+" ";
                  }
                  
                  
               }
               d += "Z";
                      
      
               d3.select("svg").append("path")
                  .attr("d", d)
                  .style("stroke", "black")
                  .style("fill", "none")
                  .style("stroke−width",5)
                  .attr("id", "h"+(ligne*11+colonne)) // car un id doit commencer par une lettre
                  .on("click",  (event) => console.log("cliqué")
                     //console.log(d3.select(this).attr('id'));
                     //d3.select(this).attr('fill', 'red');
                  );
            }
            n+=1;
       }
    }


setInterval('updateClock()', 1000 );
function updateClock ( ){
  var currentTime = new Date ( );
  var currentHours = currentTime.getHours ( );
  var currentMinutes = currentTime.getMinutes ( );
  var currentSeconds = currentTime.getSeconds ( );
  // Pad the minutes and seconds with leading zeros, if required
  currentMinutes = ( currentMinutes < 10 ? "0" : "" ) + currentMinutes;
  currentSeconds = ( currentSeconds < 10 ? "0" : "" ) + currentSeconds;
  // Choose either "AM" or "PM" as appropriate
  var timeOfDay = ( currentHours < 12 ) ? "AM" : "PM";
  // Convert the hours component to 12-hour format if needed
  currentHours = ( currentHours > 12 ) ? currentHours - 12 : currentHours;
  // Convert an hours component of "0" to "12"
  currentHours = ( currentHours == 0 ) ? 12 : currentHours;
	if(currentHours==12){ currentHours=0;} 
	if(currentHours==0){currentHours2=12;}else{currentHours2=currentHours;}
  // Compose the string for display
  var currentTimeString = currentHours2 + ":" + currentMinutes + " " + timeOfDay;
  var part1="";
  var part2="";
  var part3="";
  var suma=1;
  if((currentMinutes=='00')||(currentMinutes=='01')||(currentMinutes=='02')||(currentMinutes=='03')||(currentMinutes=='04')||(currentMinutes=='05')){ var suma=0; }
	switch(currentMinutes){
		case '00':
			if(currentHours==1){ var part1="La "; }else{ var part1="Les "; }
			var part3=" en punt";
		break;
		case '01':
			if(currentHours==1){ var part1="La "; }else{ var part1="Les "; }
			if(currentHours==1){ var part3=" tocada"; }else{ var part3=" tocades"; }
		break;
		case '02':
			if(currentHours==1){ var part1="La "; }else{ var part1="Les "; }
			if(currentHours==1){ var part3=" ben tocada"; }else{ var part3=" ben tocades"; }
		break;
		case '03':
			var part1="Passen tres minuts ";
		break;
		case '04':
			var part1="Passen gairebé cinc minuts ";
		break;
		case '05':
			var part1="Passen cinc minuts ";
		break;
		case '06':
			var part1="Gairebé mig quart ";
		break;
		case '07':
			var part1="Mig quart ";
		break;
		case '08':
			var part1="Mig quart ";
		break;	
		case '09':
			var part1="Gairebé cinc minuts per un quart ";
		break;	
		case '10':
			var part1="Cinc minuts per un quart ";
		break;
		case '11':
			var part1="Quatre minuts per un quart ";
		break;
		case '12':
			var part1="Tres minuts per un quart ";
		break;
		case '13':
			var part1="Dos minuts per un quart ";
		break;
		case '14':
			var part1="Gairebé un quart ";
		break;
		case '15':
			var part1="Un quart ";
		break;
		case '16':
			var part1="Un quart ";
			var part3=" tocat";
		break;
		case '17':
			var part1="Un quart ";
			var part3=" ben tocat";
		break;	
		case '18':
			var part1="Dos minuts per un quart i cinc ";
		break;
		case '19':
			var part1="Gairebé un quart i cinc ";
		break;
		case '20':
			var part1="Un quart i cinc ";
		break;
		case '21':
			var part1="Gairebé un quart i mig ";
		break;
		case '22':
			var part1="Un quart i mig ";
		break;
		case '23':
			var part1="Un quart i mig ";
		break;
		case '24':
			var part1="Gairebé cinc minuts per dos quarts ";
		break;
		case '25':
			var part1="Cinc minuts per dos quarts ";
		break;
		case '26':
			var part1="Quatre minuts per dos quarts ";
		break;
		case '27':
			var part1="Tres minuts per dos quarts ";
		break;
		case '28':
			var part1="Dos minuts per dos quarts ";
		break;
		case '29':
			var part1="Gairebé dos quarts ";
		break;
		case '30':
			var part1 = "Dos quarts ";
		break;
		case '31':
			var part1 = "Dos quarts ";
			var part2 = " tocats";
		break;
		case '32':
			var part1 = "Dos quarts ";
			var part2 = " ben tocats";
		break;
		case '33':
			var part1 = "Dos minuts per dos quarts i cinc ";
		break;
		case '34':
			var part1 = "Un minut per dos quarts i cinc ";
		break;
		case '35':
			var part1 = "Dos quarts i cinc ";
		break;
		case '36':
			var part1 = "Gairebé dos quarts i mig ";
		break;
		case '37':
			var part1 = "Dos quarts i mig ";
		break;
		case '38':
			var part1 = "Dos quarts i mig ";
		break;
		case '39':
			var part1 = "Gairebé cinc minuts per tres quarts";
		break;
		case '40':
			var part1 = "Cinc minuts per tres quarts";
		break;
		case '41':
			var part1 = "Quatre minuts per tres quarts ";
		break;
		case '42':
			var part1 = "Tres minuts per tres quarts ";
		break;
		case '43':
			var part1 = "Dos minuts per tres quarts ";
		break;
		case '44':
			var part1 = "Gairebé tres quarts ";
		break;
		case '45':
			var part1 = "Tres quarts ";
		break;
		case '46':
			var part1 = "Tres quarts ";
			var part3 = " tocats";
		break;
		case '47':
			var part1 = "Tres quarts ";
			var part3 = " ben tocats";
		break;
		case '48':
			var part1 = "Dos minuts per tres quarts i cinc ";
		break;
		case '49':
			var part1 = "Un minut per tres quarts i cinc ";
		break;
		case '50':
			var part1 = "Tres quarts i cinc ";
		break;
		case '51':
			var part1="Gairebé tres quarts i mig ";
		break;
		case '52':
			var part1="Tres quarts i mig ";
		break;
		case '53':
			var part1="Tres quarts i mig ";
		break;
		case '54':
			var part1="Gairebé cinc minuts per ";
			if(currentHours+1==1){ var part1=part1+" la "; }else{ var part1=part1+" les "; }
			var part3=" en punt";
		break;
		case '55':
			var part1="Cinc minuts per ";
			if(currentHours+1==1){ var part1=part1+" la "; }else{ var part1=part1+" les "; }
			var part3=" en punt";
		break;
		case '56':
			var part1="Quatre per ";
			if(currentHours+1==1){ var part1=part1+" la "; }else{ var part1=part1+" les "; }
			var part3=" en punt";
		break;
		case '57':
			var part1="Tres minuts per ";
			if(currentHours+1==1){ var part1=part1+" la "; }else{ var part1=part1+" les "; }
			var part3=" en punt";
		break;
		case '58':
			var part1="Dos minuts per ";
			if(currentHours+1==1){ var part1=part1+" la "; }else{ var part1=part1+" les "; }
			var part3=" en punt";
		break;
		case '59':
			var part1="Un minut per ";
			if(currentHours+1==1){ var part1=part1+" la "; }else{ var part1=part1+" les "; }
			var part3=" en punt";
		break;
		default:
		break;
	}
	if((currentMinutes=='54')||(currentMinutes=='55')||(currentMinutes=='56')||(currentMinutes=='57')||(currentMinutes=='58')||(currentMinutes=='59')||(currentMinutes=='00')||(currentMinutes=='01')||(currentMinutes=='02')){
	}else{
		if((currentMinutes=='03')||(currentMinutes=='04')||(currentMinutes=='05')){
			if((currentHours==1)||(currentHours==11)){ part1 = part1+" d'"; }else{ part1 = part1+" de "; }
		}else{
			if((currentHours+1==1)||(currentHours+1==11)){ part1 = part1+" d'"; }else{ part1 = part1+" de "; }
		}
	}
		var part2 = currentHours+suma;
		switch(part2){
			case 0:
				part2 = "dotze";
			break;
			case 1:
				part2 = "una";
			break;
			case 2:
				part2 = "dues";
			break;
			case 3:
				part2 = "tres";
			break;
			case 4:
				part2 = "quatre";
			break;
			case 5:
				part2 = "cinc";
			break;
			case 6:
				part2 = "sis";
			break;
			case 7:
				part2 = "set";
			break;
			case 8:
				part2 = "vuit";
			break;
			case 9:
				part2 = "nou";
			break;
			case 10:
				part2 = "deu";
			break;
			case 11:
				part2 = "onze";
			break;
			case 12:
				part2 = "dotze";
			break;
			default:
		break;
		}
  // Update the time display
  document.getElementById("clock1").firstChild.nodeValue = currentTimeString;
  document.getElementById("clock2").firstChild.nodeValue = part1+part2+part3;
}
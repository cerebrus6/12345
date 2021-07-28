let add1 = $("#content").append("<div id='hand1'></div>");
let add2 = $("#content").append("<div id='hand2'></div>");
let add3 = $("#content").append("<div id='guideBox'><span>1 2 3 4 5</span></div>");

// Show to disable all events
$("#transparentDiv").hide();

var player1 = 0, player2 = 1;
var actions = {
// Input array, Output shuffled array
	shuffle: function(arr) {
		let shuffledArr = [], i, temp = [...arr];
		for(i=0;i<arr.length;i++) {
			let chosen;
			do {chosen = Math.floor(Math.random()*temp.length);} while(temp[chosen]==0);
			shuffledArr[i] = game.remove(temp[chosen], temp);
		}
		return shuffledArr;
	},
// Input Number and jQuery address, Action append a div with the Number to the address
	print: function(number, address) {
		$(address).append("<div class='cards'>".concat(number, "</div>"));
	},
	// parameter (hand, time, true) to conceal into "?"
	// parameter (hand, time, false, array) to randomize
	conceal: function(hand, time, orig, arr) {
		setTimeout(function(){
			actions.shuffleFlourish(hand, 0, orig, arr);
			setTimeout(function() {
				$(hand.concat(" .cards")).css("transform", "rotateY(180deg)")
			}, 900);
			setTimeout(function() {
				$(hand.concat(" .cards")).css({"transition":"color, transform 0.8s", "transform":"rotateY(360deg)"});
			}, 1000);
		}, time);
	},
// Auxilliary to conceal
	shuffleFlourish: function(hand, delay=0, orig=false, arr=null) {
		setTimeout(function(){
			let handss = $(hand.concat(" .cards")), i, newShuffle;
			for(i=0;i<5;i++) {
				newShuffle = new ShuffleText(handss[i], orig, i, arr);
				newShuffle.start(i);
			}
		}, delay);
	},
// Input hand id selector, array/number to print, delay
	write: function(hand, arr, time=0) {
		setTimeout(function() {
			for(let i=0;i<hand.length;i++){
				let toWrite = Array.isArray(arr)?arr[i]:arr;
				$(hand.concat(" .cards")).eq(i).text(toWrite);
			}
		}, time);
	},
// Input clicked card, Action add/remove the corresponding classes
	nextTurn: function(e) {
		let chosenCard = $(e.currentTarget);
		let fightButton = chosenCard.next();
		if(chosenCard.parent().attr("id")==game.turn&&chosenCard.attr("class")!="cards used") {
			chosenCard.toggleClass("active");
			chosenCard.siblings().removeClass("active");
			if(chosenCard.attr("class")=="cards active") {
				chosenCard.next().addClass("active");
				chosenCard.next().attr("disabled", false);
			} else {
				chosenCard.next("button").attr("disabled", true);
			}
		}
	}, 
// Action change turn, initiate AI turn, determine round winner and label used cards
	fight: function() {
	    $("#transparentDiv").show();
		$("button.active").attr("disabled", true);
		if(game.turn=="hand1") 	{game.turn="hand2";} 
		else 					{game.turn="hand1";}
		if(game.ai==true&&game.turn=="hand1") {
			guide.thinking(function() {
				let handChoice;
				do {
					handChoice = Math.floor(Math.random()*$("#hand1 .cards").length);
				} while ($("#hand1 .cards").eq(handChoice).attr("class")=="cards used"||game.hands[player2][handChoice]==0);
				handChoice = $("#hand1 .cards").eq(handChoice)
				setTimeout(function() {
					handChoice.trigger("click");
					$("button.active").attr("disabled", true);
					setTimeout(function() {
						$("button.active").attr("disabled", false);
						handChoice.next().trigger("click");
					}, 2000);
				}, 1000);
			});
		}
		if (game.playedCard[0]!=-1&&game.playedCard[1]!=-1) {
			game.round+=1;
			actions.flip(game.playedCard[0],game.hands[player2][game.playedCard[0]]);
			guide.declare(
				game.play(	game.hands[player2][game.playedCard[0]], 
							game.hands[player1][game.playedCard[1]]));
			game.playedCard[0] = -1;
			game.playedCard[1] = -1;
			$(".active").addClass("used");
			$(".active").removeClass("active");
		}
	},
// Action animate flip reveal
	flip: function(address, text) {
		$("#hand1 .cards").eq(address).css({"transition":"none", "transform":"rotateY(180deg)"});
		setTimeout(function() {
			$("#hand1 .cards").eq(address).css({"transition":"transform 1s", "transform":"rotateY(360deg)"});
			setTimeout(function() {
				$("#hand1 .cards").eq(address).text(text);
			}, 200);
		}, 30);
	}
}

// Guidebox
var guide = {
	guideBox: $("#guideBox"),
// Action animate thinking and call the callback function parameter after the animation
	thinking: function(callback, times=4*3, speed=170) {
	guide.guideBox.children("span").css("color", "black")
		let text = ["Thinking", "Thinking.", "Thinking..", "Thinking..."];
		let count = 0;
		let think = setInterval(function() {
			count++;
			guide.guideBox.children("span").text(text[count%4]);
			if(count==times) {
				clearInterval(think);
			}
		}, speed);
		setTimeout(()=>{callback.call();guide.guideBox.children("span").text("")}, speed*12);
	},
// Action write the round result in the guidebox
	declare: function(winner="Hello", time=750) {
		$("#score1").text(game.score[player1]);
		$("#score2").text(game.score[player2]);
		this.guideBox.children("span").text(winner);
		if(!(game.round!=5 && game.score[player2]!=3 && game.score[player1]!=3)) {
			if(game.score[player1]==3&&game.score[player2]!=3) {
				this.guideBox.children("span").text("Player 1 wins the game");
			} else if(game.score[player2]==3&&game.score[player1]!=3) {
				this.guideBox.children("span").text("Player 2 wins the game");
			} else {
				this.guideBox.children("span").text("The game ends in a tie");
			}
			$("#transparentDiv, #playAgain").show();
		}
		setTimeout(function() {
			if(game.round!=5&&(game.score[player2]!=3&&game.score[player1]!=3)) {
				guide.guideBox.children("span").css("color", "white")
				$("#transparentDiv").hide();
			}
		}, time);
	}
}

// Initial Values
var game = {
	score: [0,0,0],
	turn: "hand2",
	round: 0,
	playedCard: [-1,-1],
	ai: true,
	hands: [[1,2,3,4,5], [1,2,3,4,5]],
// Input number and array, Action change the number in the array to 0, Output number
	remove: function(number, arr) {
		let index = arr.indexOf(number);
		let card = number;
		(index>-1) ? arr[index]=0 : false;
		return card;
	},
// Input number1 and number2, Action check which is greater, Output return declaration string
	play: function(p1,p2) {
			p1 = this.remove(p1, this.hands[player2]);
			p2 = this.remove(p2, this.hands[player1]);
		if(p1>p2) {
			this.score[player2]+=1;
			if(this.score[player2]!=3)
				return "Player 2 wins the round";
			else
				return "Player 2 wins the game";
		} else if(p1<p2) {
			this.score[player1]+=1;
			if(this.score[player1]!=3)
				return "Player 1 wins the round";
			else
				return "Player 1 wins the game";
		} else {
			this.score[2]+=1;
			if(game.round!=5)
				return "It is a tie";
			else
				return "The game ends with a tie";
		}
	},
// Resets values
	newGame: function() {
		$("#playAgain").hide();
		$("#score1,#score2").text(0);
		game.round=0;
		game.score=[0,0];
		game.hands=[[1,2,3,4,5], [1,2,3,4,5]];
		// Print
		for(let i=0;i<10;i++) {
			let hand = Math.floor(i/5);
			actions.print(game.hands[hand][i%5], "#hand".concat(hand+1));
		}
		for(let i=1;i<=10;i++) {
			$("#hand".concat(Math.ceil(i/5)," .cards")).eq((i-1)%5).after("<button class='fight' onclick='actions.fight()' disabled>Fight</button>");
		}
		actions.conceal("#hand1",600,true);
		game.hands[player2]=actions.shuffle(game.hands[player2]);
		actions.conceal("#hand2",600,false,game.hands[player1]=actions.shuffle(game.hands[player1]));
		$(".cards").off();
		$(".used").removeClass("used");
		$(".cards").on("click", function(e) {
				game.playedCard[parseInt(game.turn[4])-1]=($(e.currentTarget).index())/2;
				actions.nextTurn(e);
		console.log(game.round)
		console.log(game.score[player2])
		console.log(game.score[player1])
		});
	}
}

$("#transparentDiv").click(function(e) {
    // stop propagation and prevent default by returning false
    return false;
});

$("#playAgain").on("click", function() {
	game.newGame();
});

// Game Start
game.newGame();
//This is where I declare/define my various fields(selectors) to make the pieces of my game
const selectors = {
    boardContainer: document.querySelector('.board-container'),
    board: document.querySelector('.board'),
    moves: document.querySelector('.moves'),
    timer: document.querySelector('.timer'),
    start: document.querySelector('button'),
    win: document.querySelector('.win')
}

// The state of the game will keep track of different values
const state = {
    gameStarted: false, //checks if game has started
    flippedCards: 0, // used to keep track of the number of flips
    totalFlips: 0, // keep track of the total number of flips
    totalTime: 0, // keeps track of the time since game started
    loop: null // will update the timer every second
}

const shuffle = array => {
    const clonedArray = [...array]

    // let index = the length of the clonedArray minus 1; if index is greater than 0; index will decrement each time
    //so when you match a card, it will decrease the number of cards remaining.
    for (let index = clonedArray.length - 1; index > 0; index--) {

        //Math.floor rounds the float down to nearest integer to keep from fractional array elements. Creates a random index since javascript arrays are zero-indexed beginning at zero.
        const randomIndex = Math.floor(Math.random() * (index + 1))

        // Math.floor and math.random allow a random element to be used from an array
        const original = clonedArray[index]

        clonedArray[index] = clonedArray[randomIndex] // stores the original index value in a variable to prevent overwriting
        clonedArray[randomIndex] = original
    }

    return clonedArray // will return a descending 'for' loop created by a random index using Math.random and Math.floor
}

// Random arrays 
const pickRandom = (array, items) => {
    //pickRandom loops through the passed array and gets an item from it at a random position and returns the "randomPicks" at the end of the function passing it to the "shuffle" function
    /**
     * -- To shuffle an array a of n elements (indices 0..n-1):
for i from n−1 downto 1 do
   j ← random integer such that 0 ≤ j ≤ i
   exchange a[j] and a[i]
     */
    //allows the array to be iterated over and expanded in places where zero or more arguments or elements are expected
    const clonedArray = [...array] 
    const randomPicks = []

    for (let index = 0; index < items; index++) {
        const randomIndex = Math.floor(Math.random() * clonedArray.length)
        
        randomPicks.push(clonedArray[randomIndex])
        clonedArray.splice(randomIndex, 1)
    }

    return randomPicks
}

// create a function to generate the board 
const generateGame = () => {
    const dimensions = selectors.board.getAttribute('data-dimension')

    // passing an even number into the dimension using a remainder(modulo)
    if (dimensions % 2 !== 0) {
        throw new Error("The dimension of the board must be an even number.")
    }

    // generate an array of random emojis
    const emojis = ['🥔', '🍒', '🥑', '🌽', '🥕', '🍇', '🍉', '🍌', '🥭', '🍍', '🎃', '💥', '🦇', '💀', '😱', '🕷️', '👻', '👺', '🎇', '✨']
    const picks = pickRandom(emojis, (dimensions * dimensions) / 2)  // picks half the items of dimensions
    const items = shuffle([...picks, ...picks]) //making sure that get two pairs for each emoji for shuffling, order will be random each time the page is reloaded
    const cards = `
        <div class="board" style="grid-template-columns: repeat(${dimensions}, auto)">
            ${items.map(item => `
                <div class="card">
                    <div class="card-front"></div>
                    <div class="card-back">${item}</div>
                </div>
            `).join('')}
       </div>
    `
    
    const parser = new DOMParser().parseFromString(cards, 'text/html')
    // creates/formats a runtime environment. Used to rep input data from source code as a data structure so it can be checked for syntax

    selectors.board.replaceWith(parser.querySelector('.board'))
}

//Starting the Game
const startGame = () => {
    state.gameStarted = true // tells if the game is running
    selectors.start.classList.add('disabled') // disables the "start" button to prevent starting game over and over after game has begun

    state.loop = setInterval(() => { // runs every second to update with the total number of flips and elapsed time.
        state.totalTime++

        selectors.moves.innerText = `${state.totalFlips} moves`
        selectors.timer.innerText = `time: ${state.totalTime} sec`
    }, 1000)
}

// Flipping The Cards
const backCardFlip = () => {
    document.querySelectorAll('.card:not(.matched)').forEach(card => {
        card.classList.remove('flipped')
    })

    state.flippedCards = 0 // all the card that are not matched, removes .flipped class  sets the flippedCards back to 0 to continue flipping two cards at a time
}

// Updating the "state" of the game, everytime a card is flipped, increment both the cardsFlipped and totalFlips
const cardFlip = card => {
    state.flippedCards++
    state.totalFlips++

    // check to see if game has already started; if not, call the startGame function
    if (!state.gameStarted) {
        startGame()
    }

    // check if cardsFlipped is less than or equal to 2 to keep player from flipping over more than 2 cards at a time.
    if (state.flippedCards <= 2) {
        card.classList.add('flipped')
    }

    if (state.flippedCards === 2) {
        const flippedCards = document.querySelectorAll('.flipped:not(.matched)')

        if (flippedCards[0].innerText === flippedCards[1].innerText) {
            flippedCards[0].classList.add('matched')
            flippedCards[1].classList.add('matched')
        }

        setTimeout(() => {
            backCardFlip()
        }, 1000)
    }

    // If there are no more cards that we can flip, we won the game
    if (!document.querySelectorAll('.card:not(.flipped)').length) {
        setTimeout(() => {
            // checks if all cards have been flipped; no more cards to be flipped means game is complete
            selectors.boardContainer.classList.add('flipped') // check if .flipped cards are a match/no match
            // check the emoji inside card against emoji inside second card; if they match class them by adding .matched
            selectors.win.innerHTML = `
                <span class="win-text">
                    You won!<br />
                    with <span class="highlight">${state.totalFlips}</span> moves<br />
                    under <span class="highlight">${state.totalTime}</span> seconds
                </span>
            `

            clearInterval(state.loop)
        }, 1000)
    }
}

//Adding Event Listeners directly on the cards
const attachEventListeners = () => {
    document.addEventListener('click', event => {
        const eventTarget = event.target
        const eventParent = eventTarget.parentElement

        if (eventTarget.className.includes('card') && !eventParent.className.includes('flipped')) {
            cardFlip(eventParent)
        } else if (eventTarget.nodeName === 'BUTTON' && !eventTarget.className.includes('disabled')) {
            startGame()
        }
    })
}

generateGame()
attachEventListeners()


const rand = function(min, max) {
    return Math.random() * ( max - min ) + min;
  }
  
  let canvas = document.getElementById('canvas');
  let ctx = canvas.getContext('2d');
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext('2d');
    ctx.globalCompositeOperation = 'lighter';
  });
  let backgroundColors = [ '#000', '#000' ];
  let colors = [
    [ '#002aff', "#009ff2" ],
    [ '#0054ff', '#27e49b' ], 
    [ '#202bc5' ,'#873dcc' ]
  ];
  let count = 70;
  let blur = [ 12, 70 ];
  let radius = [ 1, 120 ];
  
  ctx.clearRect( 0, 0, canvas.width, canvas.height );
  ctx.globalCompositeOperation = 'lighter';
  
  let grd = ctx.createLinearGradient(0, canvas.height, canvas.width, 0);
  grd.addColorStop(0, backgroundColors[0]);
  grd.addColorStop(1, backgroundColors[1]);
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  let items = [];
  
  while(count--) {
      let thisRadius = rand( radius[0], radius[1] );
      let thisBlur = rand( blur[0], blur[1] );
      let x = rand( -100, canvas.width + 100 );
      let y = rand( -100, canvas.height + 100 );
      let colorIndex = Math.floor(rand(0, 299) / 100);
      let colorOne = colors[colorIndex][0];
      let colorTwo = colors[colorIndex][1];
      
      ctx.beginPath();
      ctx.filter = `blur(${thisBlur}px)`;
      let grd = ctx.createLinearGradient(x - thisRadius / 2, y - thisRadius / 2, x + thisRadius, y + thisRadius);
    
      grd.addColorStop(0, colorOne);
      grd.addColorStop(1, colorTwo);
      ctx.fillStyle = grd;
      ctx.fill();
      ctx.arc( x, y, thisRadius, 0, Math.PI * 2 );
      ctx.closePath();
      
      let directionX = Math.round(rand(-99, 99) / 100);
      let directionY = Math.round(rand(-99, 99) / 100);
    
      items.push({
        x: x,
        y: y,
        blur: thisBlur,
        radius: thisRadius,
        initialXDirection: directionX,
        initialYDirection: directionY,
        initialBlurDirection: directionX,
        colorOne: colorOne,
        colorTwo: colorTwo,
        gradient: [ x - thisRadius / 2, y - thisRadius / 2, x + thisRadius, y + thisRadius ],
      });
  }
  
  
  function changeCanvas(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let adjX = 2;
    let adjY = 2;
    let adjBlur = 1;
    items.forEach(function(item) {
      
        if(item.x + (item.initialXDirection * adjX) >= canvas.width && item.initialXDirection !== 0 || item.x + (item.initialXDirection * adjX) <= 0 && item.initialXDirection !== 0) {
          item.initialXDirection = item.initialXDirection * -1;
        }
        if(item.y + (item.initialYDirection * adjY) >= canvas.height && item.initialYDirection !== 0 || item.y + (item.initialYDirection * adjY) <= 0 && item.initialYDirection !== 0) {
          item.initialYDirection = item.initialYDirection * -1;
        }
        
        if(item.blur + (item.initialBlurDirection * adjBlur) >= radius[1] && item.initialBlurDirection !== 0 || item.blur + (item.initialBlurDirection * adjBlur) <= radius[0] && item.initialBlurDirection !== 0) {
          item.initialBlurDirection *= -1;
        }
      
        item.x += (item.initialXDirection * adjX);
        item.y += (item.initialYDirection * adjY);
        item.blur += (item.initialBlurDirection * adjBlur);
        ctx.beginPath();
        ctx.filter = `blur(${item.blur}px)`;
        let grd = ctx.createLinearGradient(item.gradient[0], item.gradient[1], item.gradient[2], item.gradient[3]);
        grd.addColorStop(0, item.colorOne);
        grd.addColorStop(1, item.colorTwo);
        ctx.fillStyle = grd;
        ctx.arc( item.x, item.y, item.radius, 0, Math.PI * 2 );
        ctx.fill();
        ctx.closePath();
      
    });
    window.requestAnimationFrame(changeCanvas);
    
  }
  
  window.requestAnimationFrame(changeCanvas);



/*const cards = document.querySelectorAll(".card");
let matched = 0;
let cardOne, cardTwo;
let disableDeck = false;
function cardFlip({target: clickedCard}) {
    if(cardOne !== clickedCard && !disableDeck) {
        clickedCard.classList.add("flip");
        if(!cardOne) {
            return cardOne = clickedCard;
        }
        cardTwo = clickedCard;
        disableDeck = true;
        let cardOneImg = cardOne.querySelector(".back-view img").src,
        cardTwoImg = cardTwo.querySelector(".back-view img").src;
        matchCards(cardOneImg, cardTwoImg);
    }
}
function matchCards(img1, img2) {
    if(img1 === img2) {
        matched++;
        if(matched == 8) {
            setTimeout(() => {
                return shuffleCard();
            }, 1000);
        }
        cardOne.removeEventListener("click", cardFlip);
        cardTwo.removeEventListener("click", cardFlip);
        cardOne = cardTwo = "";
        return disableDeck = false;
    }
    setTimeout(() => {
        cardOne.classList.add("shake");
        cardTwo.classList.add("shake");
    }, 400);
    setTimeout(() => {
        cardOne.classList.remove("shake", "flip");
        cardTwo.classList.remove("shake", "flip");
        cardOne = cardTwo = "";
        disableDeck = false;
    }, 1200);
}
function shuffleCard() {
    matched = 0;
    disableDeck = false;
    cardOne = cardTwo = "";
    let arr = [1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8];
    arr.sort(() => Math.random() > 0.5 ? 1 : -1);
    cards.forEach((card, i) => {
        card.classList.remove("flip");
        let imgTag = card.querySelector(".back-view img");
        imgTag.src = `images/img-${arr[i]}.png`;
        card.addEventListener("click", cardFlip);
    });
}
shuffleCard();
    
cards.forEach(card => {
    card.addEventListener("click", cardFlip);
});*/

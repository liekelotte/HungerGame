//import HealthBar from 'phaser-percent-bar'

let game;
let gameOptions = {
    gemSize: 100,
    minConnected: 3, // how many same items does one need 
    boardOffset: {
        x: 600,
        y: 120
    },
    destroySpeed: 200,
    inflRate: 1,
    fallSpeed: 100,
    localStorageName: "hungergame"
}

window.onload = function() {
    let gameConfig = {
        width: 1920,
        height: 1090,
        scene: playGame,
        backgroundColor: 0x222222
    }
    game = new Phaser.Game(gameConfig);
    window.focus()
    resize();
    window.addEventListener("resize", resize, false);
}

class playGame extends Phaser.Scene{
    constructor(){
        super("PlayGame");
    }
    preload(){
        this.load.spritesheet("tiles", "assets/sprites/tiles2.png", {
            frameWidth: gameOptions.gemSize,
            frameHeight: gameOptions.gemSize
        });
        this.load.bitmapFont("font", "assets/fonts/font.png", "assets/fonts/font.fnt");
    }
    create(){
        this.sameGame = new SameGame({
            rows: 8,
            columns: 7,
            items: 4,
        });
        this.score = [0,0,0,0];
        this.addScore = [0,0,0,0];
        this.addScore = [0,0,0,0];
        this.catScore = [0,0,0,0];
        this.balance = this.sameGame.getBalance();
        this.moneyOut = false;
        this.categories = ['fruit','veg','dairy','protein'];
        this.sameGame.generateBoard();
        this.drawField();
        this.canPick = true;
        this.input.on("pointerdown", this.tileSelect, this)
        //this.scoreText = this.add.bitmapText(20, 20, "font", "ccc", 40);
        this.basket             = this.add.bitmapText(20, 20, "font", "bought", 40);
        this.scoreTextFruit     = this.add.bitmapText(20, 70, "font", "ccc", 40);
        this.scoreTextVeg       = this.add.bitmapText(20, 120, "font", "ddd", 40);
        this.scoreTextDairy     = this.add.bitmapText(20, 170, "font", "eee", 40);
        this.scoreTextProtein   = this.add.bitmapText(20, 220, "font", "fff", 40);
        this.balanceText        = this.add.bitmapText(game.config.width - 700, 20, "font", "ggg", 60)
        this.gameText           = this.add.bitmapText(game.config.width / 2, game.config.height - 60, "font", "hunger game", 40)
        this.gameText.setOrigin(0.5, 0.5);
        this.updateScore();
        this.updateBalance();

        //this.savedData = localStorage.getItem(gameOptions.localStorageName) == null ? {
        //    score: 0
        //} : JSON.parse(localStorage.getItem(gameOptions.localStorageName));
        //let bestScoreText = this.add.bitmapText(game.config.width - 20, 20, "font", "Balance: " + this.savedData.score.toString(), 60);
        //bestScoreText.setOrigin(1, 0);
    }
    updateScore(){
        this.scoreTextFruit.text    = this.categories[0] + ": " + this.score[0].toString();
        this.scoreTextVeg.text      = this.categories[1] + ": " + this.score[1].toString();
        this.scoreTextDairy.text    = this.categories[2] + ": " + this.score[2].toString();
        this.scoreTextProtein.text  = this.categories[3] + ": " + this.score[3].toString();
    }

    updateBalance(){
        let newBalance = gameOptions.inflRate * (this.balance - (this.score.reduce((a, b) => a + b, 0)));
        this.balanceText.text = "Balance: " + newBalance.toString();
        if(newBalance<10){
            this.balanceText.tint = 0xB22222; 
        }
        if(newBalance<0){
            this.balanceText.text = "Balance: 0";
        }
        if(this.catScore.reduce((a, b) => a + b, 0) > newBalance) {
            this.moneyOut = true; //let this check if newbalance is smaller than the number of items clicked on
        }
    }

    endOfTrial(){
        if(this.moneyOut){
            this.gameText.text = "You ran out of money...";
            this.canPick = false;
        }
        // else{
        //     let bestScore = Math.max(this.score, this.savedData.score);
        //     localStorage.setItem(gameOptions.localStorageName,JSON.stringify({
        //         score: bestScore
        //     }));
        //     let timedEvent =  this.time.addEvent({
        //         delay: 7000,
        //         callbackScope: this,
        //         callback: function(){
        //             this.scene.start("PlayGame");
        //         }
        //     });
        //     if(this.sameGame.nonEmptyItems() == 0){
        //         this.gameText.text = "Congratulations!!";
        //     }
        //     else{
        //     }
        // }
    }
    // adds two arrays to each other to update the colour specific scores
    arraySum(array1, array2) {
        var squares = array1.map((a, i) => a + array2[i]);
        return squares;
    }

    drawField(){
        this.poolArray = [];
        for(let i = 0; i < this.sameGame.getRows(); i ++){
            for(let j = 0; j < this.sameGame.getColumns(); j ++){
                let mon = this.moneyOut;
                let gemX = gameOptions.boardOffset.x + gameOptions.gemSize * j + gameOptions.gemSize / 2;
                let gemY = gameOptions.boardOffset.y + gameOptions.gemSize * i + gameOptions.gemSize / 2
                let gem = this.add.sprite(gemX, gemY, "tiles", this.sameGame.getValueAt(i, j, mon));
                this.sameGame.setCustomData(i, j, gem);
            }
        }
    }
    tileSelect(pointer){
        if(this.canPick){
            let row = Math.floor((pointer.y - gameOptions.boardOffset.y) / gameOptions.gemSize);
            let col = Math.floor((pointer.x - gameOptions.boardOffset.x) / gameOptions.gemSize);
            let mon = this.moneyOut
            if(this.sameGame.validPick(row, col, mon)){
                //let connectedItems = this.sameGame.countConnectedItems(row,col)
                if(this.sameGame.countConnectedItems(row, col,mon) >= gameOptions.minConnected){
                    let catScore = this.sameGame.addColorScore(row,col,mon);
                    this.score = this.arraySum(catScore, this.score);
                    this.updateScore();
                    this.updateBalance();
                    this.endOfTrial();
                    this.canPick = false;
                    let gemsToRemove = this.sameGame.listConnectedItems(row, col, mon);
                    let destroyed = 0;
                    gemsToRemove.forEach(function(gem){
                        destroyed ++;
                        this.poolArray.push(this.sameGame.getCustomDataAt(gem.row, gem.column))
                        this.tweens.add({
                            targets: this.sameGame.getCustomDataAt(gem.row, gem.column),
                            alpha: 0,
                            duration: gameOptions.destroySpeed,
                            callbackScope: this,
                            onComplete: function(){
                                destroyed --;
                                if(destroyed == 0){
                                    this.sameGame.removeConnectedItems(row, col, mon)
                                    this.makeGemsFall();
                                }
                            }
                        });
                    }.bind(this))
                }
            }
        }
    }
    makeGemsFall(){
        let fallingGems = 0;
        let movements = this.sameGame.arrangeBoard();
        let replenishMovements = this.sameGame.replenishBoard();
        movements.forEach(function(movement){
            fallingGems ++;
            this.tweens.add({
                targets: this.sameGame.getCustomDataAt(movement.row, movement.column),
                y: this.sameGame.getCustomDataAt(movement.row, movement.column).y + gameOptions.gemSize * movement.deltaRow,
                duration: gameOptions.fallSpeed * movement.deltaRow,
                callbackScope: this,
                onComplete: function(){
                    fallingGems --;
                    if(fallingGems == 0){
                        this.canPick = true
                    }
                }
            })
        }.bind(this))
        replenishMovements.forEach(function(movement){
            fallingGems ++;
            let sprite = this.poolArray.pop();
            let mon = this.moneyOut;
            sprite.alpha = 1;
            sprite.y = gameOptions.boardOffset.y + gameOptions.gemSize * (movement.row - movement.deltaRow + 1) - gameOptions.gemSize / 2;
            sprite.x = gameOptions.boardOffset.x + gameOptions.gemSize * movement.column + gameOptions.gemSize / 2,
            sprite.setFrame(this.sameGame.getValueAt(movement.row, movement.column, mon));
            this.sameGame.setCustomData(movement.row, movement.column, sprite);
            this.tweens.add({
                targets: sprite,
                y: gameOptions.boardOffset.y + gameOptions.gemSize * movement.row + gameOptions.gemSize / 2,
                duration: gameOptions.fallSpeed * movement.deltaRow,
                callbackScope: this,
                onComplete: function(){
                    fallingGems --;
                    if(fallingGems == 0){
                        this.canPick = true
                    }
                }
            });
        }.bind(this))
    }
    
}

class SameGame{

    // constructor, simply turns obj information into class properties
    constructor(obj){
        this.rows = obj.rows;
        this.columns = obj.columns;
        this.items = obj.items;
    }

    // generates the game board
    generateBoard(){
        this.gameArray = [];
        for(let i = 0; i < this.rows; i ++){
            this.gameArray[i] = [];
            for(let j = 0; j < this.columns; j ++){
                let randomValue = Math.floor(Math.random() * this.items);
                this.gameArray[i][j] = {
                    value: randomValue,
                    isEmpty: false,
                    row: i,
                    column: j
                }
            }
        }
    }

    getBalance(){
        return 20;
    }

    // returns the number of board rows
    getRows(){
        return this.rows;
    }

    // returns the number of board columns
    getColumns(){
        return this.columns;
    }

    // returns true if the item at (row, column) is empty
    isEmpty(row, column){
        return this.gameArray[row][column].isEmpty;
    }

    // returns the value of the item at (row, column), or false if it's not a valid pick
    getValueAt(row, column, moneyout){
        if(!this.validPick(row, column, moneyout)){
            return false;
        }
        return this.gameArray[row][column].value;
    }

    // returns the custom data of the item at (row, column)
    getCustomDataAt(row, column){
        return this.gameArray[row][column].customData;
    }

    // returns true if the item at (row, column) is a valid pick
    validPick(row, column, moneyout){
        if (moneyout){
            return false;
        }
        else {
            return row >= 0 && row < this.rows && column >= 0 && column < this.columns && this.gameArray[row] != undefined && this.gameArray[row][column] != undefined;
        }
    }

    // sets a custom data on the item at (row, column)
    setCustomData(row, column, customData){
        this.gameArray[row][column].customData = customData;
    }

    // returns an object with all connected items starting at (row, column)
    listConnectedItems(row, column, moneyout){
        if(!this.validPick(row, column, moneyout) || this.gameArray[row][column].isEmpty){
            return;
        }
        this.colorToLookFor = this.gameArray[row][column].value;
        this.floodFillArray = [];
        this.floodFillArray.length = 0;
        this.floodFill(row, column, moneyout);
        return this.floodFillArray;
    }

    addColorScore(row, column, moneyout){
        if(!this.validPick(row, column, moneyout) || this.gameArray[row][column].isEmpty){
            return;
        }
        this.colorToLookFor = this.gameArray[row][column].value;
        this.addScore = [0,0,0,0];
        this.addScore[this.colorToLookFor] = (Math.ceil(this.listConnectedItems(row, column,moneyout).length*(gameOptions.inflRate)));
        return this.addScore;
    }
    
    // returns the number of connected items starting at (row, column)
    countConnectedItems(row, column, moneyout){
        return this.listConnectedItems(row, column, moneyout).length;
    }

    // removes all connected items starting at (row, column)
    removeConnectedItems(row, column, moneyout){
        let items = this.listConnectedItems(row, column, moneyout);
        items.forEach(function(item){
            this.gameArray[item.row][item.column].isEmpty = true;
        }.bind(this))
    }

    // flood fill routine
    // http://www.emanueleferonato.com/2008/06/06/flash-flood-fill-implementation/
    floodFill(row, column, moneyout){
        if(!this.validPick(row, column, moneyout) || this.gameArray[row][column].isEmpty){
            return;
        }
        if(this.gameArray[row][column].value == this.colorToLookFor && !this.alreadyVisited(row, column)){
            this.floodFillArray.push({
                row: row,
                column: column
            });
            this.floodFill(row + 1, column, moneyout);
            this.floodFill(row - 1, column, moneyout);
            this.floodFill(row, column + 1, moneyout);
            this.floodFill(row, column - 1, moneyout);
        }
    }

    // arranges the board, making items fall down. Returns an object with movement information
    arrangeBoard(){
        let result = []
        for(let i = this.getRows() - 2; i >= 0; i --){
            for(let j = 0; j < this.getColumns(); j ++){
                let emptySpaces = this.emptySpacesBelow(i, j);
                if(!this.isEmpty(i, j) && emptySpaces > 0){
                    this.swapItems(i, j, i + emptySpaces, j)
                    result.push({
                        row: i + emptySpaces,
                        column: j,
                        deltaRow: emptySpaces
                    });
                }
            }
        }
        return result;
    }

    // replenishes the board and returns an object with movement information
    replenishBoard(){
        let result = [];
        for(let i = 0; i < this.getColumns(); i ++){
            if(this.isEmpty(0, i)){
                let emptySpaces = this.emptySpacesBelow(0, i) + 1;
                for(let j = 0; j < emptySpaces; j ++){
                    let randomValue = Math.floor(Math.random() * this.items);
                    result.push({
                        row: j,
                        column: i,
                        deltaRow: emptySpaces
                    });
                    this.gameArray[j][i].value = randomValue;
                    this.gameArray[j][i].isEmpty = false;
                }
            }
        }
        return result;
    }

    // returns the amount of empty spaces below the item at (row, column)
    emptySpacesBelow(row, column){
        let result = 0;
        if(row != this.getRows()){
            for(let i = row + 1; i < this.getRows(); i ++){
                if(this.isEmpty(i, column)){
                    result ++;
                }
            }
        }
        return result;
    }

    // swap the items at (row, column) and (row2, column2)
    swapItems(row, column, row2, column2){
        let tempObject = Object.assign(this.gameArray[row][column]);
        this.gameArray[row][column] = Object.assign(this.gameArray[row2][column2]);
        this.gameArray[row2][column2] = Object.assign(tempObject);
    }

    // returs true if in the board there is at least a move with a minimum minCombo items
    stillPlayable(minCombo, moneyout){
        for(let i = 0; i < this.getRows(); i ++){
            for(let j = 0; j < this.getColumns(); j ++){
                if(!this.isEmpty(i, j) && this.countConnectedItems(i, j, moneyout) >= minCombo){
                    return true;
                }
            }
        }
        return false;
    }

    
    // returns true if (row, column) is already in floodFillArray array
    alreadyVisited(row, column){
        let found = false;
        this.floodFillArray.forEach(function(item){
            if(item.row == row && item.column == column){
                found = true;
            }
        });
        return found;
    }

}
function resize() {
    var canvas = document.querySelector("canvas");
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    var windowRatio = windowWidth / windowHeight;
    var gameRatio = game.config.width / game.config.height;
    if(windowRatio < gameRatio){
        canvas.style.width = windowWidth + "px";
        canvas.style.height = (windowWidth / gameRatio) + "px";
    }
    else{
        canvas.style.width = (windowHeight * gameRatio) + "px";
        canvas.style.height = windowHeight + "px";
    }
}

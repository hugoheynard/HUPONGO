// GAME OBJECT CLASS
class GameObjects {
    static itemList = [];

    constructor() {
        this._id = GameObjects.generateId();
        this._type;
        this._subType;
        this._cssQuery = this.generateCssID();
        this._HTMLcode; 
        this._coordinates;
        this._width;
        this._height;
        this._collisionStatus = true;
        this._isHit;
        this._hitBy;
    }

    get id() {
        return this._id;
    }

    get type() {
        return this._type;
    }

    get subType() {
        return this._subType;
    }

    get cssQuery() {
        // mis ça à la place de this._query marche super pour racket 
        return document.getElementById(this.generateCssID());
    }

    get HTMLcode() {
        return this._HTMLcode;
    }

    set HTMLcode(newCode) {
        this._HTMLcode = newCode;
    }

    get coordinates() {
        return this._coordinates;
    }

    set coordinates(newCoordinates) {
        this._coordinates = newCoordinates;
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    get collisionStatus() {
        return this._collisionStatus;
    }

    set collisionStatus(newStatus) {
        this._collisionStatus = newStatus;
    }

    get isHit() {
        return this._isHit;
    }

    set isHit(newValue) {
        this._isHit = newValue;
    }

    get hitBy() {
        return this._hitBy;
    }

    set hitBy(newValue) {
        this._hitBy = newValue;
    }

    static generateId() {
        this.itemList.length + 1;    
    }

    generateCssID() {
        return `${this._type + '_' + this.subType}`;
    }

    static getItemList() {
        return this.itemList;    
    }

    static pushItemList(item) {
        GameObjects.itemList.push(item);
    }

    static removeItemFromList(obj) {
        this.itemList.splice(GameObjects.getItemList().indexOf(obj), 1);
    }

    display() {
        document.getElementById('terrain').innerHTML += this.HTMLcode;
    }

    unDisplay(item) {
        let element = document.getElementById(`${item.type + '_' + item.subType}`);
        element.remove();
    }
    
}

// BORDER CLASSES
class Border extends GameObjects {
    constructor() {
        super()
    }
}

class Wall extends Border { 
    constructor(x, y) {
        super()
        this._type = 'border';
        this._subType = 'wall';
        this._collisionStatus = true;
        this._coordinates = [x, y];
        this._width = 0;
        this._height = 1000; 
    }
}

class TerrainBorderLimit extends Border {
    constructor(x, y) {
        super()
        this._type = 'border';
        this._subType = 'terrain';
        this._collisionStatus = false;
        this._isHit;
        this._coordinates = [x, y];
        this._width = 1000;
        this._height = 0;
    }
}

// RACKET CLASS
class Racket extends GameObjects {
    constructor(subType){
        super()

        this._type = 'racket';
        this._subType = subType;
        this._HTMLcode = `<div id='${this.generateCssID()}' class='${this._type}'>${this._subType}</div>`;
        this._width = 160;
        this._height = 20;
        this._NUMBER_OF_SLOTS_FULL_RACKET = 20;
        this._speed = 2;
        this._coordinates = [420, this.defineRacketSide()];
    }

    get NUMBER_OF_SLOTS_FULL_RACKET() {
        return this._NUMBER_OF_SLOTS_FULL_RACKET;
    }

    get speed() {
        return this._speed;
    }

    set speed(newSpeed) {
        this._speed = newSpeed;
    }

    defineRacketSide() {//ptet des trucs à modifier sur la hauteur
        if (this.subType === 'player'){
            return  0 //+ this.height;
        } 
        return 1000 - this.height - 20;   
    }

    racketAngleArray(i) {
        /* 20 points (-10 10)sont distribués sur 20 points de touche avec un centre un peu plus gros pour tirer droit,
        pour faire ça je fais une demi rackette que je concat à son miroir.
        [[arrayX],[arraY]] -> Y se comporte à l'opposé de X pour garder une vitesse perçue constante*/
        const halfArrayX = [];
        const halfArrayY = [];
        const NUMBER_OF_SLOTS_HALF_RACKET = this.NUMBER_OF_SLOTS_FULL_RACKET / 2;
        const MAX_X_NEGATIVE_ANGLE = -9;

        const halfRacketBuilder = () => {
            for (let i = 0; i < NUMBER_OF_SLOTS_HALF_RACKET; i++) {
                halfArrayX.push(i);
                halfArrayY.push(i + 1);        
            }
        }

        const mirrorThenConcat_X = (halfArrayX) => {
            return halfArrayX.map((X) => MAX_X_NEGATIVE_ANGLE + X)
            .concat(halfArrayX);
        }

        const mirrorThenConcat_Y = (halfArrayY) => {
            return halfArrayY.concat(halfArrayY.map((Y) => halfArrayY[NUMBER_OF_SLOTS_HALF_RACKET - Y]));
        }

        halfRacketBuilder();
        const arrayX = mirrorThenConcat_X(halfArrayX);
        const arrayY = mirrorThenConcat_Y(halfArrayY);

        if (this.subType === 'player') {
            return [arrayX[i], arrayY[i]];
        } 
        return [arrayX[i], arrayY.map((Y) => Y - (Y * 2))[i]];   
    }

    racketDividerArray = () => { // incorporer le truc valeur max sur i marche pas bien
        // transforme point de contact balle en vecteur de direction retour
        const dividerArray = [];
        for (let i = 0; i < this.NUMBER_OF_SLOTS_FULL_RACKET; i++) {
            dividerArray.push(this.coordinates[0] + this.width / this.NUMBER_OF_SLOTS_FULL_RACKET * i)
            
        }
        return dividerArray;
    }

    moveLeft() {
        if (this.coordinates[0] >= 0) { 
            this.coordinates[0] -= this.speed;
        }
        this.cssQuery.style.left = this.coordinates[0] +'px';  
    }

    moveRight() {
        if (this.coordinates[0] <= 1000 - this.width){
            this._coordinates[0] += this.speed;
        }
        this.cssQuery.style.left = this.coordinates[0] +'px';   
    }

    bonusCatcher() { // console log A SUPPRIMER 
        GameObjects.getItemList().filter((item) => (item.type === 'bonus') && (item.bonusMode !== 'isStatic'))
        .forEach(item => {
            if (this.coordinates[1] >= item.coordinates[1]) {
                if ((item.coordinates[0] >= this.coordinates[0]) && (item.coordinates[0] <= (this.coordinates[0] + this.width))) {
                    item.isHit = true;
                    item.hitBy = `${this.subType}`;
                    console.log(`bonus ${item.subType} pickup catch by ${this.subType}`); 
                }
            }
        })
    }
}

// BALL CLASS
class Ball extends GameObjects {
    constructor() {
        super()

        this._type = 'ball';
        this._subType = 'main';
        this._isMoving;
        this._HTMLcode = `<div id='${this.generateCssID()}' class='${this._type}'></div>`;
        this._width = 10;
        this._coordinates = [495, 20];
        this._angle = [0, 10];
        this._velocity = 25;
        this._lastTouchedBy; 
        this._speedMode = false;
    }

    get isMoving() {
        return this._isMoving;
    }

    set isMoving(newValue) {
        this._isMoving = newValue;
    }

    get angle() {
        return this._angle;
    }

    set angle(newAngles) {
        this._angle = newAngles;
    }

    get velocity() {
        return this._velocity;
    }

    set velocity(newVelocity) {
        this._velocity = newVelocity;
    }

    get lastTouchedBy() {
        return this._lastTouchedBy;
    }

    set lastTouchedBy(newContact) {
        this._lastTouchedBy = newContact;
    }

    get speedMode() {
        return this._speedMode;
    }

    set speedMode(newValue) {
        this._speedMode = newValue;
    }

    updateX(angleX) {
        this._coordinates[0] += angleX;
        this.cssQuery.style.left = this.coordinates[0] +'px';
    }

    updateY(angleY) { 
        this.coordinates[1] += angleY;
        this.cssQuery.style.bottom = this.coordinates[1] +'px';
    }

    reverseAngleX() {
        this._angle[0] = this.angle[0] - (this.angle[0] * 2);
    }

    reverseAngleY() {
        this._angle[1] = this.angle[1] - (this.angle[1] * 2);
    }

    findBouncingAngles(racket) { // fonctionne sauf valeur max
        for (let i = 0; i < racket.racketDividerArray().length; i++) {
            let highValue;
            if (i === racket.racketDividerArray().length - 1) {
                highValue = racket.racketDividerArray()[i] + (racket.width / racket.racketDividerArray().length) + 1;
            } highValue = racket.racketDividerArray()[i] + racket.width / racket.racketDividerArray().length;
            if ((this.coordinates[0] >= racket.racketDividerArray()[i]) && (this.coordinates[0] < highValue)) {
                this.angle[0] = racket.racketAngleArray(i)[0];
                this.angle[1] = racket.racketAngleArray(i)[1];
            }
        }
    }

    collisionManager() {
        //logic : si je croise une coordonnée d'un élément de la liste, il se passe:
        GameObjects.getItemList().forEach(item => {
            if (this.coordinates[1] > item.coordinates[1] -5 && this.coordinates[1] < item.coordinates[1] + 5 + item.height) { 
                /* 
                si la rencontre se fait sur le Y bottom ou le Y top, on est sur une rencontre verticale,
                alors si la balle se trouve dans la largeur de l'objet et quil est collider, on manage la collision 
                */
                if (this.coordinates[0] >= item.coordinates[0] - 5 && this.coordinates[0] <= item.coordinates[0] + 5 + item.width) {
                    if(item.collisionStatus === false) {
                        if(item.type === 'border' && item.subType === 'terrain') {
                            if (this.coordinates[1] >= 1000) {
                                this.isMoving = false; 
                                scorePlayer ++;
                            } else if (this.coordinates[1] <= 0) {
                                this.isMoving = false; 
                                scoreComputer ++;
                            }
                        }
                    } else if (item.collisionStatus === true) {
                        switch(item.type) {
                            case 'border':
                                switch(item.subType) {
                                    case 'terrain':
                                        this.reverseAngleY();
                                        break;
                                    case 'wall': 
                                        this.reverseAngleX();
                                        break;
                                }                           
                                break; 
                            case 'racket':
                                if (this.coordinates[1] > 500) {
                                    this.findBouncingAngles(computer);
                                    this.lastTouchedBy = 'computer';
                                    document.getElementById("pong").play();
                                } else if (this.coordinates[1] < 500) { // j'arrive pas à m'en débarrasser du else
                                    this.findBouncingAngles(player);
                                    this.lastTouchedBy = 'player';
                                    document.getElementById("ping").play();
                                    michel.reachTargetSimulation(michel.anticipatedTrajectory()); 
                                }
                                break;
                            case 'bonus':
                                item.isHit = true;
                                if (this.lastTouchedBy === 'player') {
                                    item.hitBy = 'player';
                                } else if (this.lastTouchedBy === 'computer') {
                                    item.hitBy = 'computer';
                                }
                                switch(item.subType){
                                    case 'plusOne':
                                        this.reverseAngleY();
                                        break;
                                }
                                break;
                        }
                    }
                }    
            }
        });
    } 

    play() {
        this.isMoving = true;
        this.findBouncingAngles(player);
        document.getElementById("ping").play();
        const ball_XY = setInterval(() => {
            this.updateX(this.angle[0]);
            this.updateY(this.angle[1]);
            this.collisionManager();
            player.bonusCatcher();
            computer.bonusCatcher();
            scoreDisplay();
            if(this.isMoving === false) {
                clearInterval(ball_XY);
                startingPosition();
            }
        }, this.velocity)
        const bonusInterval = setInterval(() => {
            Bonus.pushBonus();
            if (this.isMoving === false) {
                clearInterval(bonusInterval);
            }
        }, 1000);
    }  
}

// BONUS CLASSES 
class Bonus extends GameObjects {
   static bonusModeList = ['isStatic', 'racketPickup', 'isMoving'];
    constructor() {
        super()
        this._type = 'bonus';
        this._bonusMode = this.randomizeBonusMode();
        this._insideContent;
        this._isActive = false;
        this._isMoving = false;
        this._movingDirection;
        this._isHit = false;
        this._timeBeforePickUp = 20000;
        this._effectDuration;
        this._coordinates = this.manageBonusMode()
        this._width = 40;
        this._height = 40;
    }
    get insideContent() {
        return this._insideContent;
    }
    set insideContent(newContent) {
        this._insideContent = newContent;
    }
    get isMoving() {
        return this._isMoving;
    }
    set isMoving(newValue) {
        this._isMoving = newValue;
    }
    get movingDirection() {
        return this._movingDirection;
    }
    set movingDirection(newDirection) {
        this._movingDirection = newDirection;
    }
    get isActive() {
        return this._isActive;
    }
    set isActive(newValue) {
        this._isActive = newValue;
    }
    get bonusMode(){
        return this._bonusMode;
    }
    get timeBeforePickUp() {
        return this._timeBeforePickUp;
    }
    get effectDuration() {
        return this._effectDuration;
    }
    changeContent(newContent){
        this.cssQuery.innerHTML = `${newContent}`;
        this.cssQuery.style.transform =  'rotate(0deg)';
    }
    generateRandomCoords(num, offset) {
        offset = typeof offset !== "undefined" ? offset : 0;
        return Math.floor(Math.random() * num + offset)
    }
    generateRandomSide() { 
        if(Math.random() >= 0.5){
            this.movingDirection = 'movingDown';
            return 1000 - this.width;
        } this.movingDirection = 'movingUp';
        return 0;
    }

    randomizeBonusMode() {
        //randomise le mode de capture et déplacement
        if (this.subType === 'purpleWarp'){
            return 'isStatic'
        }
        return Bonus.bonusModeList[Math.floor(Math.random() * Bonus.bonusModeList.length)]; 
    }

    manageBonusMode() {
        /*
        Bug desfois, vérifier que l'on tienne compte des dimensions de l'objet pour ne pas l'avoir hors champ
        */
        // ecrire 3 types de déplacements
        switch (this.bonusMode) {
            case 'isStatic':
                // Le bonus apparait au hasard dans un grid central de 950 par 750
                this.coordinates = [this.generateRandomCoords(800, 100), this.generateRandomCoords(800, 100)];
                break;
            case 'racketPickup':
                // Le bonus apparait sur la ligne d'un des joueurs doit être touché avec la raquette
                this.coordinates = [this.generateRandomCoords(960, 0), this.generateRandomSide()];
                break;
            case 'isMoving':
                // Le bonus apparait d'un côté et peut être soit touché soit attrapé à la raquette    
                this.coordinates = [this.generateRandomCoords(960, 0), this.generateRandomSide()];
                this.isMoving = true;
                break;
        }
    }

    static pushBonus() {
        /*
        -> Il ne peut y avoir que 2 bonus en simultané, ils ne doivent pas avoir le même subtype
        -> Si il y a déjà un bonus du même soustype, relancer la fonction pour avoir un type différent
        -> Ratio en bas de la method à mettre à 0.1
        jsais pas pk les bonus pop par deux
        */
        const bonusList = [PlusOne, HiddenBall, RedAvoid, BlueFreeze, PurpleWarp];
        const randomizeBonusType = () => {
            let bonus = new bonusList[Math.floor(Math.random() * bonusList.length)];
            if (GameObjects.getItemList().filter((item) => item.type === 'bonus').length < 2) {
                if (GameObjects.getItemList().filter((item) => item.subType === bonus.subType).length === 0) {
                    GameObjects.pushItemList(bonus);
                    bonus.lifeCycle();
                } //randomizeBonusType();
            }    
        }
        if (Math.random() < 0.3) {
            document.getElementById("popBonus").play();
            randomizeBonusType()
        }
    }

    lifeCycle() {
         /*
        LIFECYCLE determine ce qui se passe lors de la durée de vie du bonus, 
        - le tronc commun est le changement de contenu sur les 3 dernières secondes pour indiquer temps restant
        - une fonction isHitAction déclenche les conséquences
        pour l'instant comme display donne les coordonnées près modif, je ne rend l'objet visible qu'après le premier cycle d'interval
        */ 
        this.display();
        this.cssQuery.style.visibility = 'hidden';
        this.manageBonusMode();
        let timeRemaining = this.timeBeforePickUp;
        const timeInterval = setInterval (() => {
            this.cssQuery.style.visibility = 'visible';
                this.cssQuery.style.left = this.coordinates[0] + 'px';
                this.cssQuery.style.bottom = this.coordinates[1] + 'px';
            if(this.isMoving) {
                if(this.movingDirection === 'movingUp') {
                    this.coordinates[1] += 2;
                } else if (this.movingDirection === 'movingDown'){
                    this.coordinates[1] -= 2;
                }
            }
            timeRemaining -= ball.velocity;
            if (ball.isMoving === false) {
                this.unDisplay(this);
                GameObjects.removeItemFromList(this);
                clearInterval(timeInterval) ;
            }
            if (this.isHit) {
                this.unDisplay(this);
                this.IsHitAction();
                GameObjects.removeItemFromList(this);
                clearInterval(timeInterval) ;
            }
            if (this.coordinates[1] < -40 || this.coordinates[1] > 1040) {
                this.unDisplay(this);
                GameObjects.removeItemFromList(this);
                clearInterval(timeInterval) ;
            }
            if (timeRemaining <= 3000 && timeRemaining > 0) {
                this.changeContent(Math.floor(timeRemaining / 1000));
            }
            else if (timeRemaining === 0) {
                clearInterval(timeInterval);
                this.unDisplay(this);
                GameObjects.removeItemFromList(this);  
            }
        }, ball.velocity);
    }

    initStateRacketCss(racket) {
        racket.cssQuery.style.border = '0px';
        racket.cssQuery.style.backgroundColor = 'rgba(255, 254, 254, 0.852)';
        racket.cssQuery.style.color = 'rgb(48, 54, 60)';
        racket.cssQuery.innerHTML = `${racket.subType}`;
        racket.speed = 2;
    } 
}

class PlusOne extends Bonus {
    // PlusOne : ajoute plus 1 au joueur mais la balle retourne en arrière
    constructor() {
        super()
        this._subType = 'plusOne';
        this._insideContent = '+1';
        this._HTMLcode = `<div id=${this.generateCssID()} class='${this.type}'>${this.insideContent}</div>`;
    }
    IsHitAction() {
        if (this.hitBy === 'player') {
            scorePlayer ++;
            document.getElementById("bonusPlayer").play();
        } else if (this.hitBy === 'computer') {
            scoreComputer ++;
            document.getElementById("bonusComputer").play();
        }  
    }
}

class HiddenBall extends Bonus {
    // HiddenBall : la balle devient invisible pendant 1 seconde
    constructor() {
        super()
        this._subType = 'hiddenBall';
        this._insideContent = '👁';
        this._HTMLcode = `<div id=${this.generateCssID()} class='${this.type}'>${this.insideContent}</div>`;
        this._effectDuration = 3000;
    }
    modifier() {
        ball.cssQuery.style.opacity = 0.1;
        setTimeout(() => {
            ball.cssQuery.style.opacity = 1;
        }, this.effectDuration);
    }
    IsHitAction() {
        document.getElementById("hidden").play();
        this.modifier();
    }
}

class RedAvoid extends Bonus { // ok mais pb de détection à double vitesse car augmentation des angles
    // RedAvoid : les collisions sont inversées, les fond rebondissent, toucher la balle est éliminatoire, balle vitesse * 2
    constructor() {
        super()
        this._subType = 'redAvoid';
        this._isHit = false;
        this._insideContent = '⚠';
        this._HTMLcode = `<div id=${this.generateCssID()} class='${this.type}'>${this.insideContent}</div>`;
        this._effectDuration = 5000;
    }
    modifier(racket) {
        ball.cssQuery.style.backgroundColor = 'rgb(159, 17, 10)';
        ball.velocity = ball.velocity / 2;
        racket.cssQuery.style.border = '3px solid rgb(203, 26, 16)';
        racket.cssQuery.style.backgroundColor = 'rgb(235, 171, 171)';
        racket.cssQuery.innerHTML = 'Avoid';
        document.getElementById('terrain').style.backgroundColor = 'rgb(172, 27, 11)';
        topWall.collisionStatus = true;
        bottomWall.collisionStatus = true;
        const redTimeout = setTimeout(() => {
            document.getElementById("alertmark").style.visibility ='hidden';
            ball.speedMode = false;
            ball.velocity = ball.velocity * 2;
            topWall.collisionStatus = false;
            bottomWall.collisionStatus = false;
            ball.cssQuery.style.backgroundColor = 'rgb(241, 180, 13';
            document.getElementById('terrain').style.backgroundColor = 'rgb(34, 39, 45)';
            this.initStateRacketCss(racket);
        }, this.effectDuration)
    }
    IsHitAction() {
        document.getElementById("redAlert").play();
        document.getElementById("alertmark").style.visibility ='visible';
        this.isActive = true;
        ball.speedMode = true;
        this.modifier(computer);
        this.modifier(player);
    }
}

class BlueFreeze extends Bonus {
    // BlueFreeze : carreau bleu, divise la vitesse de déplacement de l'autre joueur par 4 pendant 5 secondes
    constructor() {
        super()
        this._subType = 'blueFreeze';
        this._isHit = false;
        this._insideContent = '❅';
        this._HTMLcode = `<div id=${this.generateCssID()} class='${this.type}'>${this.insideContent}</div>`;
        this._effectDuration = 5000;
    }
    modifier(racket) {
        racket.cssQuery.style.border = '3px solid rgb(10, 109, 159)';
        racket.cssQuery.style.backgroundColor = 'rgb(171, 232, 235)';
        racket.cssQuery.style.color = '#0b077a';
        racket.cssQuery.innerHTML = 'Frozen';
        racket.speed = 0.3;
        setTimeout(() => {
            this.initStateRacketCss(racket);
        }, this.effectDuration);
    }
    IsHitAction() {
        document.getElementById("freeze").play();
        this.isActive = true;
        if (this.hitBy === 'player') {
            this.modifier(computer);
        } else if (this.hitBy ==='computer') {
            this.modifier(player);
        }  
    }
}

class PurpleWarp extends Bonus {
    // PurpleWarp : si la balle tombe dans le Warp, elle réapparait à un autre endroit chez l'adversaire
    constructor() {
        super()
        this._subType = 'purpleWarp';
        this._isHit = false;
        this._insideContent = 'W';
        this._HTMLcode = `<div id=${this.generateCssID()} class='${this.type}'>${this.insideContent}</div>`;
        this._timeBeforePickUp = 20000;
    }
    IsHitAction() {
        document.getElementById("warp").play();
        if (this.hitBy === 'player') {
            ball.coordinates = [this.generateRandomCoords(1000), this.generateRandomCoords(500, 300)];
        } else if (this.hitBy ==='computer') {
            ball.coordinates = [this.generateRandomCoords(1000), this.generateRandomCoords(200, 300)];
        }  
    }
}

class Bot {
    constructor() {
        this._shotOptions = [];
        this._anticipatedX;
        this._anticipatedY;
        this._directionToGo;
        this._bonusPriority = { // comme ça?
            'plusOne' : 5,
        }
    }

    get shotOptions() {
        return this._shotOptions;
    }

    set shotOptions(newBatch) {
        this._shotOptions = newBatch;
    }

    get anticipatedX() {
        return this._anticipatedX;
    }

    set anticipatedX(newValue) {
        this._anticipatedX = newValue;
    }

    get anticipatedY() {
        return this._anticipatedY;
    }

    set anticipatedY(newValue) {
        this._anticipatedY = newValue;
    }

    get directionToGo() {
        return this._directionToGo;
    }

    set directionToGo(newDirection) {
        this._directionToGo = newDirection;
    }

    move() {
        /* Même système de déplacement exponentiel, peut être qu'il faudra adapter la vitesse.
        Les actions du decision tree doivent avoir un direction togo stop quand complétées
        */
       
        if (this.directionToGo === 'left') {
            computer.speed = 4;
            computer.moveLeft(); 
        } else if (this.directionToGo === 'right') {
            computer.speed = 4;
            computer.moveRight();
        } else if (this.directionToGo === 'stop') {
            computer.speed = 0;
        }
    }
    anticipatedTrajectory() {
        // Quand le joueur touche, le bot doit pouvoir anticiper le point d'arrivée
        const simulatedBallTrajectory = [ball.coordinates[0], ball.coordinates[1]];
        let angleX = ball.angle[0];
        let angleY = ball.angle[1];

        while (simulatedBallTrajectory[1] < computer.coordinates[1]) {
            // insérer les règles ici !!!
            if (simulatedBallTrajectory[0] <= 0 + ball.width / 2 || simulatedBallTrajectory[0] >= 1000 - ball.width / 2) {
                angleX = angleX - angleX * 2;
            } 
            simulatedBallTrajectory[0] += angleX;
            simulatedBallTrajectory[1] += angleY;
        }
        this.anticipatedX = simulatedBallTrajectory[0];
        this.anticipatedY = simulatedBallTrajectory[1];
        return [simulatedBallTrajectory[0], simulatedBallTrajectory[1]];
    }
    reachTargetSimulation(arrayXY) {
        /* CALCUL DES TRAJECTOIRES POSSIBLES : 
        -> On part de l'emplacemnt de la balle au contact pour simuler les conséquence de touche sur chaque point de contact.
        -> chaque slot à une conséquence sur la trajectoire, plus ou moins directe, rebonds ou non
        donc on va calculer avec une for loop combien d'itération par angle il faut pour atteindre le Y objectif
        plus i est élevé et plus le nb de rebonds est élevé, tir indirect
        */
       // Cible de la simulation : 
        const targetCoordinates = [1000, 0];
        const shotOptions = [];
        for (let i = 0; i < computer.racketDividerArray().length; i++) {
            const reachableTargetsList = [];
            // Point de départ de la simulation : 
            const simulatedBallTrajectory = [arrayXY[0], arrayXY[1]];
            let angleX = computer.racketAngleArray(i)[0];
            const angleY = computer.racketAngleArray(i)[1];
            let numberOfAngleIterations = 0;
            while (simulatedBallTrajectory[1] > targetCoordinates[1]) {
                // simuler les réflections de balles sur mur
                if (simulatedBallTrajectory[0] <= 0 + ball.width / 2 || simulatedBallTrajectory[0] >= 1000 - ball.width / 2) {
                    angleX = angleX - angleX * 2;
                } 
                simulatedBallTrajectory[0] += angleX;
                simulatedBallTrajectory[1] += angleY;
                /* ici nous détectons à chaque itération while si un bonus est susceptible d'être capturé, il sera ajouté à reachableTargetsList
                -> pour l'instant sur les statics on est bien
                -> pas certain d'intégrer le plus one qui reverse Y
                */
                const potientialTargetsList = GameObjects.getItemList().filter((item) => item.type === 'bonus');
                potientialTargetsList.forEach(target => {
                    /* -> je dois tenir compte des bonus qui sont mobiles
                    if (item.bonusMode === 'isMoving') {

                    }
                    */
                    if (simulatedBallTrajectory[1] >= target.coordinates[1] && simulatedBallTrajectory[1] <= target.coordinates[1] + target.height) {
                        if (simulatedBallTrajectory[0] >= target.coordinates[0] && simulatedBallTrajectory[0] <= target.coordinates[0] + target.width) {
                            reachableTargetsList.push(target);
                        }
                    }
                })
                numberOfAngleIterations ++ ;
            }
            shotOptions.push([i, numberOfAngleIterations, simulatedBallTrajectory[0], simulatedBallTrajectory[1], reachableTargetsList]);
        } 
        this.shotOptions = shotOptions;
        
    }
    decisionTree() {
        const decisionsArray  = [this.alignCenter(), this.targetFarFromPlayer()];
        
    }
    /*
    on imagine que chaque élément devrait avoir un score d'importance en fonction de son type et de sa distance
    Decision tree : 
    les methods factices_, sont là pour donner l'illusion d'une prise de décision, donner de la vie au bot.
    */
    factice_followBallLeft() {
        if (ball.coordinates[0] + 5 < computer.coordinates[0]) {
            this.directionToGo = 'left';
        } 
    }

    factice_followBallRight() {
        if (ball.coordinates[0] + 5 > computer.coordinates[0] + computer.width) {
            this.directionToGo = 'right';
        }
    }

    alignCenter() {
        if (this.anticipatedX <= computer.coordinates[0] + computer.width / 2) {
            this.directionToGo = 'left';
            if (this.anticipatedX + 5 === computer.coordinates[0] + computer.width / 2) {
                this.directionToGo = 'stop';
            }
        } else if (this.anticipatedX >= computer.coordinates[0] + computer.width / 2) {
            this.directionToGo = 'right';
            if (this.anticipatedX + 5 === computer.coordinates[0] + computer.width / 2) {
                this.directionToGo = 'stop';
            }
        }
        
    }
   
    targetFarFromPlayer() {
        /*
        un paramètre d'aggressivité correspondrait à un tir plus direct et moins anticipable, moins d'aggro = plus de reflections
        */
        const farthestXPosition = () => {
            /* Dans les angles disponibles de shotOptions, choisir celui qui crée la plus grande distance avec le joueur, et récupérer un index 
            pour savoir où taper:
            -> Je récupère tous les points d'arrivée X dans l'ordre,
            -> Je soustrait le centre de la raquette joueur et bascule les nombres négatifs en positif pour comparer la distance,
            -> Je finis en trouvant l'index de la valeur la plus haute, qui sera utilisé pour savoir quel slot utiliser. */
            const arrivalXArray = [];
            this.shotOptions.forEach((option) => {
                arrivalXArray.push(option[2])
            });
            const distanceArray = arrivalXArray.map((x) => x - player.coordinates[0] + player.width / 2).map((x) => x > 0 ? x : x + x * -2);
            return distanceArray.indexOf(Math.max(...distanceArray));
        } 
        // ça ressemble
        if (this.anticipatedX > computer.racketDividerArray()[farthestXPosition()]) {
            this.directionToGo = 'right';    
        } else if (this.anticipatedX < computer.racketDividerArray()[farthestXPosition() + 1]) {
            this.directionToGo = 'left';  
        }   
    }

    targetBonusRacketPickup() {
        // ne concerne que les bonus en mode pickup sur la ligne du bot.
        const bonusPickupList = GameObjects.getItemList().filter((item) => (item.type === 'bonus') && (item.bonusMode === 'racketPickup') && (item.coordinates[1] === (1000 - item.width)));
        bonusPickupList.forEach(bonus => {

            if (bonus.coordinates[0] < computer.coordinates[0] ) {
                this.directionToGo = 'left';
                
            } else if (bonus.coordinates[0] > computer.coordinates[0] + computer.width) {
                this.directionToGo = 'right';
            }
        })
    }

    targetBonus_BallCatch() {
        const reachableTargetsList = this.shotOptions;
        console.log(reachableTargetsList[4])
    }

    play() {
        this.anticipatedTrajectory();
        this.reachTargetSimulation([this.anticipatedX, this.anticipatedY]);
        const playInterval = setInterval(() => {
            //this.decisionTree();
            //this.targetBonusRacketPickup();
            //this.factice_followBallLeft();
            this.alignCenter();
            //this.targetBonus_BallCatch();
            this.move();
        }, ball.velocity)
    }
}

// SCORE :
let scorePlayer = 0;
let scoreComputer = 0;
const scoreDisplay = () => {
    document.getElementById('scorePlayer').innerHTML = `${scorePlayer}`;
    document.getElementById('scoreComputer').innerHTML = `${scoreComputer}`;
    const higherScoreGlow = () => {
        if(scoreComputer > scorePlayer){
            return ['Computer', 'Player']
        } return ['Player', 'Computer']
    }
    // Egalité : score opaque, score élevé : glow
    if (scoreComputer !== scorePlayer) {
        document.getElementById(`score${higherScoreGlow()[0]}`).style.opacity = '0.6';
        document.getElementById(`score${higherScoreGlow()[1]}`).style.opacity = '0.2';
    } else if (scoreComputer === scorePlayer) {
        document.getElementById(`score${higherScoreGlow()[0]}`).style.opacity = '0.2';
        document.getElementById(`score${higherScoreGlow()[1]}`).style.opacity = '0.2';
    }
}

const startingPosition = () => {
    if (ball.lastTouchedBy === 'player') {
        ball.coordinates = [495, 20];
    } else if (ball.lastTouchedBy === 'computer') {
        computer.coordinates = [420, 980]
        ball.coordinates = [495, 960];
        setTimeout(() => {
            ball.play();
            document.getElementById("pong").play();
        },1000);
    }
    ball.cssQuery.style.left = ball.coordinates[0] +'px';
    ball.cssQuery.style.bottom = ball.coordinates[1] +'px';
}

//important initialisation: 
const topWall = new TerrainBorderLimit(0, 1000);
const bottomWall = new TerrainBorderLimit(0, 0);
const leftWall = new Wall(0, 0);
const rightWall = new Wall(990,0);
const player = new Racket('player');
const computer = new Racket('computer');
const ball = new Ball;
const michel = new Bot;

const initGame = () => {
    GameObjects.pushItemList(topWall);
    GameObjects.pushItemList(bottomWall);
    GameObjects.pushItemList(leftWall);
    GameObjects.pushItemList(rightWall);
    GameObjects.pushItemList(player);
    GameObjects.pushItemList(computer);
    player.display();
    computer.display();
    ball.display();
    scoreDisplay();
}

// CONTROLS: 
const startButton = document.getElementById("startbutton");
startButton.addEventListener("click", (event) => {
    document.getElementById("initGame").play();
    setTimeout(()=> {
        startButton.style.visibility = 'hidden';
        document.getElementById("title").style.visibility = 'hidden';  
     initGame();
    }, 600)
    
});

window.addEventListener('keydown', (e) => { 
    switch(e.key){
        /*
        En utilisant le set interval, je peux garder de la vitesse avec un pas de déplacement plus fin, 
        en revanche le cumul de set intervals lors du déplacement donne une vitesse exponentielle, ptet pas opti en process
        mais agréable
        */
        case 'ArrowLeft' :
            const moveLeftInterval = setInterval(() => {
                player.moveLeft();
            },10)
            window.addEventListener('keyup', (e) => {
                clearInterval(moveLeftInterval)
            })
            break;
        case 'ArrowRight' :
            const moveRightInterval = setInterval(() => {
                player.moveRight();
            },10)
            window.addEventListener('keyup', (e) => {
                clearInterval(moveRightInterval)
            })
            break;
        case 'ArrowUp' : //start the ball // fonctionne
            ball.play()
            michel.play()
            break;
        case 'ArrowDown' : //fires something
            break;
    }
})



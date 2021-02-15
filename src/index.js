/* ------------------------------------------------
                   CLASSES
                   
-------------------------------------------------*/
class FlappyBird{
    constructor(id, startx, starty){
        //Neat
        // TODO make the neural network
        this.brain = new Genome(gameparams["genomeInputN"], gameparams["genomeOutputN"], id);
		this.fitness;

		this.score = 1;
		this.lifespan = 0;
		this.dead = false;
		this.decisions = []; //Current Output values
		this.vision = []; //Current input values
        //Game
        this.x = startx;
        this.y = starty;
        this.direction = false;
        this.wh = 50;
    }

    //Neat
    clone() { //Returns a copy of this FlappyBird
		let clone = new FlappyBird();
		clone.brain = this.brain.clone();
		return clone;
	}

	crossover(parent){ //Produce a child
		let child = new FlappyBird();
		if(parent.fitness < this.fitness)
			child.brain = this.brain.crossover(parent.brain);
		else
			child.brain = parent.brain.crossover(this.brain);

		child.brain.mutate()
		return child;
	}

    calculateFitness(){ //Fitness function : adapt it to the needs of the
		this.fitness = this.score;
		this.fitness /= this.brain.calculateWeight();
	}

	//Game
    draw(color){
        fill(color);
        rect(this.x, this.y, this.wh, this.wh);    
    }

    clear(){
        clearInterval(this.birdup);
        clearInterval(this.birddown);
    }

    up(step){
        this.direction = true;
        this.clear();
        let temp = 0;
        this.birdup = setInterval(() => {
            if(temp > gameparams["jumpheight"]){
                this.direction = false;
                this.down(gameparams["downspeed"]);
            }
            this.y -= step;
            temp += 1;   
        }, 5);
    }

    down(step){
        this.direction = false;
        this.clear();
        this.downmultiplier = 1;
        this.birddown = setInterval(() => {
            this.y += step * this.downmultiplier;
            this.downmultiplier += 0.03;   
        }, 10);
    }

    //check collision die
    checkdie(){
        if(this.y > gameparams["height"] || this.y < 0){
            this.die();
        } else {
            for (let i = 0; i < 2; i++) {
                try {
                    if( pillars[i].iscollide(this.x, this.y, this.wh) ){
                        this.die();
                    }
                } catch (er) {//because in the beginning IndexError
                }
            }
        }
    }

    die(){
        this.clear();
        this.dead = true; 
    }
}


function double_pillar(xpos, topheight, between) {
    this.x = xpos;
    this.topheight = topheight;
    this.between = between;
    this.top = createVector(this.x, 0, this.topheight);
    this.bottom = createVector(this.x, this.topheight + this.between, gameparams["height"] - this.topheight - this.between);
    this.scored = true;
    //pillarbefore
    pillarbefore = [this.topheight];

    //methods
    this.draw = (color) => {
        fill(color);
        rect(this.top.x, this.top.y, gameparams["pillarwidth"], this.top.z);
        rect(this.bottom.x, this.bottom.y, gameparams["pillarwidth"], this.bottom.z);
    };

    this.move = (step) => {
        this.x -= step;
        this.top.x = this.x;
        this.bottom.x = this.x;
        if(this.x + gameparams["pillarwidth"] < gameparams["birdstartx"] && this.scored){
            score += 1;
            population.score();
            this.scored = false;
        }
    };

    //collision
    this.iscollide = (birdx, birdy, birdwh) => {
        //check y
        if( this.topheight < birdy && birdy < (this.bottom.y - birdwh) ){
            return false;//no collide
        } else {//check x
            if(birdx < (this.x - birdwh) || birdx > (this.x + gameparams["pillarwidth"]) ){
                return false;//no collide
            } else {//collide
                return true;
            }
        }
    };
}

/* ------------------------------------------------
                   FUNCTIONS
                   
-------------------------------------------------*/

function genpillarcords(min, max, between) {
    //normalize
    if(max > gameparams["maxheight"]){
        max = gameparams["maxheight"];
    }
    if(min < gameparams["minheight"]){
        min = gameparams["minheight"];
    }
    let newp = Math.floor((Math.random() * (max - between - min)) + 1);
    newp += min;
    return newp; /* return a value where the first pillar ends 
    and after the between the second pillar starts */
}

/* ------------------------------------------------
                   MAIN CODE
                   
-------------------------------------------------*/
var gameparams = {
    "height": 800, 
    "width": 800,
    "birdstarty": 200,
    "birdstartx": 200,
    "delay": 1500,
    "pillarwidth": 150,
    "pillarspeed": 4,
    "upspeed": 3,
    "downspeed": 1.5,
    "jumpheight": 45,
    "offsetcap": 250,
    "between": 350,
    "minheight": 50,
    "maxheight": 750,
    "genomeInputN": 2,
    "genomeOutputN": 2,
    "showbest": true
};

var score = 0;
var pillars = [];
var pillarbefore = [];


function setup(){
    createCanvas(gameparams["width"], gameparams["height"]);
    
    //create population
    population = new Population(50);

    //create pillars
    pillars.push(new double_pillar(width, genpillarcords(50, 750, gameparams["between"]), gameparams["between"]));
    createpillars = setInterval(() => {
            pillars.push(new double_pillar(width, 
                    genpillarcords(pillarbefore[0] - gameparams["offsetcap"], (pillarbefore[0] + gameparams["between"] + gameparams["offsetcap"]), gameparams["between"]),
                    gameparams["between"]));
    }, gameparams["delay"]);
}


function draw() {
    background('lightgreen');

    //draw pillars
    for (let i = 0; i < pillars.length; i++) {
        if(pillars[i].x + gameparams["pillarwidth"] < 0){
            pillars.splice(i, 1);
        }
        pillars[i].draw('green');
        pillars[i].move(gameparams["pillarspeed"]);
    }

    //text
    textSize(20);
    fill('black');
    text(`Score ${score}`, 20, 20);

    //population
    if(!population.done()){
		population.updateAlive();
    } else {
        population.naturalSelection();
    }
}

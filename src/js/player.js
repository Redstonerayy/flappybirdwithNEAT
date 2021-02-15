//The Player Class
//The interface between our 
//NeuralNetwork and the game 
class Player{
	constructor(id){
		this.brain = new Genome(genomeInputsN, genomeOutputN, id);
		this.fitness;

		this.score = 1;
		this.lifespan = 0;
		this.dead = false;
		this.decisions = []; //Current Output values
		this.vision = []; //Current input values
	}

	clone() { //Returns a copy of this player
		let clone = new Player();
		clone.brain = this.brain.clone();
		return clone;
	}

	crossover(parent){ //Produce a child
		let child = new Player();
		if(parent.fitness < this.fitness)
			child.brain = this.brain.crossover(parent.brain);
		else
			child.brain = parent.brain.crossover(this.brain);

		child.brain.mutate()
		return child;
	}


	//Game stuff
	
	calculateFitness(){ //Fitness function : adapt it to the needs of the
		this.fitness = this.score;
		this.fitness /= this.brain.calculateWeight();
	}
}

//class from flappybird game
function flappybird(startx, starty) {
    this.x = startx;
    this.y = starty;
    this.wh = 50;
    
    //methods
    this.draw = () => {
        fill('yellow');
        rect(this.x, this.y, this.wh, this.wh);    
    };

    this.clear = () => {
        clearInterval(this.birdup);
        clearInterval(this.birddown);
    };

    this.up = (step) => {
        this.clear();
        let temp = 0;
        this.birdup = setInterval(() => {
            if(temp > jumpheigh){
                this.down(downspeed);
            }
            this.y -= step;
            temp += 1;   
        }, 5);
    };

    this.down = (step) => {
        this.clear();
        this.downmultiplier = 1;
        this.birddown = setInterval(() => {
            this.y += step * this.downmultiplier;
            this.downmultiplier += 0.03;   
        }, 10);
    };

    //check collision die
    this.checkdie = () => {
        if(this.y > height || this.y < 0){
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
    };

    this.die = () => {
        highscore = score;
        score = 0;
        pillars = [];
        bird = new flappybird(birdstartx, birdstarty);
        bird.down(downspeed); 
    };
}
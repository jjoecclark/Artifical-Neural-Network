var Network = function(totalLayers, inputs, hiddens, outputs) {
	this.lr = 0.01; //lr = learning rate.
	this.reLU_value = 0;//.01; //Standard: 0.01 or 0.1?
	this.layers = []; //Becomes a multidimensional array.
	this.addNodes(totalLayers, inputs, hiddens, outputs);
	this.error;
};
//Neural network object functions.
Network.prototype = {
	//Adds correct number of nodes to the layers array.
	addNodes: function(totalLayers, inputs, hiddens, outputs) {
		for (var i = 0; i < totalLayers; i++) {
			var nodes = [];
			if (i == 0) {
				var j_length = inputs;
				var numWeights = hiddens;
			} else if (i == totalLayers - 1) {
				var j_length = outputs;
				var numWeights = 0;
			} else if (i == totalLayers - 2) { //Penultimate layer (i.e., last hidden layer) 
				var j_length = hiddens;
				var numWeights = outputs; //Has 'outputs' number of weights.
			} else {
				var j_length = hiddens;
				var numWeights = hiddens;
			}
			for (var j = 0; j < j_length; j++) {
				nodes.push(new Node(numWeights));
			}
			this.layers.push(nodes);
		}
	},
	//Calculates the output based on inputs and current weight/bias values.
	//Inputs and expectedOutput parameters are arrays.
	forwardPass: function(inputs, expectedOutput) {
		//Assign the values of the nodes in the first layer to the inputs.
		for (var i = 0; i < inputs.length; i++) {
			this.layers[0][i].value = inputs[i];
		}
		//Loop through each layer (except input layer). 
		//Calculate the values of the nodes based on weights, biases, and values in the previous layer.
		for (var i = 1; i < this.layers.length; i++) {
			for (var j = 0; j < this.layers[i].length; j++) {
				var newValue = 0;
				for (var k = 0; k < this.layers[i - 1].length; k++) {
					newValue += (this.layers[i - 1][k].weights[j] * this.layers[i - 1][k].value);
				}
				//Add bias and run the new value through activation function.
				newValue += this.layers[i][j].bias;				
				//this.layers[i][j].value = 1 / (1 + Math.exp(-newValue)); //Sigmoid.
				this.layers[i][j].value = max(newValue * this.reLU_value, newValue); //reLU.
			}
		}
	},
	//Uses leaky reLU
	backpropogate: function(expectedOutput) { 
		//For loop through layers backward in order to get the change in weights for the incoming weights.
		//i >= 1, because we are exlcuding the first layer, since it has no incoming weights.
		for (var i = this.layers.length - 1; i >= 0; i--) {
			//Loop through every node in the layer
			for (var j = 0; j < this.layers[i].length; j++) {
				//If last layer.
				if (i == this.layers.length - 1) {
					//Get netError for output node[i].
					var a = -(expectedOutput[j] - this.layers[i][j].value);
					if (this.layers[i][j].value <= 0) {
						var b = this.reLU_value;
					} else {
						var b = 1;
					}
					this.layers[i][j].netError = a * b;
					//Get overall error for display purposes.
					this.error = Math.abs(expectedOutput[j] - this.layers[i][j].value);
				} else {
					//First, get outError for hidden node[i]. 
					//(i.e., sum of each efferent * the netError of the node it connects to).
					var outError = 0;
					for (var k = 0; k < this.layers[i][j].weights.length; k++) {
						outError += (this.layers[i][j].weights[k] * this.layers[i + 1][k].netError);
						//Calculate and assign deltaWeight values for this.layers[i][j] (Multitasking).
						//Now it does, because I just added layer 1. But is this efficient?
						this.layers[i][j].weightDeltas[k] = this.layers[i][j].value * this.layers[i + 1][k].netError;
					}
					if (this.layers[i][j].value <= 0) {
						var o = this.reLU_value;
					} else {
						var o = 1;
					}
					//Convert outError to netError.
					this.layers[i][j].netError = outError * (o); //Is this line right?
				}
			}
		}
		//Loop through all weights to update them based on weightDeltas array.
		for (var i = 0; i < this.layers.length; i++) {
			for (var j = 0; j < this.layers[i].length; j++) {
				//Update bias.
				this.layers[i][j].bias -= (this.lr * this.layers[i][j].netError);
				for (var k = 0; k < this.layers[i][j].weights.length; k++) {
					this.layers[i][j].weights[k] -= (this.lr * this.layers[i][j].weightDeltas[k]);
				}
			}
		}
	}
};
//Node object.
//numWeights = number of weights to add to weights array.
var Node = function(numWeights) {
	this.value;
	//Bias is random value between -1 and 1.
	this.bias = Math.floor(Math.random() * 10 + 1) / 100;
	//if (Math.random() > 0.5) { this.bias = -this.bias; }
	this.weights = [];
	this.weightDeltas = [];
	this.netError; //Error with respect to the node's inputs.
	this.assignWeights(numWeights);
};
//Node object functions.
Node.prototype = {
	//Adds correct number of weights to weights array.
	assignWeights: function(numWeights) {
		for (var i = 0; i < numWeights; i++) {
			//Weights are random values between -1 and 1.
			this.weights.push(Math.floor(Math.random() * 10 + 1) / 100);
			if (Math.random() > 0.5) { this.weights[i] = this.weights[i] * -1; }
		}
	}
};

//Misc. functions.

//Takes two numbers as inputs, returns the higher numer. 
var max = function(a, b) {
	if (b > a) {
		return b;
	} else {
		return a;
	}
};
//Returns the highest element in an array.
var arrayHighest = function(array) {
	var highest = 0;
	var secondHighest = 0;
	var index;
	var data = { highest: 0, secondHighest: 0, index: 0 };
	for (var i = 0; i < array.length; i++) {
		if (array[i] > data.highest) {
			data.secondHighest = data.index;
			data.highest = array[i];
			data.index = i;
		}
	}
	return data;
};
//Randomly shuffles the elements in an array.
var arrayShuffle = function(array) {
	for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
};
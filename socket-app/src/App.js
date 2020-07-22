import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

/* NAME: Square
   DESCRIPTION:
  	Each square represents a button on the calculator
*/
function Square(props){
	return (
	  <button className="square" onClick={props.onClick}>
		{props.value}
	  </button>
	);
}

/* NAME: Board
   DESCRIPTION:
    The board renders each of the calculator's buttons
*/
class Board extends React.Component {
  
  renderSquare(buttonVal) {
    return (
		<Square 
			value={buttonVal}
			onClick={() => this.props.onClick(buttonVal)}
		/>
	);	
  }

  render() {

    return (
      <div>
	    <div className="calculation">{this.props.equation}</div>
        <div className="board-row">
          {this.renderSquare("7")}
          {this.renderSquare("8")}
          {this.renderSquare("9")}
		  {this.renderSquare("/")}
        </div>
        <div className="board-row">
          {this.renderSquare("4")}
          {this.renderSquare("5")}
          {this.renderSquare("6")}
		  {this.renderSquare("*")}
        </div>
        <div className="board-row">
          {this.renderSquare("1")}
          {this.renderSquare("2")}
          {this.renderSquare("3")}
		  {this.renderSquare("-")}
        </div>
		<div className="board-row">
          {this.renderSquare("C")}
          {this.renderSquare("0")}
          {this.renderSquare("=")}
		  {this.renderSquare("+")}
        </div>
      </div>
    );
  }
}

/* NAME: App
   DESCRIPTION:
	Calculator application which displays our board, handles button 
	clicks, sends/receives our calculations to/from the socket, and 
	stores our calculations to session storage
*/
const App = () => {
  const counterKey = 11;
  const title = 'Calculator History:';
  const [yourID, setYourID] = useState();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [display, setDisplay] = useState("");
  
  const socketRef = useRef();
  
  /*Hook that runs when our component renders
    Receives messages from the socket 
  */
  useEffect(() => {
	  socketRef.current = io.connect('/');
	  
	  socketRef.current.on("your id", id => {
		  setYourID(id);
	  })
	  
	  socketRef.current.on("message", (message) => {
		  console.log("here");
		  receivedMessage(message);
	  })
  },[]);
	  
  //Function to handle what happens when a user clicks a button on the calculator
  function handleClick(buttonVal){
	  
	if (buttonVal === "C"){ //Clear the current equation
		setMessage("");
		setDisplay("");
	} else if (buttonVal === "="){ //If the user clicked equals, add the full equation to the history
		var answer = eval(message);
		var ending = "=" + answer;
		setDisplay(answer);
		sendMessage(message + ending);
	} else {  //Keep adding to current equation until we want to evaluate
		if (message.length === 0){
			setDisplay(buttonVal);
		} else {
			setDisplay(display + buttonVal);
		}
		appendToMessage(buttonVal);
	}
  }
  
  /*Sets message to the current message value 
    plus the value from the button the user clicked 
  */
  function appendToMessage(buttonVal){
	  setMessage(message + buttonVal);
  }
  
  /*Appends the received calculation to the array of old calculations
   Only stores the 10 most recent calculations
  */
  function appendToMessages(oldMsgs,message){
	  oldMsgs = oldMsgs.concat(message);
	  if (oldMsgs.length > 10) {
		  oldMsgs.shift();
	  }
	  return oldMsgs;
  }
  
  /* Adds our received calculation to session storage
     Using the key/value pairs in the session storage, we will
	 use keys 0 through 9 to store the 10 most recent calculations 
  */
  function receivedMessage(message) {
	  var count = sessionStorage.getItem(counterKey);
	  if (count === "") { 
		count = 0;
	  } else {
		count++;
	  }
	  const key = count % 10;
	  sessionStorage.setItem(key, message.body);
	  sessionStorage.setItem(counterKey, count); //store total number of calculations in counterKey key/value pair
	  setMessages(oldMsgs => appendToMessages(oldMsgs,message));
  }
  
  //emits calculation to server using socket
  function sendMessage(equation) {
	  const messageObject = {
		  body: equation,
		  id: yourID,
	  };
	  setMessage("");
	  socketRef.current.emit("send message", messageObject);
  }
  
  /* Returns calculations stored in session storage to the user
     in the appropriate order
  */
  function returnSessionStorage() { 
	var equations = [];
	var key = sessionStorage.getItem(counterKey);
	var count = 0;
	if (key < 10){
		for (key - 1; key >= 0; key--){
			equations[count] = sessionStorage.getItem(key);
			count++;
		}
	} else {
		for (let i = 0; i < 10; i++){
			equations[i] = sessionStorage.getItem(key  % 10);
			key--;
		}		
	}
	
	return equations;
	
  }
  
  return (
	<div>
		<div className="game">
			<div className="game-board">
			<Board 
				equation={display}
				onClick={(buttonVal) => handleClick(buttonVal)}
			/>
        </div>
        <div className="game-info">
          <div>{title}</div>
		  <ol className="game-info">
			{returnSessionStorage().map((message) => {
				return (
					<div>
						{message}
					</div>
				)
			})}
		  </ol>
        </div>
      </div>
	</div>
	
  );
}

export default App;

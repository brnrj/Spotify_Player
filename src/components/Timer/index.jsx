import React, { useState, useEffect } from "react";

function Timer(props) {
  const { playerStatus, duration, position } = props;
  const [counter, setCounter] = useState(position)

  useEffect(() => {
    setCounter(position)
    if(position > 0 && playerStatus && position < duration){
      const timer = setInterval(() => {
        setCounter((prev) => prev + 1000)
      }, 1000);
      return () => clearInterval(timer)
    }
  }, [position, playerStatus, duration])

  return (
    <div>
      <div className="timer">
        <div>{new Date(counter).toISOString().substr(11, 8)}</div>
      </div>
    </div>
  );
}

export default Timer;

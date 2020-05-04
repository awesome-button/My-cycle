import React, {useState, useEffect} from 'react';
import axios from 'axios';

const App = () => {

  //state and effect hooks
  const [cycles, setCycles] = useState([])
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [message, setMessage] = useState(null)
  const [timer, setTimer] = useState({})

  useEffect(() => {
    axios
      .get('http://localhost:3001/cycles')
      .then(response => setCycles(response.data))
  }, [])

  //event handlers

  const handleTimer = (days, hours, minutes, seconds) => {
    setTimer({days: days, hours: hours, minutes: minutes, seconds: seconds})
  }

  const handleStartChange = (event) => {
    setStartDate(event.target.value)  
  }

  const handleEndChange = (event) => {
    setEndDate(event.target.value)
  }

  const handleNewCycle = (event) => {
    event.preventDefault()
    if (getLength() < 1) {
      setMessage(`Your cycle cannot have a negative value. Please modify the dates.`)
      setTimeout(() => setMessage(null), 3000)
    } else {
      const newCycle = {start:startDate, end:endDate, length:getLength()}
      axios
        .post('http://localhost:3001/cycles', newCycle)
        .then(response => setCycles(cycles.concat(response.data)))
    }
  }

  const removeCycle = (id) => {
    if (window.confirm("Are you sure you want to delete this cycle?")) {
      axios
        .delete(`http://localhost:3001/cycles/${id}`, { params: { id: id } })
      setCycles(cycles.filter(c => c.id !== id))
    }

  }

  //other helper functions

  const dateInSec = (date) => {
    let day, month, year;
    [year, month, day] = date.split("-");
    let fullDate = new Date(year, month - 1, day);
    let seconds = fullDate.getTime();
    return seconds;
  }

  const getLength = () => {
    return (Math.ceil((dateInSec(endDate) - dateInSec(startDate)) / (24 * 60 * 60 * 1000)))
  }

  const getAverage = () => {
    return cycles.length > 0
      ? cycles
        .map(c => c.length)
        .reduce((sum, ele) => sum + ele) / cycles.length
      : null
  }

  //returned structure
  return (
    <div className="root">
      <div className="heading">
        <h1>My cycle</h1>
        <Form 
          handleStartChange={handleStartChange}  
          handleEndChange={handleEndChange}
          handleNewCycle={handleNewCycle}
        />
      </div>
      <table>
        <tbody>
          <tr>
            <th>Start</th>
            <th>End</th>
            <th>Length</th>
          </tr>
          {cycles.map(c =>
            <Cycle key={c.id} cycle={c} removeCycle={removeCycle}/>  
          )}
        </tbody>
      </table>
      <Notification message={message}/>
      <Clock 
        getAverage={getAverage} 
        cycles={cycles} 
        dateInSec={dateInSec}
        handleTimer={handleTimer}
      />
    </div>
  )
}
export default App;


const Form = ({handleStartChange, handleEndChange, handleNewCycle}) => (

    <form className="form" onSubmit={handleNewCycle}>
      <p>Start date:</p>
      <input type="date" onChange={handleStartChange}></input>
      <p>End date:</p>
      <input type="date" onChange={handleEndChange}></input>
      <button type="submit">Add</button>
    </form>

)

const Cycle = ({cycle, removeCycle}) => (
  <tr>
    <td>{cycle.start}</td>
    <td>{cycle.end}</td>
    <td>{cycle.length} days
      <button onClick={() => removeCycle(cycle.id)}>delete</button>
    </td>
  </tr>
)

const Notification = ({message}) => {
  if (message === null) {
    return null
  } else {
    return (
      <div className="notification">
        {message}
      </div>
    )
  }
}

const Clock = ({getAverage, cycles, dateInSec, handleTimer}) => {
  if (cycles.length === 0 ) {
    return (<p></p>)
  } else {
    const recentEnd = cycles[cycles.length - 1].end
    const secondsLeft = getAverage() * 24 * 3600 *1000 - (Date.now() - dateInSec(recentEnd))
    const days = Math.floor(secondsLeft/(24*3600*1000))
    const hours = Math.floor((secondsLeft%(24*3600*1000))/(3600*1000))
    const minutes = Math.floor(((secondsLeft % (24 * 3600 * 1000)) % (3600 * 1000)) / (60 *1000))
    const seconds = Math.floor(((secondsLeft % (24 * 3600 * 1000)) % (3600 * 1000)) % (60 * 1000) / 1000)
    setTimeout(() => handleTimer(days, hours, minutes, seconds))
    return (
      <div className="timer">
        <h2>Your next period may come in about: </h2>
        <h1>{days} days, {hours} hours, {minutes} minutes and {seconds} seconds</h1>
      </div>
    )
  }
  
  
}
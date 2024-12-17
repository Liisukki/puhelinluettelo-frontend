import { useState, useEffect } from 'react'
import personService from './services/persons'
import Notification from './components/Notification' // Tuodaan Notification-komponentti

const Filter = ({ filterText, handleFiltering }) => (
  <div>
    Filter shown with: <input value={filterText} onChange={handleFiltering} />
  </div>
)

const PersonForm = ({
  newName,
  newNumber,
  handleNameChange,
  handleNumberChange,
  addPerson,
}) => (
  <form onSubmit={addPerson}>
    <div>
      Name: <input value={newName} onChange={handleNameChange} />
    </div>
    <div>
      Number: <input value={newNumber} onChange={handleNumberChange} />
    </div>
    <div>
      <button type="submit">add</button>
    </div>
  </form>
)

const Persons = ({ persons, handleDelete }) => (
  <ul>
    {persons.map(person => (
      <li key={person.id}>
        {person.name} {person.number}{' '}
        <button onClick={() => handleDelete(person.id, person.name)}>delete</button>
      </li>
    ))}
  </ul>
)

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filterText, setFilterText] = useState('')
  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    personService.getAll().then(initialPersons => {
      setPersons(initialPersons)
    })
  }, [])

  const handleFiltering = event => {
    setFilterText(event.target.value)
  }

  const handleNameChange = event => {
    setNewName(event.target.value)
  }

  const handleNumberChange = event => {
    setNewNumber(event.target.value)
  }

  const addPerson = event => {
    event.preventDefault()

    const existingPerson = persons.find(person => person.name === newName);

    if (existingPerson) {
      // Jos nimi löytyy jo, kysytään vahvistus numeron päivittämisestä
      if (
        window.confirm(
          `${newName} is already added to phonebook, replace the old number with a new one?`
        )
      ) {
        const updatedPerson = { ...existingPerson, number: newNumber }

        personService
          .update(existingPerson.id, updatedPerson)
          .then(returnedPerson => {
            setPersons(
              persons.map(person =>
                person.id !== existingPerson.id ? person : returnedPerson
              )
            )
            setNewName('')
            setNewNumber('')
            setErrorMessage(`${newName}'s number was updated successfully.`)
            setTimeout(() => {
              setErrorMessage(null)
            }, 5000)
          })
          .catch(error => {
            setErrorMessage(`Failed to update ${existingPerson.name}. The contact may have been removed from the server.`)
            setTimeout(() => {
              setErrorMessage(null)
            }, 5000)
          })
      }
      return
    }

    // Jos henkilö ei ole luettelossa, lisätään uusi
    const newPerson = { name: newName, number: newNumber }

    personService.create(newPerson).then(addedPerson => {
      setPersons(persons.concat(addedPerson))
      setNewName('')
      setNewNumber('')
      setErrorMessage(`${newName} was added successfully.`)
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    })
  }

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete ${name}?`)) {
      personService
        .remove(id)
        .then(() => {
          setPersons(persons.filter(person => person.id !== id))
          setErrorMessage(`${name} was deleted successfully.`)
          setTimeout(() => {
            setErrorMessage(null);
          }, 5000);
        })
        .catch(error => {
          setErrorMessage(`The contact '${name}' was already removed from the server.`)
          setTimeout(() => {
            setErrorMessage(null)
          }, 5000)
        })
    }
  }

  const personsToShow = persons.filter(person =>
    person.name.toLowerCase().includes(filterText.toLowerCase())
  )

  return (
    <div>
      <h1>Phonebook</h1>
      <Notification message={errorMessage} />
      <Filter filterText={filterText} handleFiltering={handleFiltering} />
      <h2>Add a new</h2>
      <PersonForm
        newName={newName}
        newNumber={newNumber}
        handleNameChange={handleNameChange}
        handleNumberChange={handleNumberChange}
        addPerson={addPerson}
      />
      <h2>Numbers</h2>
      <Persons persons={personsToShow} handleDelete={handleDelete} />
    </div>
  )
}

export default App

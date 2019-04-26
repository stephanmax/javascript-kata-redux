const actions = require('./actions')

const reducer = (state, action) => {
  switch (action.type) {
    case actions.CREATE_NOTE: {
      const id = state.nextNoteId;
      const newNote = {
        id,
        content: action.content
      }
      return {
        ...state,
        nextNoteId: id + 1,
        notes: {
          ...state.notes,
          [id]: newNote
        }
      }
    }
    case actions.UPDATE_NOTE: {
      const {id, content} = action;
      const editedNote = {
        ...state.notes[id],
        content
      }
      return {
        ...state,
        notes: {
          ...state.notes,
          [id]: editedNote
        }
      }
    }
    case actions.DELETE_NOTE: {
      const id = action.id
      const {[id]: note, ...notes} = state.notes
      return {
        ...state,
        notes
      }
    }
    default:
      return state
  }
}

const validateAction = action => {
  if (!action || typeof action !== 'object' || Array.isArray(action)) {
    throw new Error('Action must be an object')
  }
  if (typeof action.type === 'undefined') {
    throw new Error('Action must have a type')
  }
}

const createStore = (middleware) => {
  let state = {
    nextNoteId: 0,
    notes: {}
  }
  const subscribers = []

  const dispatch = (action) => {
    validateAction(action)
    state = reducer(state, action),
    subscribers.forEach(handler => handler())
  }
  const getState = () => state

  const store = {
    dispatch,
    getState,
    subscribe: handler => {
      subscribers.push(handler);
      return () => {
        const index = subscribers.indexOf(handler)
        subscribers.splice(index, 1)
      }
    }
  }

  if (middleware) {
    store.dispatch = middleware({
      getState
    })(dispatch)
  }
  
  return store
}

module.exports = {
  createStore
}

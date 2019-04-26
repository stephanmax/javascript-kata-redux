const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')

const expect = chai.expect
chai.use(sinonChai)

const actions = require('../actions')
const storeFactory = require('../store-factory')

describe('The store', () => {

  beforeEach(() => {
    this.store = storeFactory.createStore()
  })

  it('can be created', () => {
    expect(this.store).to.be.an('Object')
  })

  it('returns a state', () => {
    expect(this.store.getState()).to.be.an('Object')
  })

  it('can dispatch actions', () => {
    expect(this.store.dispatch).to.be.a('Function')
  })

})

describe('With the store', () => {

  beforeEach(() => {
    this.store = storeFactory.createStore()
  })

  it('we can store notes', () => {
    expect(this.store.getState()).to.have.a.property('notes')
    expect(this.store.getState().notes).to.be.an('Object')
  })

  it('we can create a note', () => {
    const content = 'Test note'
    
    this.store.dispatch({
      type: actions.CREATE_NOTE,
      content
    })

    expect(Object.keys(this.store.getState().notes)).to.have.lengthOf(1)
    expect(this.store.getState().notes[0].content).to.equal(content)
  })

  it('we can update a note', () => {
    const content = 'Updated test note'

    this.store.dispatch({
      type: actions.CREATE_NOTE
    })

    expect(this.store.getState().notes[0].content).to.be.undefined

    this.store.dispatch({
      type: actions.UPDATE_NOTE,
      id: 0,
      content
    })

    expect(this.store.getState().notes[0].content).to.equal(content)
  })

  it('we can delete a note', () => {
    this.store.dispatch({
      type: actions.CREATE_NOTE
    })
    this.store.dispatch({
      type: actions.CREATE_NOTE
    })

    expect(Object.keys(this.store.getState().notes)).to.have.lengthOf(2)

    this.store.dispatch({
      type: actions.DELETE_NOTE,
      id: 0
    })

    expect(Object.keys(this.store.getState().notes)).to.have.lengthOf(1)
  })

})

describe('The state', () => {

  beforeEach(() => {
    this.store = storeFactory.createStore()
  })

  it('is not altered if the action is unknown', () => {
    const state = this.store.getState()

    this.store.dispatch({
      type: 'gibberish'
    })

    expect(this.store.getState()).to.equal(state)
  })

  it('is immutable on CREATE_NOTE', () => {
    const state = this.store.getState()

    this.store.dispatch({
      type: actions.CREATE_NOTE
    })

    expect(this.store.getState()).not.to.equal(state)
  })

  it('is immutable on UPDATE_NOTE', () => {
    const stateBeforeCreate = this.store.getState()

    this.store.dispatch({
      type: actions.CREATE_NOTE
    })

    const stateBeforeUpdate = this.store.getState()

    this.store.dispatch({
      type: actions.UPDATE_NOTE,
      id: 0,
      content: 'Update'
    })

    expect(this.store.getState()).not.to.equal(stateBeforeCreate)
    expect(this.store.getState()).not.to.equal(stateBeforeUpdate)
  })

  it('is immutable on DELETE_NOTE', () => {
    const stateBeforeCreate = this.store.getState()

    this.store.dispatch({
      type: actions.CREATE_NOTE
    })

    const stateBeforeDelete = this.store.getState()

    this.store.dispatch({
      type: actions.DELETE_NOTE,
      id: 0
    })

    expect(this.store.getState()).not.to.equal(stateBeforeCreate)
    expect(this.store.getState()).not.to.equal(stateBeforeDelete)
  })

})

describe('Handlers', () => {

  beforeEach(() => {
    this.store = storeFactory.createStore()
  })

  it('can subscribe to the store', () => {
    expect(this.store.subscribe).to.be.a('Function')
  })

  it('that subscribed are called on dispatch', () => {
    const handler = sinon.fake()

    this.store.subscribe(handler)

    this.store.dispatch({
      type: actions.CREATE_NOTE
    })
    this.store.dispatch({
      type: actions.UPDATE_NOTE,
      id: 0,
      content: 'Update'
    })

    expect(handler).to.have.been.calledTwice
  })

  it('can unsubscribe', () => {
    const handler = sinon.fake()
    const unsubscribe = this.store.subscribe(handler)

    this.store.dispatch({
      type: actions.CREATE_NOTE
    })

    unsubscribe()

    this.store.dispatch({
      type: actions.UPDATE_NOTE,
      id: 0,
      content: 'Update'
    })

    expect(handler).to.have.been.calledOnce
  })

})

describe('Actions', () => {

  beforeEach(() => {
    this.store = storeFactory.createStore()
  })

  it('must not be null', () => {
    expect(this.store.dispatch).to.throw('Action must be an object')
  })

  it('must have a type', () => {
    expect(() => this.store.dispatch({})).to.throw('Action must have a type')
  })

})

describe('Middleware', () => {

  beforeEach(() => {
    this.innerDispatch = sinon.fake()
    this.store = storeFactory.createStore(() => () => this.innerDispatch)
  })

  it('is called on dispatch', () => {
    this.store.dispatch({
      type: actions.CREATE_NOTE
    })
    this.store.dispatch({
      type: actions.UPDATE_NOTE,
      id: 0,
      content: 'Update'
    })

    expect(this.innerDispatch).to.have.been.calledTwice
  })

})

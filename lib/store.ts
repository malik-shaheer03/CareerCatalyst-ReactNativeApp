"use client"

// lib/store.ts (or wherever you want to define your store)
import { createStore } from 'redux';

const rootReducer = (state = {}, action) => {
  // Your reducers here
  return state;
};

const store = createStore(rootReducer);

export default store;

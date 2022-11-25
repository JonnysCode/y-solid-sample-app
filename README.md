# IMP: Local-First Applications

## ToDo MVC React App with SyncedStore and a custom SOLID Provider

This example demonstrates how you can use SyncedStore to build a collaborative version of the [Todo MVC](http://todomvc.com) app.

It consists of a custom SOLID provider that can be used in addition to the other SyncedProviders to enable storage in decentralized data pods and fine grained access control to Yjs documents.

The code that sets up our store is defined in [src/store.ts](src/store.ts). By using the `useSyncedStore` hook, our React components (starting at [src/App.tsx](src/App.tsx)) are easy to read and update automatically.

# Live demo

- [Open live demo](https://3xemy.csb.app/) (Of course, open multiple times to test multiplayer)
- [Open source on Codesandbox](https://codesandbox.io/s/github/YousefED/SyncedStore/tree/main/examples/todo-react?file=/src/App.tsx)

# Running

    npm install
    npm start

🔥 Make sure to open multiple browsers to see the app syncing automatically.

## Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

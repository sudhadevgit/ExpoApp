const { ApolloGateway } = require('@apollo/gateway');
const { ApolloServer } = require('apollo-server');

const gateway = new ApolloGateway({
  serviceList: [
    { name: 'account', url: 'http://localhost:4001' },
    { name: 'devices', url: 'http://localhost:4002' }
  ]
});

const server = new ApolloServer({
  gateway,
  subscriptions: false,
  cors: {
    origin: '*', // Or specify the allowed origins here
  },
});

server.listen().then(({ url }) => {
  console.log(`🚀 Gateway ready at ${url}`);
});
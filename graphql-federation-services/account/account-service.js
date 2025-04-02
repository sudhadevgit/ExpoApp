const { ApolloServer, gql } = require('apollo-server');
const { buildFederatedSchema } = require('@apollo/federation');

// Sample data
let accounts = [
  { id: '1234', name: 'John Doe', email: 'john.doe@example.com', phone: '123-456-7890' }
];

// Federated Account Service schema
const typeDefs = gql`
  type Account @key(fields: "id") {
    id: ID!
    name: String!
    email: String!
    phone: String
    devices: [Device]
  }

  type Device @key(fields: "id") {
    id: ID!
  }

  extend type Query {
    getAccount(id: ID!): Account
    getAccounts: [Account]
  }

  extend type Mutation {
    createAccount(name: String!, email: String!, phone: String): Account
  }
`;

const resolvers = {
  Account: {
    __resolveReference: (account) => accounts.find(a => a.id === account.id),
    devices: (account) => {
      return [
        { __typename: "Device", id: '5678' },
        { __typename: "Device", id: '91011' }
      ];
    }
  },
  Query: {
    getAccount: (_, { id }) => accounts.find(account => account.id === id),
    getAccounts: () => accounts
  },
  Mutation: {
    createAccount: (_, { name, email, phone }) => {
      const newAccount = {
        id: `${Math.floor(Math.random() * 1000)}`,
        name,
        email,
        phone
      };
      accounts.push(newAccount);
      return newAccount;
    }
  }
//   Account: {
//     devices: (account) => {
//       return [
//         { id: '5678', name: "John's iPhone", type: 'smartphone', os: 'iOS', status: 'active', accountId: account.id },
//         { id: '91011', name: "John's Laptop", type: 'laptop', os: 'macOS', status: 'active', accountId: account.id }
//       ];
//     }
//   }
};

const server = new ApolloServer({
  schema: buildFederatedSchema([{ typeDefs, resolvers }])
});

server.listen({ port: 4001 }).then(({ url }) => {
  console.log(`Account service ready at ${url}`);
});

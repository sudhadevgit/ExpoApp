const { ApolloServer, gql } = require('apollo-server');
const { buildFederatedSchema } = require('@apollo/federation');

// Sample data
let devices = [
  { id: '5678', name: "John's iPhone", type: 'smartphone', status: 'active', accountId: '1234' },
  { id: '91011', name: "John's Laptop", type: 'laptop', status: 'active', accountId: '1234' }
];

// Federated Devices Service schema
const typeDefs = gql`
  input CreateDeviceInput {
    accountId: ID!
    name: String!
    type: String!
    status: String!
  }

  extend type Device @key(fields: "id") {
    id: ID! @external
    name: String!
    type: String!
    status: String!
    accountId: ID!
    account: Account
  }

  extend type Account @key(fields: "id") {
    id: ID! @external
    # Remove name since we're not using it
  }

  extend type Query {
    getDevice(id: ID!): Device
    getDevicesByAccount(accountId: ID!): [Device]
  }

  extend type Mutation {
    createDevice(input: CreateDeviceInput!): Device
  }
`;

const resolvers = {
  Device: {
    __resolveReference: (device) => devices.find(d => d.id === device.id),
    account: (device) => {
      // We only need to return the ID for federation to resolve the full Account
      return { __typename: "Account", id: device.accountId };
    }
  },
  Query: {
    getDevice: (_, { id }) => devices.find(device => device.id === id),
    getDevicesByAccount: (_, { accountId }) => devices.filter(device => device.accountId === accountId),
  },
  Mutation: {
    createDevice: (_, { input }) => {
      const newDevice = {
        id: `${Math.floor(Math.random() * 1000)}`,
        name: input.name,
        type: input.type,
        status: input.status,
        accountId: input.accountId
      };
      devices.push(newDevice);
      return newDevice;
    }
  }
//   Device: {
//     account: (device) => {
//       return { id: device.accountId, name: "John Doe" };
//     }
//   }
};

const server = new ApolloServer({
  schema: buildFederatedSchema([{ typeDefs, resolvers }])
});

server.listen({ port: 4002 }).then(({ url }) => {
  console.log(`Devices service ready at ${url}`);
});

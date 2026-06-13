import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { IntrospectAndCompose, ApolloGateway } from '@apollo/gateway';

async function startGateway() {
  const gateway = new ApolloGateway({
    supergraphSdl: new IntrospectAndCompose({
      subgraphs: [
        { name: 'alerts', url: 'http://localhost:8001/graphql' },
        { name: 'timeline', url: 'http://localhost:8002/graphql' },
      ],
      pollIntervalInMs: 2000,
    }),
  });

  const server = new ApolloServer({
    gateway,
  });

  try {
    const { url } = await startStandaloneServer(server, {
      listen: { port: 4000 },
    });
    console.log(`🚀 Gateway ready at ${url}`);
  } catch (e) {
    console.error("Failed to start gateway immediately, retrying in 5s...", e);
    setTimeout(startGateway, 5000);
  }
}

// Add a slight delay for subgraphs to spin up during local dev script
setTimeout(startGateway, 3000);

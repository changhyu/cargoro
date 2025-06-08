import dotenv from 'dotenv';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema, introspectionFromSchema } from 'graphql';
import { app } from './server';
import { config } from './config';
import { logger } from './utils/logger';

// 환경 변수 로드
dotenv.config();

// 샘플 GraphQL 스키마 (실제 프로젝트에서는 분리된 파일로 관리)
const schema = buildSchema(`
  type Query {
    hello: String
    users: [User!]!
    user(id: ID!): User
  }

  type Mutation {
    createUser(name: String!, email: String!): User!
    updateUser(id: ID!, name: String, email: String): User
    deleteUser(id: ID!): ID!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    createdAt: String!
  }
`);

// 샘플 데이터
const users = [
  {
    id: '1',
    name: '홍길동',
    email: 'hong@example.com',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: '김철수',
    email: 'kim@example.com',
    createdAt: new Date().toISOString(),
  },
];

// GraphQL 리졸버
const root = {
  hello: () => 'Hello, GraphQL!',
  users: () => users,
  user: ({ id }: { id: string }) => users.find(user => user.id === id),
  createUser: ({ name, email }: { name: string; email: string }) => {
    const id = String(users.length + 1);
    const newUser = {
      id,
      name,
      email,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    return newUser;
  },
  updateUser: ({ id, name, email }: { id: string; name?: string; email?: string }) => {
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new Error(`User with id ${id} not found`);
    }

    const updatedUser = {
      ...users[userIndex],
      ...(name && { name }),
      ...(email && { email }),
    };

    users[userIndex] = updatedUser;
    return updatedUser;
  },
  deleteUser: ({ id }: { id: string }) => {
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new Error(`User with id ${id} not found`);
    }

    users.splice(userIndex, 1);
    return id;
  },
};

// GraphQL 엔드포인트 설정
app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: false, // 개발 환경에서만 활성화 (프로덕션에서는 비활성화)
    pretty: process.env.NODE_ENV !== 'production',
  })
);

// GraphiQL 설정 (개발 환경에서만 사용)
app.get('/graphiql', (_req, res) => {
  // GraphiQL HTML 템플릿
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>GraphiQL</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/graphiql/2.4.7/graphiql.min.css" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/graphiql/2.4.7/graphiql.min.js"></script>
      </head>
      <body style="margin: 0; height: 100vh; width: 100vw;">
        <div id="graphiql" style="height: 100vh;"></div>
        <script>
          const fetchFn = function(url, options) {
            options.url = url;
            return fetch('/graphql', options);
          };
          ReactDOM.render(
            React.createElement(GraphiQL, { fetcher: fetchFn }),
            document.getElementById('graphiql')
          );
        </script>
      </body>
    </html>
  `);
});

// GraphQL 스키마 내보내기 (개발 도구용)
app.get('/graphql/schema', (_req, res) => {
  const introspection = introspectionFromSchema(schema);
  res.json(introspection);
});

// 서버 시작
const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
  logger.info(`GraphiQL interface: http://localhost:${PORT}/graphiql`);
  logger.info(`API documentation: http://localhost:${PORT}/api-docs`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
});

// 애플리케이션 종료 처리
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

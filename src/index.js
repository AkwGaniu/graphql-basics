import { GraphQLServer } from "graphql-yoga";
import { uuid } from "uuidv4";

const typeDefs = `
  type Query {
    greeting(name: String, position: String):String!
    add(numbers: [Float!]!): Float!
    hello: String!
    name: String!
    location: String!
    bio: String!
    me: User!
    comment(id: String!): Comment
    users(query: String): [User!]!
    posts(query: String): [Post!]!
    comments(query: String): [Comment!]!
  }

  type Mutation {
    createUser(data: CreateUserInput): User!
    createPost(data: CreatePostInput): Post!
    createComment(data: CreateCommentInput): Comment!
  }

  input CreateUserInput {
    name: String!,
     email: String!, 
     age: Int    
  }

  input CreatePostInput {
    title: String!,
    published: Boolean!,
    author: String!
  }

  input CreateCommentInput {
    text: String!, 
    post: String!,
    author: String!
  }
  
  type User { 
    id: ID!
    name: String!
    email: String!
    age: Int 
    posts: [Post!]!
    comments: [Comment!]!
  }

  type Post {
    id: ID!
    title: String!
    published: Boolean!
    author: User!
    comments: [Comment!]!
  }

  type Comment {
    id: ID!
    text: String!
    author: User!
    post: Post!
  }
`;

const users = [
  {
    id: "id12345",
    name: "Ganiu",
    email: "ganiu@usebreeze.io",
    age: 21,
  },
  {
    id: "id1248uij",
    name: "Abayomi",
    email: "abayomi@usebreeze.io",
    age: 18,
  },
];

const posts = [
  {
    id: "po22345",
    title: "First day at school",
    published: true,
    author: "id12345",
  },
  {
    id: "po23435",
    title: "First day at school",
    published: false,
    author: "id1248uij",
  },
  {
    id: "po2345y",
    title: "First day at the market",
    published: false,
    author: "id12345",
  },
  {
    id: "po23re45",
    title: "First day at work",
    published: false,
    author: "id1248uij",
  },
];

const comments = [
  {
    id: "cm110201",
    text: "This is a simple comment",
    author: "id12345",
    post: "po23435",
  },
  {
    id: "cm1y67378",
    text: "This is a what you call a comment",
    author: "id12345",
    post: "po23435",
  },
  {
    id: "cm1u809301",
    text: "This is a another comment",
    author: "id12345",
    post: "po23435",
  },
  {
    id: "cm136328",
    text: "This is a comment for the boss",
    author: "id12345",
    post: "po23435",
  },
];

const resolvers = {
  Query: {
    hello: () => `Hello Gee "World"}`,

    name: () => `Ganiu`,

    location: () => `Igbe Oloja`,

    bio: () =>
      `I'm an astute programmers with years of experince in sofotware development`,
    greeting(parent, args, ctx, info) {
      return args.name && args.position
        ? `Hello ${args.name}, you are my favourite ${args.position}`
        : `Hello!`;
    },

    add(parent, args, ctx, info) {
      if (args.numbers.length <= 0) {
        return 0;
      }

      return args.numbers.reduce((sum, currentValue) => {
        return sum + currentValue;
      });
    },

    me: (parent, args, ctx, info) =>
      users.find((user) => user.id === "id12345"),

    users(parent, args, ctx, info) {
      if (!args.query) return users;
      return users.filter((user) => {
        return user.name.toLowerCase().includes(args.query.toLowerCase());
      });
    },

    posts(parent, args, ctx, info) {
      if (!args.query) return posts;

      return posts.filter((post) => {
        return post.title.toLowerCase().includes(args.query.toLowerCase());
      });
    },

    comment: (parent, args, ctx, info) =>
      comments.find((comment) => comment.id === args.id),

    comments(parent, args, ctx, info) {
      if (!args.query) return comments;

      return comments.filter((comment) => {
        return comment.text.toLowerCase().includes(args.query.toLowerCase());
      });
    },
  },

  Mutation: {
    createUser(parent, args, ctx, info) {
      const userExist = users.some((user) => user.email === args.data.email);

      if (userExist) throw new Error("Email taken");

      const newUser = {
        id: uuid(),
        ...args.data,
      };

      users.push(newUser);

      return newUser;
    },

    createPost(parent, args, ctx, info) {
      const userExist = users.some((user) => user.id === args.author);

      if (!userExist) throw new Error("User not found");

      const newPost = {
        id: uuid(),
        ...args,
      };

      posts.push(newPost);

      return newPost;
    },

    createComment(parent, args, ctx, info) {
      const userExist = users.some((user) => user.id === args.author);

      if (!userExist) throw new Error("User not found");

      const postExist = posts.find((post) => post.id === args.post);

      if (!postExist) throw new Error("Post not found");

      if (!postExist.published)
        throw new Error("You can't comment on an unpublished post");

      const newComment = {
        id: uuid(),
        ...args,
      };

      comments.push(newComment);

      return newComment;
    },
  },

  Post: {
    author(parent, args, ctx, info) {
      return users.find((user) => user.id === parent.author);
    },
    comments(parent, args, ctx, info) {
      return comments.filter((comment) => comment.post === parent.id);
    },
  },

  User: {
    posts(parent, args, ctx, info) {
      return posts.filter((post) => post.author === parent.id);
    },
    comments(parent, args, ctx, info) {
      return comments.filter((comment) => comment.author === parent.id);
    },
  },

  Comment: {
    author(parent, args, ctx, info) {
      return users.find((user) => user.id === parent.author);
    },
    post(parent, args, ctx, info) {
      return posts.find((post) => post.id === parent.post);
    },
  },
};

const server = new GraphQLServer({ typeDefs, resolvers });
server.start(() => console.log("Server is running on localhost:4000"));

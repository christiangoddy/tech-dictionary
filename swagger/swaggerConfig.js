const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Tech Dictionary API',
            version: '1.0.0',
            description: 'API for a tech dictionary application',
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Local server',
            },
        ],
        components: {
            schemas: {
                Word: {
                    type: 'object',
                    required: ['term', 'class', 'meaning', 'pronunciation', 'history', 'example'],
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Auto-generated ID of the word',
                        },
                        term: {
                            type: 'string',
                            description: 'The term of the word',
                        },
                        class: {
                            type: 'string',
                            description: 'The grammatical class of the word (e.g., noun, verb)',
                        },
                        meaning: {
                            type: 'string',
                            description: 'The meaning of the word',
                        },
                        pronunciation: {
                            type: 'string',
                            description: 'The correct pronunciation of the word',
                        },
                        history: {
                            type: 'string',
                            description: 'The origin or history of the word',
                        },
                        example: {
                            type: 'string',
                            description: 'Example usage of the word in a sentence',
                        },
                        status: {
                            type: 'string',
                            description: 'The status of the word (Active or Pending)',
                        },
                        lookUpTimes: {
                            type: 'integer',
                            description: 'The number of times the word has been looked up',
                        },
                        addedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'The date the word was added',
                        },
                    },
                },
                User: {
                    type: 'object',
                    required: ['name', 'email', 'role'],
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Auto-generated ID of the user',
                        },
                        name: {
                            type: 'string',
                            description: 'Name of the user',
                        },
                        email: {
                            type: 'string',
                            description: 'Email of the user',
                        },
                        role: {
                            type: 'string',
                            description: 'Role of the user (Admin, SuperAdmin, GeneralUser)',
                        },
                    },
                },
                UserRequest: {
                    type: 'object',
                    required: ['word', 'type', 'description'],
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Auto-generated ID of the user request',
                        },
                        word: {
                            type: 'string',
                            description: 'The word related to the request',
                        },
                        type: {
                            type: 'string',
                            description: 'Type of the request (Change, New)',
                        },
                        description: {
                            type: 'string',
                            description: 'Description of the request',
                        },
                        status: {
                            type: 'string',
                            description: 'Status of the request (Open, Resolved)',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'The date the request was created',
                        },
                    },
                },
                Analytics: {
                    type: 'object',
                    properties: {
                        userActivity: {
                            type: 'object',
                            properties: {
                                uniqueVisitors: { type: 'integer' },
                                searchesPerformed: { type: 'integer' },
                                popularSearchTerms: {
                                    type: 'array',
                                    items: { type: 'string' },
                                },
                            },
                        },
                        wordAnalytics: {
                            type: 'object',
                            properties: {
                                totalWords: { type: 'integer' },
                                activeWords: { type: 'integer' },
                                pendingWords: { type: 'integer' },
                                newWords: { type: 'integer' },
                                updatedWords: { type: 'integer' },
                                frequentlyLookedUpWords: {
                                    type: 'array',
                                    items: { type: 'string' },
                                },
                                leastFrequentlyLookedUpWords: {
                                    type: 'array',
                                    items: { type: 'string' },
                                },
                            },
                        },
                        userRequestAnalytics: {
                            type: 'object',
                            properties: {
                                totalRequests: { type: 'integer' },
                                openRequests: { type: 'integer' },
                                resolvedRequests: { type: 'integer' },
                                newRequests: { type: 'integer' },
                                averageResolveTime: { type: 'string' },
                                requestTypeBreakdown: {
                                    type: 'object',
                                    properties: {
                                        wordChange: { type: 'integer' },
                                        newWord: { type: 'integer' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        paths: {},
    },
    apis: ['./routes/*.js'], // Path to the API docs
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = swaggerDocs;


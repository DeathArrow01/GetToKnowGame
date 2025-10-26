// MongoDB initialization script
db = db.getSiblingDB('GetToKnowGame');

// Create collections with validation
db.createCollection('questions', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["section", "questionText"],
      properties: {
        section: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        questionText: {
          bsonType: "string",
          description: "must be a string and is required"
        }
      }
    }
  }
});

db.createCollection('players', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name"],
      properties: {
        name: {
          bsonType: "string",
          description: "must be a string and is required"
        }
      }
    }
  }
});

db.createCollection('sessions', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["player1Name", "player2Name", "createdAt"],
      properties: {
        player1Name: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        player2Name: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        createdAt: {
          bsonType: "date",
          description: "must be a date and is required"
        }
      }
    }
  }
});

db.createCollection('tracking', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["playerId", "event", "time"],
      properties: {
        playerId: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        event: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        time: {
          bsonType: "date",
          description: "must be a date and is required"
        }
      }
    }
  }
});

// Create indexes for better performance
db.questions.createIndex({ "section": 1 });
db.sessions.createIndex({ "createdAt": -1 });
db.sessions.createIndex({ "player1Name": 1 });
db.sessions.createIndex({ "player2Name": 1 });
db.tracking.createIndex({ "playerId": 1 });
db.tracking.createIndex({ "time": -1 });
db.tracking.createIndex({ "event": 1 });

print('Database initialized successfully!');

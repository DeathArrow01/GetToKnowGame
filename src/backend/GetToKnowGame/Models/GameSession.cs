using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace GetToKnowGame.Models
{
    public class GameSession
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = string.Empty;

        [BsonElement("player1Id")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Player1Id { get; set; } = string.Empty;

        [BsonElement("player2Id")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Player2Id { get; set; }

        [BsonElement("player1Answers")]
        public List<PlayerAnswer> Player1Answers { get; set; } = new();

        [BsonElement("player2Answers")]
        public List<PlayerAnswer>? Player2Answers { get; set; }

        [BsonElement("compatibilityScore")]
        public int? CompatibilityScore { get; set; }
    }
}

using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace GetToKnowGame.Models
{
    public class Question
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = string.Empty;

        [BsonElement("section")]
        public string Section { get; set; } = string.Empty;

        [BsonElement("questionText")]
        public string QuestionText { get; set; } = string.Empty;
    }
}

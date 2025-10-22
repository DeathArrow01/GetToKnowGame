using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace GetToKnowGame.Models
{
    public class PlayerAnswer
    {
        [BsonElement("questionId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string QuestionId { get; set; } = string.Empty;

        [BsonElement("response")]
        public string Response { get; set; } = string.Empty;
    }
}

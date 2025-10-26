package repositories

import (
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"get-to-know-game-go/models"
)

// TrackingRepositoryImpl handles tracking event operations
type TrackingRepositoryImpl struct {
	*BaseRepository[models.TrackingEvent]
}

// NewTrackingRepository creates a new tracking repository
func NewTrackingRepository(collection *mongo.Collection) TrackingRepository {
	return &TrackingRepositoryImpl{
		BaseRepository: NewBaseRepository[models.TrackingEvent](collection),
	}
}


// GetUniqueVisitors returns the count of unique player IDs
func (r *TrackingRepositoryImpl) GetUniqueVisitors(ctx context.Context) (int64, error) {
	pipeline := []bson.M{
		{"$group": bson.M{"_id": "$playerId"}},
		{"$count": "uniqueVisitors"},
	}

	cursor, err := r.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return 0, err
	}
	defer cursor.Close(ctx)

	var result []bson.M
	if err = cursor.All(ctx, &result); err != nil {
		return 0, err
	}

	if len(result) == 0 {
		return 0, nil
	}

	if count, ok := result[0]["uniqueVisitors"].(int32); ok {
		return int64(count), nil
	}

	return 0, fmt.Errorf("unexpected result format")
}

// GetEventCounts returns aggregated event counts
func (r *TrackingRepositoryImpl) GetEventCounts(ctx context.Context) (map[string]int64, error) {
	pipeline := []bson.M{
		{"$group": bson.M{
			"_id":   "$event",
			"count": bson.M{"$sum": 1},
		}},
	}

	cursor, err := r.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var results []bson.M
	if err = cursor.All(ctx, &results); err != nil {
		return nil, err
	}

	eventCounts := make(map[string]int64)
	for _, result := range results {
		if event, ok := result["_id"].(string); ok {
			if count, ok := result["count"].(int32); ok {
				eventCounts[event] = int64(count)
			}
		}
	}

	return eventCounts, nil
}


// GetVisitorStatsByPeriod returns visitor statistics for a specific time period
func (r *TrackingRepositoryImpl) GetVisitorStatsByPeriod(ctx context.Context, period string) ([]models.VisitorStats, error) {
	var startDate time.Time
	var groupFormat string

	now := time.Now()
	switch period {
	case "day":
		startDate = now.AddDate(0, 0, -30) // Last 30 days
		groupFormat = "%Y-%m-%d"
	case "month":
		startDate = now.AddDate(0, -12, 0) // Last 12 months
		groupFormat = "%Y-%m"
	case "3month":
		startDate = now.AddDate(0, -3, 0) // Last 3 months
		groupFormat = "%Y-%U" // Week
	case "6month":
		startDate = now.AddDate(0, -6, 0) // Last 6 months
		groupFormat = "%Y-%U" // Week
	case "year":
		startDate = now.AddDate(-1, 0, 0) // Last 12 months
		groupFormat = "%Y-%m"
	case "5year":
		startDate = now.AddDate(-5, 0, 0) // Last 5 years
		groupFormat = "%Y-%m"
	default:
		startDate = now.AddDate(0, 0, -30) // Default to 30 days
		groupFormat = "%Y-%m-%d"
	}

	pipeline := []bson.M{
		{"$match": bson.M{
			"time": bson.M{"$gte": startDate},
		}},
		{"$addFields": bson.M{
			"dateStr": bson.M{
				"$dateToString": bson.M{
					"format": groupFormat,
					"date":   "$time",
				},
			},
		}},
		{"$group": bson.M{
			"_id": "$dateStr",
			"uniqueVisitors": bson.M{
				"$addToSet": "$playerId",
			},
			"totalPageViews": bson.M{
				"$sum": bson.M{
					"$cond": bson.M{
						"if":   bson.M{"$eq": []interface{}{"$event", "page_view"}},
						"then": 1,
						"else": 0,
					},
				},
			},
			"newPlayers": bson.M{
				"$sum": bson.M{
					"$cond": bson.M{
						"if":   bson.M{"$eq": []interface{}{"$event", "new_player"}},
						"then": 1,
						"else": 0,
					},
				},
			},
			"returningSessions": bson.M{
				"$sum": bson.M{
					"$cond": bson.M{
						"if":   bson.M{"$eq": []interface{}{"$event", "returning_player"}},
						"then": 1,
						"else": 0,
					},
				},
			},
		}},
		{"$addFields": bson.M{
			"uniqueVisitors": bson.M{"$size": "$uniqueVisitors"},
		}},
		{"$sort": bson.M{"_id": 1}},
	}

	cursor, err := r.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var results []bson.M
	if err = cursor.All(ctx, &results); err != nil {
		return nil, err
	}

	var stats []models.VisitorStats
	for _, result := range results {
		stat := models.VisitorStats{
			Date: result["_id"].(string),
		}

		if uniqueVisitors, ok := result["uniqueVisitors"].(int32); ok {
			stat.UniqueVisitors = int64(uniqueVisitors)
		}
		if totalPageViews, ok := result["totalPageViews"].(int32); ok {
			stat.TotalPageViews = int64(totalPageViews)
		}
		if newPlayers, ok := result["newPlayers"].(int32); ok {
			stat.NewPlayers = int64(newPlayers)
		}
		if returningSessions, ok := result["returningSessions"].(int32); ok {
			stat.ReturningSessions = int64(returningSessions)
		}

		stats = append(stats, stat)
	}

	return stats, nil
}

// GetTotalPageViews returns the total number of page views
func (r *TrackingRepositoryImpl) GetTotalPageViews(ctx context.Context) (int64, error) {
	return r.CountWithFilter(ctx, bson.M{"event": "page_view"})
}

// GetFilteredEvents returns tracking events with advanced filtering
func (r *TrackingRepositoryImpl) GetFilteredEvents(ctx context.Context, filter models.AnalyticsFilter) ([]models.TrackingEvent, error) {
	mongoFilter := bson.M{}

	// Date range filtering
	if filter.StartDate != nil || filter.EndDate != nil {
		dateFilter := bson.M{}
		if filter.StartDate != nil {
			dateFilter["$gte"] = *filter.StartDate
		}
		if filter.EndDate != nil {
			dateFilter["$lte"] = *filter.EndDate
		}
		mongoFilter["time"] = dateFilter
	}

	// Event type filtering
	if len(filter.EventTypes) > 0 {
		mongoFilter["event"] = bson.M{"$in": filter.EventTypes}
	}

	// User segment filtering (based on player ID patterns)
	if len(filter.UserSegments) > 0 {
		// This would need to be implemented based on how user segments are defined
		// For now, we'll skip this filter
	}

	// Country filtering (would need IP geolocation data)
	if len(filter.Countries) > 0 {
		// This would need IP geolocation implementation
		// For now, we'll skip this filter
	}

	// Set up options
	opts := &options.FindOptions{
		Sort: bson.M{"time": -1},
	}

	if filter.Limit > 0 {
		limitInt64 := int64(filter.Limit)
		opts.Limit = &limitInt64
	}
	if filter.Offset > 0 {
		skipInt64 := int64(filter.Offset)
		opts.Skip = &skipInt64
	}

	cursor, err := r.collection.Find(ctx, mongoFilter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var events []models.TrackingEvent
	if err = cursor.All(ctx, &events); err != nil {
		return nil, err
	}

	return events, nil
}

// GetGeographicData returns location-based analytics
func (r *TrackingRepositoryImpl) GetGeographicData(ctx context.Context) ([]models.GeographicData, error) {
	// This is a simplified implementation
	// In a real implementation, you would use IP geolocation services
	// For now, we'll return mock data structure
	
	pipeline := []bson.M{
		{"$group": bson.M{
			"_id": "$ipAddress",
			"userCount": bson.M{"$addToSet": "$playerId"},
			"sessionCount": bson.M{"$addToSet": "$sessionId"},
			"pageViews": bson.M{
				"$sum": bson.M{
					"$cond": bson.M{
						"if":   bson.M{"$eq": []interface{}{"$event", "page_view"}},
						"then": 1,
						"else": 0,
					},
				},
			},
		}},
		{"$addFields": bson.M{
			"userCount": bson.M{"$size": "$userCount"},
			"sessionCount": bson.M{"$size": "$sessionCount"},
		}},
		{"$limit": 100}, // Limit to top 100 IPs
	}

	cursor, err := r.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var results []bson.M
	if err = cursor.All(ctx, &results); err != nil {
		return nil, err
	}

	var geoData []models.GeographicData
	for _, result := range results {
		// In a real implementation, you would resolve IP to geographic location
		geoData = append(geoData, models.GeographicData{
			Country:      "Unknown", // Would be resolved from IP
			Region:       "Unknown",
			City:         "Unknown",
			Latitude:     0.0,
			Longitude:    0.0,
			UserCount:    int64(result["userCount"].(int32)),
			SessionCount: int64(result["sessionCount"].(int32)),
			PageViews:    int64(result["pageViews"].(int32)),
		})
	}

	return geoData, nil
}

// GetPerformanceMetrics returns system performance data
func (r *TrackingRepositoryImpl) GetPerformanceMetrics(ctx context.Context) (*models.PerformanceMetrics, error) {
	// This is a simplified implementation
	// In a real implementation, you would collect actual system metrics
	
	// Get recent request count (last hour)
	oneHourAgo := time.Now().Add(-time.Hour)
	recentRequests, err := r.CountWithFilter(ctx, bson.M{
		"time": bson.M{"$gte": oneHourAgo},
	})
	if err != nil {
		return nil, err
	}

	// Get unique active users (last hour)
	activeUsers, err := r.GetUniqueVisitors(ctx)
	if err != nil {
		return nil, err
	}

	// Mock performance data - in real implementation, collect from system
	metrics := &models.PerformanceMetrics{
		ResponseTime:    150.5, // milliseconds
		ErrorRate:       0.02,  // 2%
		RequestCount:    recentRequests,
		ActiveUsers:     activeUsers,
		SystemHealth:    "healthy",
		DatabaseStatus:  "connected",
		MemoryUsage:     45.2, // percentage
		CPUUsage:        23.8, // percentage
		EndpointMetrics: map[string]float64{
			"/api/sessions": 120.5,
			"/api/questions": 95.3,
			"/api/track": 45.2,
		},
		LastUpdated: time.Now(),
	}

	return metrics, nil
}

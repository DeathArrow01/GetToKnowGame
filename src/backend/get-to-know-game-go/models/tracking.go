package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// TrackingEvent represents a tracking event
type TrackingEvent struct {
	ID        primitive.ObjectID     `bson:"_id,omitempty" json:"id"`
	PlayerID  string                 `bson:"playerId" json:"playerId"`
	Event     string                 `bson:"event" json:"event"`
	URL       string                 `bson:"url" json:"url"`
	Time      time.Time              `bson:"time" json:"time"`
	UserAgent string                 `bson:"userAgent" json:"userAgent"`
	Referrer  string                 `bson:"referrer" json:"referrer"`
	IPAddress string                 `bson:"ipAddress" json:"ipAddress"`
	SessionID string                 `bson:"sessionId,omitempty" json:"sessionId,omitempty"`
	Data      map[string]interface{} `bson:"data,omitempty" json:"data,omitempty"`
}

// AdminStats represents admin dashboard statistics
type AdminStats struct {
	TotalPlayers        int64                    `json:"totalPlayers"`
	TotalSessions       int64                    `json:"totalSessions"`
	CompletedSessions   int64                    `json:"completedSessions"`
	AverageScore        float64                  `json:"averageScore"`
	SessionsBySection   map[string]int64         `json:"sessionsBySection"`
	UniqueVisitors      int64                    `json:"uniqueVisitors"`
	TotalPageViews      int64                    `json:"totalPageViews"`
	AverageSessionTime  float64                  `json:"averageSessionTime"`
	TopEvents           map[string]int64         `json:"topEvents"`
	RecentSessions      []SessionAnalytics       `json:"recentSessions"`
}

// SessionAnalytics represents session analytics data
type SessionAnalytics struct {
	SessionID     string     `bson:"sessionId" json:"sessionId"`
	Player1ID     string     `bson:"player1Id" json:"player1Id"`
	Player2ID     *string    `bson:"player2Id,omitempty" json:"player2Id,omitempty"`
	Player1Name   string     `bson:"player1Name" json:"player1Name"`
	Player2Name   *string    `bson:"player2Name,omitempty" json:"player2Name,omitempty"`
	CreatedAt     time.Time  `bson:"createdAt" json:"createdAt"`
	CompletedAt   *time.Time `bson:"completedAt,omitempty" json:"completedAt,omitempty"`
	Score         *int       `bson:"score,omitempty" json:"score,omitempty"`
	IPAddress     string     `bson:"ipAddress" json:"ipAddress"`
	Duration      *int64     `bson:"duration,omitempty" json:"duration,omitempty"` // in seconds
	PageViews     int        `bson:"pageViews" json:"pageViews"`
	Events        []string   `bson:"events" json:"events"`
}

// VisitorStats represents time-series visitor data for graphs
type VisitorStats struct {
	Date              string  `json:"date"`
	UniqueVisitors    int64   `json:"uniqueVisitors"`
	TotalPageViews    int64   `json:"totalPageViews"`
	NewPlayers        int64   `json:"newPlayers"`
	ReturningSessions int64   `json:"returningSessions"`
	GrowthPercentage  float64 `json:"growthPercentage,omitempty"`
}

// TrackingRequest represents the request body for tracking events
type TrackingRequest struct {
	ID        string                 `json:"id"`
	Event     string                 `json:"event"`
	URL       string                 `json:"url"`
	Time      int64                  `json:"time"`
	UserAgent string                 `json:"userAgent"`
	Referrer  string                 `json:"referrer"`
	Data      map[string]interface{} `json:"data,omitempty"`
}

// AnalyticsFilter represents filtering options for analytics queries
type AnalyticsFilter struct {
	StartDate    *time.Time `json:"startDate,omitempty"`
	EndDate      *time.Time `json:"endDate,omitempty"`
	EventTypes   []string   `json:"eventTypes,omitempty"`
	UserSegments []string   `json:"userSegments,omitempty"`
	Countries    []string   `json:"countries,omitempty"`
	Limit        int        `json:"limit,omitempty"`
	Offset       int        `json:"offset,omitempty"`
}

// PerformanceMetrics represents system performance data
type PerformanceMetrics struct {
	ResponseTime     float64            `json:"responseTime"`
	ErrorRate        float64            `json:"errorRate"`
	RequestCount     int64              `json:"requestCount"`
	ActiveUsers      int64              `json:"activeUsers"`
	SystemHealth     string             `json:"systemHealth"`
	DatabaseStatus   string             `json:"databaseStatus"`
	MemoryUsage      float64            `json:"memoryUsage"`
	CPUUsage         float64            `json:"cpuUsage"`
	EndpointMetrics  map[string]float64 `json:"endpointMetrics"`
	LastUpdated      time.Time          `json:"lastUpdated"`
}

// GeographicData represents location-based analytics
type GeographicData struct {
	Country     string  `json:"country"`
	Region      string  `json:"region"`
	City        string  `json:"city"`
	Latitude    float64 `json:"latitude"`
	Longitude   float64 `json:"longitude"`
	UserCount   int64   `json:"userCount"`
	SessionCount int64  `json:"sessionCount"`
	PageViews   int64   `json:"pageViews"`
}

package models

// ResponseType constants for player answers
const (
	Yay      = "Yay!"
	Nay      = "Nay!"
	DontCare = "I don't care!"
)

// AllResponseTypes returns all possible response types
func AllResponseTypes() []string {
	return []string{Yay, Nay, DontCare}
}

package messages

const (
	NEW_USER_JOINED = iota
	USER_LEFT
	MESSAGE_SENT
)

type MessageCode int

type Message[T any] struct {
	Code MessageCode `json:"code"`
	Data T           `json:"data"`
}

type MessageData struct {
	Username string `json:"username"`
	Text     string `json:"text"`
}

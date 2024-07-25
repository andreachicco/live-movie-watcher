package room

import (
	"github.com/andreachicco/gows"
)

type Connection struct {
	Username string
	Ws       *gows.WebSocket
}

func (c *Connection) IsConnected(room *Room) bool {
	for i := 0; i < room.NPartecipants; i++ {
		if room.Clients[i].Username == c.Username {
			return true
		}
	}

	return false
}

func (c *Connection) LeaveRoom(room *Room) {

	slide := false
	room.NPartecipants -= 1

	for i := 0; i < room.NPartecipants; i++ {
		if room.Clients[i].Username == c.Username {
			slide = true
		}

		if slide {
			room.Clients[i] = room.Clients[i+1]
		}
	}

	room.Clients = room.Clients[:room.NPartecipants]
}

func (c *Connection) BroadcastTo(room *Room, frame *gows.Frame) {
	for i := 0; i < room.NPartecipants; i++ {
		client := room.Clients[i]

		if client.Username != c.Username {
			client.Ws.Send(frame)
		}
	}
}

type Room struct {
	Name          string
	NPartecipants int
	Clients       []*Connection
}

var TestRoom *Room

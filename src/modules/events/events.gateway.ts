import {
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

type Message = {
  socketId: string;
  text: string;
  name: string;
  time: string;
};

type User = {
  id: string;
  name: string;
};

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  afterInit(server) {
    server.on('connection', (socket) => {
      this.server.emit('chat', { onlineUsers: this.users });
      socket.on('disconnect', () => {
        this.users = this.users.filter((user) => user.id !== socket.id);
        this.server.emit('chat', { onlineUsers: this.users });
      });
    });
  }

  users: User[] = [];

  @SubscribeMessage('chat')
  chat(@MessageBody() message: Message): any {
    this.addUser(message.socketId, message.name);
    this.server.emit('chat', { message, onlineUsers: this.users });
  }

  private addUser(socketId: string, name: string) {
    // check if user already exists
    if (this.users.some((user) => user.id === socketId)) return;

    this.users.push({ id: socketId, name });
    // update online users to all clients
    this.server.emit('chat', { onlineUsers: this.users });
  }
}

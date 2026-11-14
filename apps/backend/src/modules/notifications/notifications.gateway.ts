import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';

import {
  Injectable,
} from '@nestjs/common';

import {
  JwtService,
} from '@nestjs/jwt';

import {
  Server,
  Socket,
} from 'socket.io';

@WebSocketGateway({

  cors: {

    origin: '*',

  },

})
@Injectable()

export class NotificationsGateway
  implements OnGatewayConnection
{
     constructor(
        private jwtService: JwtService,
    ) {}

  @WebSocketServer()

  server!: Server;

  handleConnection(
    client: Socket,
    ) {

    try {

        const token =
        client.handshake.auth?.token;

        if (!token) {

        client.disconnect();

        return;

        }

        const payload =
        this.jwtService.verify(
            token,
        );

        client.join(
        `user:${payload.sub}`,
        );

        console.log(

        `User ${payload.sub} joined room user:${payload.sub}`,

        );

    } catch (error) {

        console.error(error);

        client.disconnect();

        }

    }

    sendNotification(
    userId: string,
    notification: any,
    ) {

    this.server
        .to(`user:${userId}`)
        .emit(
        'notification',
        notification,
        );

    }
}
import { defer } from 'rxjs';

import { Component, model, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { RouterOutlet } from '@angular/router';
import * as signalr from '@microsoft/signalr';

import { IMessageInfo } from '../data-types/IMessageInfo';

@Component({
  selector: 'app-root',
  imports: [
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatTableModule,
    RouterOutlet
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {

  private chatConnection: signalr.HubConnection | null = null;

  protected readonly title = signal<string>('angular-client');

  public userName = model<string>('');
  public inputText = model<string>('');
  public messages = model<IMessageInfo[]>([]);

  public ngOnInit(): void {
    const connection = new signalr.HubConnectionBuilder()
      .withUrl('http://localhost:5180/chat')
      .withAutomaticReconnect()
      .build();

    this.chatConnection = connection;

    defer(() => connection.start())
      .subscribe({
        next: () => {
          connection.on('receivedMessage', (userName: string, message: string) => {
            console.log(`Message received from ${userName}: ${message}`);
            this.messages.update((prev) => [...prev, { userName, message }]);
          });
        },
        error: (e) => {
          console.error('Error connecting to SignalR hub:', e);
        }
      });
  }

  public ngOnDestroy(): void {
    this.chatConnection?.stop();
  }

  public sendMessage(): void {
    const connection = this.chatConnection;
    if (!!connection && connection.state === signalr.HubConnectionState.Connected && !!this.inputText().trim()) {
      defer(() => connection.send('sendMessage', this.userName(), this.inputText()))
        .subscribe({
          next: () => {
            this.inputText.set('');
          },
          error: (e) => {
            console.error('Error sending message:', e);
          },
        });
    }
  }

}

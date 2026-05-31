import './App.css';

import React, { useEffect, useState } from 'react';
import { Button, Container, Form, InputGroup, Table } from 'react-bootstrap';

import * as signalr from '@microsoft/signalr';

import { IMessageInfo } from './data-types/IMessageInfo';

export default function App(): React.JSX.Element {

  const [chatConnection, setChatConnection] = useState<signalr.HubConnection | null>(null);

  const [userName, setUserName] = useState<string>('');
  const [inputText, setInputText] = useState<string>('');
  const [messages, setMessages] = useState<IMessageInfo[]>([]);

  useEffect(() => {
    const connection = new signalr.HubConnectionBuilder()
      .withUrl('http://localhost:5180/chat')
      .withAutomaticReconnect()
      .build();

    setChatConnection(connection);

    connection.start()
      .then(() => {
        console.log('Connected to SignalR hub');

        connection.on('receivedMessage', (userName: string, message: string) => {
          console.log(`Message received from ${userName}: ${message}`);
          setMessages(prev => [...prev, { userName, message }]);
        });
      })
      .catch((error) => {
        console.error('Error connecting to SignalR hub:', error);
      });

    return (() => {
      connection?.stop();
    });

  }, []);

  const handleSendMessage = async (): Promise<void> => {
    if ((chatConnection?.state === signalr.HubConnectionState.Connected) && inputText.trim()) {
      await chatConnection.send('sendMessage', userName, inputText);
      setInputText('');
    }
  };

  return (
    <>
      <Container>
        <InputGroup>
          <Form.Control
            placeholder='User name'
            value={userName}
            onChange={(e): void => setUserName(e.target.value)}
          />
          <Form.Control
            placeholder='Message'
            value={inputText}
            onChange={(e): void => setInputText(e.target.value)}
          />
          <Button onClick={handleSendMessage}>Send message</Button>
        </InputGroup>

        <Table hover striped>
          <thead>
            <tr>
              <th>User name</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((message) => (
              <>
                <tr>
                  <td>{message.userName}</td>
                  <td>{message.message}</td>
                </tr>
              </>
            ))}
          </tbody>
        </Table>
      </Container>
    </>
  );

}

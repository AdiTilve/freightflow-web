import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

let stompClient = null;

/**
 * Connects to the backend STOMP endpoint and sets up subscriptions.
 *
 * @param {Object} handlers
 * @param {(id: string) => void} [handlers.onDelete]
 * @param {(assignment: Object) => void} [handlers.onCreate]
 * @param {(assignment: Object) => void} [handlers.onUpdate]
 * @param {(flight: Object) => void} [handlers.onUpdateFlight]
 */
export const connectWebSocket = ({ onDelete, onCreate, onUpdate, onUpdateFlight }) => {
  const socket = new SockJS('/ws');
  stompClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
    debug: (str) => console.log('[STOMP]', str),

    onConnect: () => {
      console.log('[STOMP] Connected');

      if (onDelete) {
        stompClient.subscribe('/all/deleteAssignment', ({ body }) => {
          console.log('[STOMP] deleteAssignment →', body);
          onDelete(body);
        });
      }

      if (onCreate) {
        stompClient.subscribe('/all/createAssignment', ({ body }) => {
          const created = JSON.parse(body);
          console.log('[STOMP] createAssignment →', created);
          onCreate(created);
        });
      }

      if (onUpdate) {
        stompClient.subscribe('/all/updateAssignment', ({ body }) => {
          const updated = JSON.parse(body);
          console.log('[STOMP] updateAssignment →', updated);
          onUpdate(updated);
        });
      }

      if (onUpdateFlight) {
        stompClient.subscribe('/all/updateFlight', ({ body }) => {
          const updated = JSON.parse(body);
          console.log('[STOMP] updateFlight →', updated);
          onUpdateFlight(updated);
        });
      }
    },

    onStompError: (frame) => {
      console.error('[STOMP] error', frame.headers['message'], frame.body);
    },
  });

  stompClient.activate();
};

export const sendDeleteAssignment = (assignmentNumber) => {
  if (stompClient?.connected) {
    stompClient.publish({
      destination: '/app/deleteAssignment',
      body: assignmentNumber,
    });
  } else {
    console.warn('[STOMP] cannot delete, not connected');
  }
};

export const sendCreateAssignment = (assignment) => {
  if (stompClient?.connected) {
    stompClient.publish({
      destination: '/app/createAssignment',
      body: JSON.stringify(assignment),
    });
  } else {
    console.warn('[STOMP] cannot create, not connected');
  }
};

export const sendUpdateAssignment = (assignment) => {
  if (stompClient?.connected) {
    stompClient.publish({
      destination: '/app/application',
      body: JSON.stringify(assignment),
    });
  } else {
    console.warn('[STOMP] cannot update assignment, not connected');
  }
};

export const sendUpdateFlight = (flight) => {
  if (stompClient?.connected) {
    stompClient.publish({
      destination: '/app/updateFlight',
      body: JSON.stringify(flight),
    });
  } else {
    console.warn('[STOMP] cannot update flight, not connected');
  }
};
/**
 * 🌟 EraserBoard Real-Time Visual Collaboration Engine
 * Zero-latency multi-peer canvas & documentation synchronization.
 * Supports BroadcastChannel for instant local/multi-window synchronization,
 * peer presence heartbeats, live remote cursors, and interactive reactions.
 */

export const PEER_COLORS = [
  { id: 'indigo', name: 'Indigo', hex: '#6366f1', light: '#e0e7ff', text: '#4338ca' },
  { id: 'emerald', name: 'Emerald', hex: '#10b981', light: '#d1fae5', text: '#065f46' },
  { id: 'rose', name: 'Rose', hex: '#f43f5e', light: '#ffe4e6', text: '#9f1239' },
  { id: 'amber', name: 'Amber', hex: '#f59e0b', light: '#fef3c7', text: '#92400e' },
  { id: 'cyan', name: 'Cyan', hex: '#06b6d4', light: '#cffafe', text: '#155e75' },
  { id: 'purple', name: 'Purple', hex: '#a855f7', light: '#f3e8ff', text: '#6b21a8' },
  { id: 'sky', name: 'Sky', hex: '#0ea5e9', light: '#e0f2fe', text: '#0369a1' },
  { id: 'pink', name: 'Pink', hex: '#ec4899', light: '#fce7f3', text: '#9d174d' },
];

export const EMOJI_REACTIONS = ['👍', '❤️', '🚀', '🎉', '💡', '🔥', '👀', '✨'];

const ROLE_NAMES = [
  'Systems Architect',
  'Lead Designer',
  'Tech Lead',
  'Cloud Engineer',
  'Product Dev',
  'Frontend Ninja',
  'DevOps Specialist',
  'Visual Thinker',
];

export function generateRoomId() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `ERASER-${num}`;
}

export function getLocalUser() {
  try {
    const savedId = localStorage.getItem('eraserboard_collab_uid');
    const savedName = localStorage.getItem('eraserboard_collab_uname');
    const savedColor = localStorage.getItem('eraserboard_collab_color');

    const id = savedId || `peer_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const randomRole = ROLE_NAMES[Math.floor(Math.random() * ROLE_NAMES.length)];
    const name = savedName || `${randomRole} #${Math.floor(100 + Math.random() * 900)}`;
    const randomColor = PEER_COLORS[Math.floor(Math.random() * PEER_COLORS.length)].hex;
    const color = savedColor || randomColor;

    if (!savedId) localStorage.setItem('eraserboard_collab_uid', id);
    if (!savedName) localStorage.setItem('eraserboard_collab_uname', name);
    if (!savedColor) localStorage.setItem('eraserboard_collab_color', color);

    return { id, name, color };
  } catch {
    return {
      id: `peer_${Date.now()}`,
      name: 'Collaborator',
      color: '#6366f1',
    };
  }
}

export function saveLocalUser(name, color) {
  try {
    if (name) localStorage.setItem('eraserboard_collab_uname', name);
    if (color) localStorage.setItem('eraserboard_collab_color', color);
  } catch {
    // Ignore storage issues
  }
}

/**
 * Creates a collaboration session over BroadcastChannel
 */
export class CollabSession {
  constructor(roomId, localUser, onEvent) {
    this.roomId = roomId;
    this.localUser = localUser;
    this.onEvent = onEvent;
    this.channel = null;
    this.heartbeatTimer = null;
    this.isClosed = false;

    this.init();
  }

  init() {
    try {
      this.channel = new BroadcastChannel(`eraserboard_room_${this.roomId}`);
      this.channel.onmessage = (event) => {
        if (this.isClosed || !event.data) return;
        const msg = event.data;
        // Ignore messages originating from ourselves
        if (msg.senderId === this.localUser.id) return;
        this.onEvent(msg);
      };

      // Announce arrival to room
      this.broadcast('PEER_JOIN', {
        user: this.localUser,
      });

      // Start presence heartbeat every 2.5 seconds
      this.heartbeatTimer = setInterval(() => {
        this.broadcast('HEARTBEAT', {
          user: this.localUser,
        });
      }, 2500);

      // Handle window unload
      this.unloadHandler = () => {
        this.broadcast('PEER_LEAVE', {
          userId: this.localUser.id,
        });
      };
      window.addEventListener('beforeunload', this.unloadHandler);
    } catch (err) {
      console.warn('BroadcastChannel initialization failed:', err);
    }
  }

  broadcast(type, payload = {}) {
    if (this.isClosed || !this.channel) return;
    try {
      this.channel.postMessage({
        type,
        roomId: this.roomId,
        senderId: this.localUser.id,
        timestamp: Date.now(),
        ...payload,
      });
    } catch (err) {
      console.warn('Error broadcasting message:', err);
    }
  }

  updateProfile(name, color) {
    this.localUser = { ...this.localUser, name, color };
    saveLocalUser(name, color);
    this.broadcast('PROFILE_UPDATE', {
      user: this.localUser,
    });
  }

  sendCursor(worldX, worldY, activeTool) {
    this.broadcast('CURSOR_MOVE', {
      user: this.localUser,
      x: worldX,
      y: worldY,
      activeTool,
    });
  }

  sendShapesUpdate(shapes, action = 'update') {
    this.broadcast('SHAPES_UPDATE', {
      shapes,
      action,
      user: this.localUser,
    });
  }

  sendDocsUpdate(content) {
    this.broadcast('DOCS_UPDATE', {
      content,
      user: this.localUser,
    });
  }

  sendReaction(emoji, worldX, worldY) {
    this.broadcast('REACTION', {
      id: `rx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user: this.localUser,
      emoji,
      x: worldX,
      y: worldY,
    });
  }

  requestSync() {
    this.broadcast('REQUEST_SYNC', {
      user: this.localUser,
    });
  }

  sendSyncState(shapes, docName, docsContent, canvasBg) {
    this.broadcast('SYNC_STATE', {
      shapes,
      docName,
      docsContent,
      canvasBg,
      user: this.localUser,
    });
  }

  close() {
    if (this.isClosed) return;
    this.isClosed = true;

    try {
      this.broadcast('PEER_LEAVE', {
        userId: this.localUser.id,
      });
    } catch {
      // Ignore
    }

    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.unloadHandler) window.removeEventListener('beforeunload', this.unloadHandler);

    if (this.channel) {
      try {
        this.channel.close();
      } catch {
        // Ignore
      }
      this.channel = null;
    }
  }
}

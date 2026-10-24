import { useState, useEffect, useRef, useCallback } from 'react';
import {
  CollabSession,
  getLocalUser,
  saveLocalUser,
  generateRoomId,
} from '../utils/collaboration';

export function useCollaboration({
  shapes,
  docName,
  docsContent,
  canvasBg,
  setShapes,
  setDocName,
  setDocsContent,
  setCanvasBg,
}) {
  const [roomId, setRoomId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [localUser, setLocalUser] = useState(() => getLocalUser());
  const [peers, setPeers] = useState({});
  const [reactions, setReactions] = useState([]);

  const sessionRef = useRef(null);
  const lastCursorSent = useRef(0);
  const isRemoteShapesUpdate = useRef(false);
  const isRemoteDocsUpdate = useRef(false);
  const shapesRef = useRef(shapes);
  const docNameRef = useRef(docName);
  const docsContentRef = useRef(docsContent);
  const canvasBgRef = useRef(canvasBg);

  // Keep references fresh for incoming sync requests
  useEffect(() => { shapesRef.current = shapes; }, [shapes]);
  useEffect(() => { docNameRef.current = docName; }, [docName]);
  useEffect(() => { docsContentRef.current = docsContent; }, [docsContent]);
  useEffect(() => { canvasBgRef.current = canvasBg; }, [canvasBg]);

  // Auto-broadcast local shape changes to peers
  useEffect(() => {
    if (isRemoteShapesUpdate.current) {
      isRemoteShapesUpdate.current = false;
      return;
    }
    if (isConnected && sessionRef.current) {
      sessionRef.current.sendShapesUpdate(shapes);
    }
  }, [shapes, isConnected]);

  // Auto-broadcast local docs changes to peers
  useEffect(() => {
    if (isRemoteDocsUpdate.current) {
      isRemoteDocsUpdate.current = false;
      return;
    }
    if (isConnected && sessionRef.current) {
      sessionRef.current.sendDocsUpdate(docsContent);
    }
  }, [docsContent, isConnected]);

  // Clean stale reactions after 3.5s
  useEffect(() => {
    if (reactions.length === 0) return;
    const interval = setInterval(() => {
      const now = Date.now();
      setReactions((prev) => prev.filter((r) => now - r.timestamp < 3500));
    }, 500);
    return () => clearInterval(interval);
  }, [reactions.length]);

  // Clean stale peers (no heartbeat in 8s)
  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => {
      const now = Date.now();
      setPeers((prev) => {
        let changed = false;
        const next = { ...prev };
        for (const [id, peer] of Object.entries(next)) {
          if (now - peer.lastSeen > 8000) {
            delete next[id];
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [isConnected]);

  // Handle incoming events from the channel
  const handleEvent = useCallback((msg) => {
    const { type, senderId, user, timestamp = Date.now() } = msg;

    switch (type) {
      case 'PEER_JOIN':
      case 'HEARTBEAT':
      case 'PROFILE_UPDATE': {
        if (!user || !user.id) break;
        setPeers((prev) => ({
          ...prev,
          [user.id]: {
            ...prev[user.id],
            ...user,
            lastSeen: timestamp,
          },
        }));

        // If a new peer joined, and we were already connected, send them our state
        if (type === 'PEER_JOIN' && sessionRef.current) {
          sessionRef.current.sendSyncState(
            shapesRef.current,
            docNameRef.current,
            docsContentRef.current,
            canvasBgRef.current
          );
        }
        break;
      }

      case 'PEER_LEAVE': {
        const targetId = msg.userId || senderId;
        setPeers((prev) => {
          const next = { ...prev };
          delete next[targetId];
          return next;
        });
        break;
      }

      case 'CURSOR_MOVE': {
        if (!user || !user.id) break;
        setPeers((prev) => ({
          ...prev,
          [user.id]: {
            ...prev[user.id],
            ...user,
            lastSeen: timestamp,
            cursor: {
              x: msg.x,
              y: msg.y,
              activeTool: msg.activeTool,
            },
          },
        }));
        break;
      }

      case 'SHAPES_UPDATE': {
        if (Array.isArray(msg.shapes)) {
          isRemoteShapesUpdate.current = true;
          setShapes(msg.shapes);
        }
        break;
      }

      case 'DOCS_UPDATE': {
        if (typeof msg.content === 'string') {
          isRemoteDocsUpdate.current = true;
          setDocsContent(msg.content);
        }
        break;
      }

      case 'REACTION': {
        if (msg.emoji) {
          setReactions((prev) => [
            ...prev.slice(-15), // keep max 15 active
            {
              id: msg.id || `rx_${Date.now()}`,
              emoji: msg.emoji,
              x: msg.x,
              y: msg.y,
              user: msg.user,
              timestamp: Date.now(),
            },
          ]);
        }
        break;
      }

      case 'REQUEST_SYNC': {
        if (sessionRef.current) {
          sessionRef.current.sendSyncState(
            shapesRef.current,
            docNameRef.current,
            docsContentRef.current,
            canvasBgRef.current
          );
        }
        break;
      }

      case 'SYNC_STATE': {
        if (Array.isArray(msg.shapes)) {
          isRemoteShapesUpdate.current = true;
          setShapes(msg.shapes);
        }
        if (msg.docName) setDocName(msg.docName);
        if (typeof msg.docsContent === 'string') {
          isRemoteDocsUpdate.current = true;
          setDocsContent(msg.docsContent);
        }
        if (msg.canvasBg) setCanvasBg(msg.canvasBg);
        break;
      }

      default:
        break;
    }
  }, [setShapes, setDocName, setDocsContent, setCanvasBg]);

  // Connect to a collaboration room
  const connectToRoom = useCallback((targetRoomId) => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }

    const cleanRoomId = (targetRoomId || generateRoomId()).trim().toUpperCase();
    setRoomId(cleanRoomId);
    setPeers({});

    const session = new CollabSession(cleanRoomId, localUser, handleEvent);
    sessionRef.current = session;
    setIsConnected(true);

    // Request synchronization from any existing peers in this room
    setTimeout(() => {
      session.requestSync();
    }, 300);

    // Save active room in session storage
    try {
      sessionStorage.setItem('eraserboard_collab_room', cleanRoomId);
    } catch {
      // Ignore
    }

    return cleanRoomId;
  }, [localUser, handleEvent]);

  // Disconnect from room
  const leaveRoom = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setIsConnected(false);
    setRoomId(null);
    setPeers({});
    setReactions([]);
    try {
      sessionStorage.removeItem('eraserboard_collab_room');
    } catch {
      // Ignore
    }
  }, []);

  // Update profile
  const updateProfile = useCallback((name, color) => {
    const updated = { ...localUser, name, color };
    setLocalUser(updated);
    saveLocalUser(name, color);
    if (sessionRef.current) {
      sessionRef.current.updateProfile(name, color);
    }
  }, [localUser]);

  // Send cursor position with 30ms throttling
  const sendCursor = useCallback((worldX, worldY, activeTool) => {
    if (!isConnected || !sessionRef.current) return;
    const now = performance.now();
    if (now - lastCursorSent.current < 25) return;
    lastCursorSent.current = now;
    sessionRef.current.sendCursor(worldX, worldY, activeTool);
  }, [isConnected]);

  // Broadcast shape modifications
  const broadcastShapes = useCallback((newShapes, action = 'update') => {
    if (!isConnected || !sessionRef.current) return;
    sessionRef.current.sendShapesUpdate(newShapes, action);
  }, [isConnected]);

  // Broadcast docs update
  const broadcastDocs = useCallback((content) => {
    if (!isConnected || !sessionRef.current) return;
    sessionRef.current.sendDocsUpdate(content);
  }, [isConnected]);

  // Broadcast reaction ping
  const broadcastReaction = useCallback((emoji, worldX, worldY) => {
    if (!isConnected || !sessionRef.current) return;
    sessionRef.current.sendReaction(emoji, worldX, worldY);
  }, [isConnected]);

  // Check URL query parameters or session storage on startup
  useEffect(() => {
    let timer;
    try {
      const params = new URLSearchParams(window.location.search);
      const urlRoom = params.get('room');
      const savedRoom = sessionStorage.getItem('eraserboard_collab_room');
      const targetRoom = urlRoom || savedRoom;

      if (targetRoom) {
        timer = setTimeout(() => connectToRoom(targetRoom), 20);
      }
    } catch {
      // Ignore
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (sessionRef.current) {
        sessionRef.current.close();
      }
    };
  }, [connectToRoom]);

  return {
    roomId,
    isConnected,
    localUser,
    peers,
    peersCount: Object.keys(peers).length,
    reactions,
    connectToRoom,
    leaveRoom,
    updateProfile,
    sendCursor,
    broadcastShapes,
    broadcastDocs,
    broadcastReaction,
  };
}

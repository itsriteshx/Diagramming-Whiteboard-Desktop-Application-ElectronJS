import { useState } from 'react';
import {
  X,
  Users,
  Copy,
  Check,
  Radio,
  ExternalLink,
  Sparkles,
  LogOut,
  ArrowRight,
  UserCheck,
  ShieldAlert,
  Send,
} from 'lucide-react';
import { PEER_COLORS, EMOJI_REACTIONS } from '../../utils/collaboration';

export function CollabModal({
  isOpen,
  onClose,
  roomId,
  isConnected,
  localUser,
  peers,
  peersCount,
  onConnect,
  onLeave,
  onUpdateProfile,
  onSendReaction,
}) {
  const [inputRoomId, setInputRoomId] = useState('');
  const [userName, setUserName] = useState(localUser.name);
  const [selectedColor, setSelectedColor] = useState(localUser.color);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [reactionSent, setReactionSent] = useState(null);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    if (!roomId) return;
    navigator.clipboard?.writeText(roomId);
    if (window.electronAPI?.copyTextToClipboard) {
      window.electronAPI.copyTextToClipboard(roomId);
    }
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyLink = () => {
    if (!roomId) return;
    const url = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(roomId)}`;
    navigator.clipboard?.writeText(url);
    if (window.electronAPI?.copyTextToClipboard) {
      window.electronAPI.copyTextToClipboard(url);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleOpenSecondWindow = () => {
    if (!roomId) return;
    if (window.electronAPI?.openCollabWindow) {
      window.electronAPI.openCollabWindow(roomId);
    } else {
      window.open(`${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(roomId)}`, '_blank');
    }
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    if (!userName.trim()) return;
    onUpdateProfile(userName.trim(), selectedColor);
  };

  const handleQuickJoin = (e) => {
    e.preventDefault();
    if (!inputRoomId.trim()) return;
    onConnect(inputRoomId.trim());
    setInputRoomId('');
  };

  const handleTriggerReaction = (emoji) => {
    onSendReaction(emoji);
    setReactionSent(emoji);
    setTimeout(() => setReactionSent(null), 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-zinc-100">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isConnected
                ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30'
                : 'bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/30'
            }`}>
              <Users size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold tracking-tight">Live Visual Collaboration</h2>
                {isConnected && (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live ({peersCount + 1} online)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400">
                Multi-peer real-time whiteboard canvas & document synchronization
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {isConnected ? (
            /* Connected State */
            <div className="space-y-4">
              {/* Room ID Badge & Share */}
              <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                    Current Room Code
                  </span>
                  <span className="text-[11px] text-indigo-400 font-medium">
                    Zero-latency P2P Mesh
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700/60 font-mono text-base font-bold text-white tracking-wider flex items-center justify-between">
                    <span>{roomId}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>

                  <button
                    onClick={handleCopyCode}
                    className="h-10 px-3 flex items-center gap-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors cursor-pointer"
                    title="Copy Room ID"
                  >
                    {copiedId ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copiedId ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handleCopyLink}
                    className="h-10 px-3 flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-colors cursor-pointer"
                    title="Copy Invite URL"
                  >
                    {copiedLink ? <Check size={14} /> : <ExternalLink size={14} />}
                    <span>{copiedLink ? 'Link Copied' : 'Invite'}</span>
                  </button>
                </div>

                {/* Launch Second Window */}
                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400">
                    Test live collaboration locally side-by-side:
                  </span>
                  <button
                    onClick={handleOpenSecondWindow}
                    className="flex items-center gap-1 text-[11px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                  >
                    <span>Launch 2nd Window</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>

              {/* Live Canvas Reactions Dock */}
              <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/60 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1 font-medium">
                    <Sparkles size={12} className="text-amber-400" />
                    Send Live Floating Reaction
                  </span>
                  {reactionSent && (
                    <span className="text-emerald-400 font-semibold animate-pulse">
                      Sent {reactionSent}!
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-1">
                  {EMOJI_REACTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleTriggerReaction(emoji)}
                      className="w-9 h-9 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-lg hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                      title={`Send ${emoji} to canvas`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Participants List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                  <span>Participants ({peersCount + 1})</span>
                  <span>Presence</span>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {/* Local User Card */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white shadow-sm"
                        style={{ backgroundColor: localUser.color }}
                      >
                        {localUser.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-zinc-200">{localUser.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 font-medium">
                          You (Host)
                        </span>
                      </div>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>

                  {/* Remote Peers Cards */}
                  {Object.values(peers).map((peer) => (
                    <div
                      key={peer.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/60"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white shadow-sm"
                          style={{ backgroundColor: peer.color || '#6366f1' }}
                        >
                          {(peer.name || 'P').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium text-zinc-200">{peer.name || 'Collaborator'}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                            Active
                          </span>
                        </div>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                  ))}

                  {peersCount === 0 && (
                    <div className="p-3 text-center rounded-lg border border-dashed border-zinc-800 text-xs text-zinc-500">
                      Waiting for other collaborators to join room...
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Disconnected / Join State */
            <div className="space-y-4">
              {/* Create New Session */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 via-zinc-900 to-zinc-900 border border-indigo-500/20 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xs font-semibold text-white">Start New Collaboration Session</h3>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Generate an instant peer-to-peer room for live diagramming
                    </p>
                  </div>
                  <Radio size={16} className="text-indigo-400 animate-pulse shrink-0" />
                </div>

                <button
                  onClick={() => onConnect()}
                  className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Users size={14} />
                  <span>Create Live Room</span>
                </button>
              </div>

              {/* Or Join Existing */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-zinc-800 w-full" />
                <span className="bg-zinc-900 px-3 text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">
                  Or Join Existing Room
                </span>
                <div className="border-t border-zinc-800 w-full" />
              </div>

              <form onSubmit={handleQuickJoin} className="space-y-2">
                <label className="text-[11px] font-medium text-zinc-400">Room Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputRoomId}
                    onChange={(e) => setInputRoomId(e.target.value.toUpperCase())}
                    placeholder="e.g. ERASER-4891"
                    className="flex-1 px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!inputRoomId.trim()}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                      inputRoomId.trim()
                        ? 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-600'
                        : 'bg-zinc-800/40 text-zinc-600 cursor-not-allowed'
                    }`}
                  >
                    <span>Join</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* User Profile Settings */}
          <div className="pt-3 border-t border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                Your Collaboration Identity
              </span>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Your display name"
                  className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors cursor-pointer"
                >
                  Save
                </button>
              </div>

              {/* Avatar Color Picker */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-zinc-500">Cursor Color:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {PEER_COLORS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedColor(c.hex);
                        onUpdateProfile(userName, c.hex);
                      }}
                      className={`w-5 h-5 rounded-full transition-transform cursor-pointer ${
                        selectedColor === c.hex
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110'
                          : 'hover:scale-105 opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800/80 bg-zinc-950/60 flex items-center justify-between text-xs">
          {isConnected ? (
            <button
              onClick={onLeave}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 transition-colors cursor-pointer"
            >
              <LogOut size={13} />
              <span>Leave Room</span>
            </button>
          ) : (
            <span className="text-[11px] text-zinc-500">
              Zero configuration required · Syncs automatically across windows
            </span>
          )}

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false)
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const ref = useRef(null)

  // fetch notifications
  useEffect(() => {
    if (!open) return
    setLoading(true)
    axios.get('http://localhost:5000/api/notifications', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(r => setNotes(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [open])

  // close on outside click
  useEffect(() => {
    const onClick = e => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const handleMarkRead = async id => {
    await axios.put(
      `http://localhost:5000/api/notifications/${id}/read`,
      {},
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    )
    setNotes(notes.map(n => n._id === id ? { ...n, read: true } : n))
  }

  const unreadCount = notes.filter(n => !n.read).length

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{ position: 'relative', cursor: 'pointer' }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: -4,
            right: -4,
            background: 'red',
            color: 'white',
            borderRadius: '50%',
            padding: '0 6px',
            fontSize: '0.75rem'
          }}>
            {unreadCount}
          </span>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: 'absolute',
              right: 0,
              top: '120%',
              width: 300,
              maxHeight: 400,
              overflowY: 'auto',
              background: 'white',
              border: '1px solid #ddd',
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              zIndex: 2000,
              padding: 8
            }}
          >
            {loading
              ? <p style={{ textAlign:'center' }}>Loading…</p>
              : notes.length === 0
                ? <p style={{ textAlign:'center' }}>No notifications</p>
                : notes.map(n => (
                    <div
                      key={n._id}
                      onClick={() => handleMarkRead(n._id)}
                      style={{
                        padding: '0.5rem',
                        background: n.read ? '#fafafa' : '#e8f0ff',
                        borderRadius: 4,
                        marginBottom: 4,
                        cursor: 'pointer'
                      }}
                    >
                      <small style={{ color:'#999' }}>
                        {new Date(n.createdAt).toLocaleString()}
                      </small>
                      <div>{n.message}</div>
                    </div>
                  ))
            }
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

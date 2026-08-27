// studentos-mobile/App.tsx
import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { fetchSyncedDataFromDesktop } from './src/services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<'notes' | 'timetable' | 'tasks'>('notes');
  const [notes, setNotes] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastSynced, setLastSynced] = useState<string>('Never');
  const [statusMsg, setStatusMsg] = useState<string>('');

  // Selected Note for Full View Modal
  const [selectedNote, setSelectedNote] = useState<any | null>(null);

  const handleSync = async () => {
    setLoading(true);
    setStatusMsg('Connecting to Laptop Server...');
    
    const data = await fetchSyncedDataFromDesktop();
    setLoading(false);

    if (data && data.success) {
      setNotes(data.notes || []);
      setTasks(data.tasks || []);
      setTimetable(data.timetable || []);
      setLastSynced(new Date().toLocaleTimeString());
      setStatusMsg('✅ Synced successfully over Local Wi-Fi!');
    } else {
      setStatusMsg(`❌ Sync Failed: ${data?.error || 'Server Unreachable'}`);
    }
  };

  // Bunk Predictor Calculation Logic (Threshold 75%)
  const calculateBunkStatus = (attended: number, total: number) => {
    const currentPercentage = Math.round((attended / total) * 100);
    const maxBunksAllowed = Math.floor((attended - 0.75 * total) / 0.75);
    
    if (currentPercentage < 75) {
      return { text: `Danger (${currentPercentage}%) - Attend Next Class!`, color: '#ef4444' };
    } else if (maxBunksAllowed > 0) {
      return { text: `Safe (${currentPercentage}%) - Can bunk ${maxBunksAllowed} class(es)`, color: '#22c55e' };
    } else {
      return { text: `Borderline (${currentPercentage}%) - Do NOT Bunk`, color: '#f59e0b' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>StudentOS Companion 📱</Text>
        <Text style={styles.headerSubtitle}>Last Synced: {lastSynced}</Text>
      </View>

      {/* Sync Button */}
      <TouchableOpacity 
        style={[styles.syncBanner, loading && { opacity: 0.7 }]} 
        onPress={handleSync}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.syncText}>🔄 Tap to Sync with Laptop (Local Wi-Fi)</Text>
        )}
      </TouchableOpacity>

      {/* Status Box */}
      {statusMsg ? (
        <View style={styles.statusBox}>
          <Text style={styles.statusText}>{statusMsg}</Text>
        </View>
      ) : null}

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'notes' && styles.activeTab]} 
          onPress={() => setActiveTab('notes')}
        >
          <Text style={[styles.tabText, activeTab === 'notes' && styles.activeTabText]}>📝 Notes ({notes.length})</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'timetable' && styles.activeTab]} 
          onPress={() => setActiveTab('timetable')}
        >
          <Text style={[styles.tabText, activeTab === 'timetable' && styles.activeTabText]}>📅 Timetable ({timetable.length})</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'tasks' && styles.activeTab]} 
          onPress={() => setActiveTab('tasks')}
        >
          <Text style={[styles.tabText, activeTab === 'tasks' && styles.activeTabText]}>📋 Tasks ({tasks.length})</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.contentSection}>
        {/* TAB 1: NOTES */}
        {activeTab === 'notes' && (
          notes.length === 0 ? (
            <Text style={styles.emptyText}>No notes synced yet. Tap Sync button above.</Text>
          ) : (
            <FlatList
              data={notes}
              keyExtractor={(item) => (item.id ? item.id.toString() : Math.random().toString())}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.card} onPress={() => setSelectedNote(item)}>
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>{item.category || item.subject || 'General'}</Text>
                  </View>
                  <Text style={styles.cardTitle}>{item.title || 'Untitled Note'}</Text>
                  <Text style={styles.cardContent} numberOfLines={2}>
                    {item.content || item.body || 'Tap to view full note details...'}
                  </Text>
                  <Text style={styles.readMoreText}>Tap to read full note 📖</Text>
                </TouchableOpacity>
              )}
            />
          )
        )}

        {/* TAB 2: TIMETABLE & BUNK PREDICTOR */}
        {activeTab === 'timetable' && (
          timetable.length === 0 ? (
            <Text style={styles.emptyText}>No timetable synced yet. Tap Sync button above.</Text>
          ) : (
            <FlatList
              data={timetable}
              keyExtractor={(item) => (item.id ? item.id.toString() : Math.random().toString())}
              renderItem={({ item }) => {
                const bunk = calculateBunkStatus(item.attended || 15, item.totalClasses || 20);
                return (
                  <View style={styles.card}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.cardTitle}>{item.subject}</Text>
                      <View style={[styles.bunkBadge, { backgroundColor: bunk.color + '22', borderColor: bunk.color }]}>
                        <Text style={[styles.bunkBadgeText, { color: bunk.color }]}>{bunk.text}</Text>
                      </View>
                    </View>
                    <Text style={styles.timeText}>🕒 {item.time || item.startTime} | 🏫 {item.room || 'Room TBD'}</Text>
                    <Text style={styles.attendanceText}>Attendance: {item.attended || 0}/{item.totalClasses || 0} classes attended</Text>
                  </View>
                );
              }}
            />
          )
        )}

        {/* TAB 3: TASKS KANBAN LIST */}
        {activeTab === 'tasks' && (
          tasks.length === 0 ? (
            <Text style={styles.emptyText}>No tasks synced yet. Tap Sync button above.</Text>
          ) : (
            <FlatList
              data={tasks}
              keyExtractor={(item) => (item.id ? item.id.toString() : Math.random().toString())}
              renderItem={({ item }) => (
                <View style={[styles.card, item.completed && { opacity: 0.6 }]}>
                  <View style={styles.rowBetween}>
                    <View style={[styles.priorityBadge, item.priority === 'HIGH' ? styles.highPriority : styles.medPriority]}>
                      <Text style={styles.priorityText}>{item.priority || 'MEDIUM'}</Text>
                    </View>
                    <Text style={styles.statusBadgeText}>{item.completed ? '✅ Completed' : '⏳ Pending'}</Text>
                  </View>
                  <Text style={[styles.cardTitle, item.completed && styles.strikeThrough]}>{item.title}</Text>
                  <Text style={styles.timeText}>📅 Due: {item.dueDate || 'No Deadline'}</Text>
                </View>
              )}
            />
          )
        )}
      </View>

      {/* FULL NOTE DETAIL READER MODAL */}
      <Modal visible={!!selectedNote} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.modalContainer}>
          <StatusBar style="light" />
          {selectedNote && (
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>{selectedNote.category || selectedNote.subject || 'General'}</Text>
                </View>
                <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedNote(null)}>
                  <Text style={styles.closeButtonText}>✕ Close</Text>
                </TouchableOpacity>
              </View>

              {/* Note Title */}
              <Text style={styles.modalTitle}>{selectedNote.title || 'Untitled Note'}</Text>
              
              {/* Divider */}
              <View style={styles.divider} />

              {/* Note Content Text */}
              <ScrollView style={styles.modalScrollView}>
                <Text style={styles.modalNoteText}>
                  {selectedNote.content || selectedNote.body || 'No text content available for this note.'}
                </Text>
              </ScrollView>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', paddingHorizontal: 16, paddingTop: 30 },
  header: { marginTop: 15, marginBottom: 12 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#f8fafc' },
  headerSubtitle: { fontSize: 13, color: '#94a3b8', marginTop: 2 },
  syncBanner: { backgroundColor: '#3b82f6', padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  syncText: { color: '#ffffff', fontWeight: '600', fontSize: 14 },
  statusBox: { backgroundColor: '#1e293b', padding: 8, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#3b82f6' },
  statusText: { color: '#38bdf8', fontSize: 12, textAlign: 'center', fontWeight: '500' },
  
  // Tab Styling
  tabContainer: { flexDirection: 'row', backgroundColor: '#1e293b', borderRadius: 10, padding: 4, marginBottom: 16 },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: '#3b82f6' },
  tabText: { color: '#94a3b8', fontSize: 12, fontWeight: '600' },
  activeTabText: { color: '#ffffff' },

  contentSection: { flex: 1 },
  emptyText: { color: '#64748b', fontStyle: 'italic', marginTop: 20, textAlign: 'center' },
  
  // Card Styling
  card: { backgroundColor: '#1e293b', padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#334155' },
  badgeContainer: { alignSelf: 'flex-start', backgroundColor: '#334155', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginBottom: 6 },
  badgeText: { color: '#38bdf8', fontSize: 11, fontWeight: '600' },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#f1f5f9', marginBottom: 4 },
  cardContent: { fontSize: 13, color: '#94a3b8' },
  readMoreText: { fontSize: 12, color: '#38bdf8', marginTop: 8, fontWeight: '500' },
  
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  timeText: { fontSize: 12, color: '#38bdf8', marginTop: 2 },
  attendanceText: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  
  bunkBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  bunkBadgeText: { fontSize: 11, fontWeight: 'bold' },
  
  priorityBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  highPriority: { backgroundColor: '#ef4444' },
  medPriority: { backgroundColor: '#f59e0b' },
  priorityText: { color: '#ffffff', fontSize: 10, fontWeight: 'bold' },
  statusBadgeText: { color: '#94a3b8', fontSize: 12 },
  strikeThrough: { textDecorationLine: 'line-through', color: '#64748b' },

  // Modal Reader Styling
  modalContainer: { flex: 1, backgroundColor: '#0f172a' },
  modalContent: { flex: 1, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  closeButton: { backgroundColor: '#334155', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  closeButtonText: { color: '#f8fafc', fontSize: 13, fontWeight: '600' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#f1f5f9', marginBottom: 12 },
  divider: { height: 1, backgroundColor: '#334155', marginBottom: 16 },
  modalScrollView: { flex: 1 },
  modalNoteText: { fontSize: 15, color: '#cbd5e1', lineHeight: 24 }
});
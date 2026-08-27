// App.tsx
import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Dummy data for testing UI layout (Yeh baad mein SQLite / Laptop se sync hoga)
const recentNotes = [
  { id: '1', title: 'Data Structures: AVL Trees', category: 'CS-201', updatedAt: 'Today, 2:15 PM' },
  { id: '2', title: 'Calculus III - Stokes Theorem', category: 'MTH-301', updatedAt: 'Yesterday' },
];

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>StudentOS Mobile 📱</Text>
        <Text style={styles.headerSubtitle}>Laptop Synced: Offline Mode</Text>
      </View>

      {/* Sync Status Banner */}
      <TouchableOpacity style={styles.syncBanner} onPress={() => alert('Scanning local Wi-Fi for StudentOS Desktop...')}>
        <Text style={styles.syncText}>🔄 Tap to Sync with Laptop (Local Wi-Fi)</Text>
      </TouchableOpacity>

      {/* Quick Notes Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent University Notes</Text>
        <FlatList
          data={recentNotes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{item.category}</Text>
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDate}>{item.updatedAt}</Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // Dark mode theme matching your desktop app
    paddingHorizontal: 16,
  },
  header: {
    marginTop: 20,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  syncBanner: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  syncText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  badgeText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#f1f5f9',
    marginBottom: 6,
  },
  cardDate: {
    fontSize: 12,
    color: '#64748b',
  },
});
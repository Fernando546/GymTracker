import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-chart-kit';
import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function WeightProgress() {
  const { user } = useAuth();
  const [currentWeight, setCurrentWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [entries, setEntries] = useState<{ date: string; weight: number }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [todayWeight, setTodayWeight] = useState('');
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const loadWeights = async () => {
      if (!user?.uid) return;
      
      const weightDoc = await getDoc(doc(db, 'users', user.uid, 'weight', 'goals'));
      if (weightDoc.exists()) {
        setCurrentWeight(weightDoc.data().current.toString());
        setTargetWeight(weightDoc.data().target.toString());
        setEditMode(false);
      }

      const q = query(
        collection(db, 'users', user.uid, 'weightEntries'),
        orderBy('timestamp', 'desc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          date: doc.data().timestamp.toDate().toISOString().split('T')[0],
          weight: doc.data().weight
        }));
        console.log('Weight entries:', data);
        setEntries(data);
      });

      return () => unsubscribe();
    };

    loadWeights();
  }, [user?.uid]);

  const saveGoals = async () => {
    if (!user?.uid) return;
    await setDoc(doc(db, 'users', user.uid, 'weight', 'goals'), {
      current: parseFloat(currentWeight),
      target: parseFloat(targetWeight)
    });
  };

  const addTodayWeight = async () => {
    if (!user?.uid || !todayWeight) return;
    const today = new Date().toISOString().split('T')[0];
    await setDoc(doc(db, 'users', user.uid, 'weightEntries', today), {
      weight: parseFloat(todayWeight),
      timestamp: new Date()
    });
    setShowForm(false);
    setTodayWeight('');
  };

  const chartData = {
    labels: entries.slice().reverse().map(e => new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [{
      data: entries.slice().reverse().map(e => e.weight),
      color: (opacity = 1) => `rgba(124, 77, 255, ${opacity})`,
      strokeWidth: 2
    }]
  };

  return (
    <LinearGradient colors={['#080808', '#101010', '#181818']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color="#7C4DFF" 
            onPress={() => router.back()}
          />
          <Text style={styles.title}>Weight Progress</Text>
          <View style={{ width: 24 }} />
        </View>

        {(!currentWeight || !targetWeight || editMode) ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {currentWeight && targetWeight ? "Edit Goals" : "Set Your Goals"}
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                label="Current Weight (kg)"
                value={currentWeight}
                onChangeText={setCurrentWeight}
                keyboardType="numeric"
                style={styles.input}
                mode="outlined"
                theme={{ colors: { primary: '#7C4DFF' }}}
              />
              <TextInput
                label="Target Weight (kg)"
                value={targetWeight}
                onChangeText={setTargetWeight}
                keyboardType="numeric"
                style={styles.input}
                mode="outlined"
                theme={{ colors: { primary: '#7C4DFF' }}}
              />
            </View>
            <Button 
              mode="contained" 
              onPress={() => {
                saveGoals();
                setEditMode(false);
              }}
              buttonColor="#7C4DFF"
              style={styles.button}
            >
              {currentWeight && targetWeight ? "Update Goals" : "Save Goals"}
            </Button>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.goalsHeader}>
              <Text style={styles.cardTitle}>Weight Goals</Text>
              <Button 
                mode="text" 
                onPress={() => setEditMode(true)}
                textColor="#7C4DFF"
              >
                Edit
              </Button>
            </View>
            <View style={styles.goalsContainer}>
              <View style={styles.goalItem}>
                <Text style={styles.goalLabel}>Starting Weight</Text>
                <Text style={styles.goalValue}>{currentWeight} kg</Text>
              </View>
              <View style={styles.goalItem}>
                <Text style={styles.goalLabel}>Target Weight</Text>
                <Text style={styles.goalValue}>{targetWeight} kg</Text>
              </View>
            </View>
          </View>
        )}

        {/* Progress Chart */}
        {entries.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Progress Overview</Text>
            <LineChart
              data={chartData}
              width={350}
              height={220}
              yAxisSuffix="kg"
              chartConfig={{
                backgroundColor: '#121212',
                backgroundGradientFrom: '#121212',
                backgroundGradientTo: '#121212',
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(124, 77, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: { borderRadius: 16 },
                propsForDots: { r: '4', strokeWidth: '2', stroke: '#7C4DFF' }
              }}
              bezier
              style={styles.chart}
              fromZero={true}
            />
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.emptyText}>
              Add at least 2 weight entries to see progress
            </Text>
          </View>
        )}

        {/* Add Today's Weight */}
        <Button 
          mode="contained" 
          onPress={() => setShowForm(true)}
          buttonColor="#7C4DFF"
          style={styles.button}
        >
          Add Today's Weight
        </Button>
      </ScrollView>

      {/* Modal overlay */}
      {showForm && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TextInput
                label="Today's Weight (kg)"
                value={todayWeight}
                onChangeText={setTodayWeight}
                keyboardType="numeric"
                mode="outlined"
                style={styles.modalInput}
                theme={{ colors: { primary: '#7C4DFF' }}}
                autoFocus={true}
              />
              <View style={styles.modalButtons}>
                <Button 
                  mode="outlined" 
                  onPress={() => setShowForm(false)}
                  style={styles.modalButton}
                  textColor="#7C4DFF"
                >
                  Cancel
                </Button>
                <Button 
                  mode="contained" 
                  onPress={addTodayWeight}
                  buttonColor="#7C4DFF"
                  style={styles.modalButton}
                >
                  Save
                </Button>
              </View>
            </View>
          </View>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  card: {
    backgroundColor: '#121212',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  button: {
    borderRadius: 8,
    marginTop: 8,
  },
  chart: {
    borderRadius: 12,
    marginTop: 16,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#121212',
    borderRadius: 12,
    padding: 24,
  },
  modalContent: {
    width: '100%',
  },
  modalInput: {
    backgroundColor: '#1a1a1a',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    minWidth: 100,
  },
  goalsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  goalItem: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  goalLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 8,
  },
  goalValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  emptyText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
}); 